import { type FC, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bot, Loader2, MessageSquare, Send, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/app/services/api";
import { useWebSocket } from "@/app/hooks/use-websocket";
import { useSyncContext } from "@/app/contexts/sync.context";
import { useDiagramStore, useSchemaStore } from "@/app/store";
import type {
  AiChatMessage,
  AiDonePayload,
  AiErrorPayload,
  AiSessionPayload,
  AiTokenPayload,
} from "@/app/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const HISTORY_LIMIT = 40;

export const AiChatPanel: FC = () => {
  const api = useApi();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, emit, on, off } = useWebSocket();
  const { parseDbml } = useSyncContext();
  const { diagramId, setDiagramId } = useDiagramStore();
  const { dbmlText, name, description, setDbmlText } = useSchemaStore();

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentDiagramId = useMemo(() => {
    if (diagramId) {
      return diagramId;
    }

    if (id && id !== "new") {
      return id;
    }

    return undefined;
  }, [diagramId, id]);

  const isSending = pendingRequestId !== null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      if (!currentDiagramId) {
        setMessages([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const response = await api.diagrams.getAiMessages(
          currentDiagramId,
          HISTORY_LIMIT
        );

        if (!mounted) {
          return;
        }

        if (response.status && response.data) {
          setMessages(
            response.data.map((message) => ({
              ...message,
              requestId:
                message.requestId ||
                `${message.role}-${message.createdAt || Date.now()}`,
              streaming: false,
            }))
          );
        } else {
          toast.error(response.error || "Failed to load AI chat history");
        }
      } catch (error: any) {
        if (mounted) {
          toast.error(error?.error || "Failed to load AI chat history");
        }
      } finally {
        if (mounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [api, currentDiagramId]);

  useEffect(() => {
    const handleSession = (payload: AiSessionPayload) => {
      setPendingRequestId(payload.requestId);

      setMessages((prev) => {
        const exists = prev.some(
          (message) =>
            message.requestId === payload.requestId && message.role === "assistant"
        );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          {
            requestId: payload.requestId,
            role: "assistant",
            content: "",
            streaming: true,
            diagramId: payload.diagramId,
          },
        ];
      });

      if (payload.diagramId && payload.diagramId !== currentDiagramId) {
        setDiagramId(payload.diagramId);
        if (id === "new") {
          navigate(`/diagram/${payload.diagramId}`, { replace: true });
        }
      }
    };

    const handleToken = (payload: AiTokenPayload) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.requestId === payload.requestId && message.role === "assistant"
            ? { ...message, streaming: true }
            : message
        )
      );
    };

    const handleDone = (payload: AiDonePayload) => {
      setPendingRequestId(null);

      setMessages((prev) => {
        const index = prev.findIndex(
          (message) =>
            message.requestId === payload.requestId && message.role === "assistant"
        );

        if (index === -1) {
          return [
            ...prev,
            {
              requestId: payload.requestId,
              role: "assistant",
              content: payload.assistantMessage,
              generatedDbml: payload.dbmlText,
              validDbml: payload.valid,
              parseErrors: payload.errors,
              streaming: false,
            },
          ];
        }

        const next = [...prev];
        const target = next[index];
        next[index] = {
          ...target,
          content: payload.assistantMessage || target.content,
          generatedDbml: payload.dbmlText,
          validDbml: payload.valid,
          parseErrors: payload.errors,
          streaming: false,
          diagramId: payload.diagramId,
        };
        return next;
      });

      if (payload.diagramId && payload.diagramId !== currentDiagramId) {
        setDiagramId(payload.diagramId);
        if (id === "new") {
          navigate(`/diagram/${payload.diagramId}`, { replace: true });
        }
      }

      if (payload.valid && payload.dbmlText) {
        setDbmlText(payload.dbmlText);
        parseDbml(payload.dbmlText);
        return;
      }

      if (!payload.valid) {
        const firstError = payload.errors?.[0]?.message;
        toast.error(firstError || "AI returned invalid DBML after repair attempt");
      }
    };

    const handleError = (payload: AiErrorPayload) => {
      setPendingRequestId(null);
      setMessages((prev) => {
        const requestId = payload.requestId;
        const next = prev.map((message) => {
          if (!message.streaming) {
            return message;
          }

          if (!requestId) {
            return { ...message, streaming: false };
          }

          if (
            message.requestId === requestId &&
            message.role === "assistant"
          ) {
            return { ...message, streaming: false };
          }

          return message;
        });

        const hasTargetMessage = requestId
          ? next.some(
              (message) =>
                message.requestId === requestId &&
                message.role === "assistant"
            )
          : false;

        if (!hasTargetMessage && requestId) {
          next.push({
            requestId,
            role: "assistant",
            content: payload.message || "AI request failed",
            streaming: false,
          });
        }

        return next;
      });
      toast.error(payload.message || "AI request failed");
    };

    on("ai:session", handleSession);
    on("ai:token", handleToken);
    on("ai:done", handleDone);
    on("ai:error", handleError);

    return () => {
      off("ai:session", handleSession);
      off("ai:token", handleToken);
      off("ai:done", handleDone);
      off("ai:error", handleError);
    };
  }, [
    currentDiagramId,
    id,
    navigate,
    off,
    on,
    parseDbml,
    setDbmlText,
    setDiagramId,
  ]);

  const handleSend = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isSending) {
      return;
    }

    if (!connected) {
      toast.error("WebSocket is disconnected. Reconnect and try again.");
      return;
    }

    const localRequestId = `local-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        requestId: localRequestId,
        role: "user",
        content: trimmedPrompt,
      },
    ]);

    setPendingRequestId(localRequestId);
    setPrompt("");

    emit("ai:prompt", {
      diagramId: currentDiagramId,
      prompt: trimmedPrompt,
      currentDbml: dbmlText,
      name,
      description,
    });
  };

  const handleClear = async () => {
    if (!currentDiagramId) {
      setMessages([]);
      return;
    }

    try {
      const response = await api.diagrams.clearAiMessages(currentDiagramId);
      if (response.status) {
        setMessages([]);
      } else {
        toast.error(response.error || "Failed to clear chat messages");
      }
    } catch (error: any) {
      toast.error(error?.error || "Failed to clear chat messages");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4" />
          <span>AI Assistant</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all AI messages for this diagram.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>
                Clear chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoadingHistory ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-5 w-5" />
            <p>Ask AI to generate or update DBML for this diagram.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const key = `${message.requestId}-${message.role}-${index}`;

              return (
                <div
                  key={key}
                  className={cn(
                    "flex w-full",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[90%] rounded-lg px-3 py-2 text-sm",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-1 text-xs opacity-80">
                      {isUser ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                      <span>{isUser ? "You" : "Assistant"}</span>
                      {message.streaming && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                    </div>
                    <p className="whitespace-pre-wrap break-words">
                      {message.content || (message.streaming ? "Thinking..." : "")}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="border-t p-3">
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the schema change you want..."
            className="min-h-[84px] resize-none"
            disabled={isSending}
          />
          <div className="flex items-center justify-end">
            <Button type="submit" size="sm" disabled={isSending || !prompt.trim()}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
