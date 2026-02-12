import { type FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/app/services/api";
import { useSchemaStore, useDiagramStore, useEditorPanelStore } from "@/app/store";
import { TextEditor } from "./text-editor";
import { DiagramPanel } from "./diagram-panel";
import { NodePropertyPanel } from "@/app/components/editor/node-property-panel";
import { AiChatPanel } from "@/app/components/editor/ai-chat-panel";
import { SyncProvider, useSyncContext } from "@/app/contexts/sync.context";
import { astToNodes, astToEdges } from "@/app/utils/ast-to-flow";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import type { DiagramStatus } from "@/app/types";

const EditorPageContent: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();
  const { setDbmlText, setAst, setErrors, setStatus, setName, setDescription, reset: resetSchema } = useSchemaStore();
  const { setDiagramId, setNodes, setEdges, reset: resetDiagram } =
    useDiagramStore();
  const { activeTab, setActiveTab, reset: resetEditorPanel } = useEditorPanelStore();
  const [loading, setLoading] = useState(true);
  const { parseDbml } = useSyncContext();
  const { setOpen: setSidebarOpen } = useSidebar();
  
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const loadDiagram = async () => {
      try {
        setLoading(true);
        resetSchema();
        resetDiagram();
        resetEditorPanel();

        if (id && id !== "new") {
          const response = await api.diagrams.getById(id);
          if (response.status && response.data) {
            setDbmlText(response.data.dbmlText);
            setDiagramId(response.data._id);
            
            if (response.data.name) {
              setName(response.data.name);
            }
            
            if (response.data.description) {
              setDescription(response.data.description);
            }
            
            if (response.data.ast) {
              setAst(response.data.ast);
            }
            
            if (response.data.errors) {
              setErrors(response.data.errors);
            }
            
            if (response.data.status) {
              setStatus(response.data.status as DiagramStatus);
            }
            
            if (response.data.nodes && response.data.edges) {
              setNodes(response.data.nodes);
              setEdges(response.data.edges);
            } else if (response.data.ast) {
              const nodes = astToNodes(response.data.ast);
              const edges = astToEdges(response.data.ast);
              setNodes(nodes);
              setEdges(edges);
            }
          } else {
            toast.error(response.error || "Failed to load diagram");
            navigate("/");
          }
        } else {
          const response = await api.diagrams.getDefault();
          if (response.status && response.data) {
            setDbmlText(response.data.dbmlText);
            if (response.data.ast) {
              setAst(response.data.ast);
              const nodes = astToNodes(response.data.ast);
              const edges = astToEdges(response.data.ast);
              setNodes(nodes);
              setEdges(edges);
            }
          } else {
            toast.error(response.error || "Failed to load default diagram");
          }
        }
      } catch (error: any) {
        toast.error(error?.error || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full max-h-[calc(100vh-(var(--spacing)*8+var(--spacing)*16+var(--spacing)*4)))]">
      <ResizablePanelGroup direction="horizontal" className="gap-2">
        <ResizablePanel defaultSize={33} minSize={20} maxSize={60}>
          <Card className="h-full overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "dbml" | "properties" | "ai")
              }
              className="h-full flex flex-col"
            >
              <TabsList className="w-full grid grid-cols-3 shrink-0">
                <TabsTrigger value="dbml">DBML</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="ai">AI Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="dbml" className="flex-1 overflow-hidden m-0">
                <TextEditor onBlur={parseDbml} />
              </TabsContent>
              <TabsContent value="properties" className="flex-1 overflow-hidden m-0 min-h-0">
                <NodePropertyPanel />
              </TabsContent>
              <TabsContent value="ai" className="flex-1 overflow-hidden m-0 min-h-0">
                <AiChatPanel />
              </TabsContent>
            </Tabs>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={67} minSize={40} maxSize={80}>
          <DiagramPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export const EditorPage: FC = () => {
  return (
    <SyncProvider>
      <EditorPageContent />
    </SyncProvider>
  );
};
