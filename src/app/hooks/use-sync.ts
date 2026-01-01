import { useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebSocket } from "./use-websocket";
import { useApi } from "@/app/services/api";
import { useSchemaStore } from "@/app/store/schema.store";
import { useDiagramStore } from "@/app/store/diagram.store";
import { useDiagramStore as diagramStore } from "@/app/store/diagram.store";
import { astToNodes, astToEdges } from "@/app/utils/ast-to-flow";
import { debounce } from "@/app/utils/debounce";
import { toast } from "sonner";
import type { SchemaAST, ParseError, DiagramStatus } from "@/app/types";

export const useSync = () => {
  const { emit, on, off, connected } = useWebSocket();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const { dbmlText, errors, status, setAst, setErrors, setStatus, setDbmlText } = useSchemaStore();
  const { nodes, edges, diagramId, setNodes, setEdges, setDiagramId } = useDiagramStore();

  const parseDbml = useCallback(
    (text: string) => {
      if (!connected) {
        console.warn("WebSocket not connected, cannot parse DBML");
        return;
      }

      setStatus("parsing");
      emit("diagram:parse", { dbmlText: text });
    },
    [connected, emit, setStatus]
  );

  const syncBackend = useCallback(async (syncData: {
    ast?: SchemaAST | null;
    nodes?: typeof nodes;
    edges?: typeof edges;
    errors?: ParseError[];
    status?: DiagramStatus;
    dbmlText?: string;
  }) => {
    try {
      setStatus("saving");
      const response = await api.diagrams.sync(diagramId, {
        dbmlText: syncData.dbmlText || dbmlText,
        ast: syncData.ast || undefined,
        nodes: syncData.nodes || nodes,
        edges: syncData.edges || edges,
        errors: syncData.errors || errors,
        status: syncData.status || status,
      });

      if (response.status && response.data) {
        if (response.data._id && (!id || id === "new")) {
          navigate(`/diagram/${response.data._id}`, { replace: true });
          setDiagramId(response.data._id);
        } else if (response.data._id && response.data._id !== diagramId) {
          setDiagramId(response.data._id);
        }
      } else {
        toast.error(response.error || "Failed to sync diagram");
      }
    } catch (error: any) {
      toast.error(error?.error || "An error occurred while syncing");
    } finally {
      setStatus("idle");
    }
  }, [api, diagramId, dbmlText, nodes, edges, errors, status, id, navigate, setDiagramId]);

  const debouncedSyncBackend = useMemo(
    () => debounce(syncBackend, 1000),
    [syncBackend]
  );

  const syncAstToBackend = useCallback(
    (ast: SchemaAST) => {
      if (!connected) {
        console.warn("WebSocket not connected, cannot sync AST");
        return;
      }
      setStatus("parsing");
      emit("diagram:update-ast", { ast });
    },
    [connected, emit]
  );

  useEffect(() => {
    if (!connected) return;

    const handleParsed = async (data: {
      ast: SchemaAST;
      errors: ParseError[];
    }) => {
      if (data.ast) {
        const { nodes: currentNodes } = diagramStore.getState();
        const positionMap = new Map<string, { x: number; y: number }>();
        currentNodes.forEach((node) => {
          positionMap.set(node.id, node.position);
        });

        const newNodes = astToNodes(data.ast, positionMap);
        const newEdges = astToEdges(data.ast);
        const newStatus = data.errors && data.errors.length > 0 ? "error" : "idle";
        
        setAst(data.ast);
        setNodes(newNodes);
        setEdges(newEdges);
        setErrors(data.errors || []);
        setStatus(newStatus);
        
        syncBackend({
          ast: data.ast,
          nodes: newNodes,
          edges: newEdges,
          errors: data.errors || [],
          status: newStatus,
        });
      } else {
        const newStatus = data.errors && data.errors.length > 0 ? "error" : "idle";
        setErrors(data.errors || []);
        setStatus(newStatus);
        syncBackend({
          errors: data.errors || [],
          status: newStatus,
        });
      }
    };

    const handleAstUpdated = async (data: {
      ast: SchemaAST;
      dbmlText: string;
      errors: ParseError[];
    }) => {
      const newStatus = data.errors && data.errors.length > 0 ? "error" : "idle";
      
      setDbmlText(data.dbmlText);
      setAst(data.ast);
      setErrors(data.errors || []);
      setStatus(newStatus);

      const { nodes: currentNodes } = diagramStore.getState();
      const positionMap = new Map<string, { x: number; y: number }>();
      currentNodes.forEach((node) => {
        positionMap.set(node.id, node.position);
      });

      const newNodes = astToNodes(data.ast, positionMap);
      const newEdges = astToEdges(data.ast);
      setNodes(newNodes);
      setEdges(newEdges);

      debouncedSyncBackend({
        ast: data.ast,
        nodes: newNodes,
        edges: newEdges,
        errors: data.errors || [],
        status: newStatus,
        dbmlText: data.dbmlText,
      });
    };

    const handleError = (error: { message: string }) => {
      setErrors([
        {
          line: 0,
          message: error.message || "Parsing error",
          type: "syntax",
        },
      ]);
      setStatus("error");
    };

    on("diagram:parsed", handleParsed);
    on("diagram:ast-updated", handleAstUpdated);
    on("diagram:error", handleError);

    return () => {
      off("diagram:parsed", handleParsed);
      off("diagram:ast-updated", handleAstUpdated);
      off("diagram:error", handleError);
    };
  }, [connected, on, off, setAst, setErrors, setStatus, setNodes, setEdges, setDbmlText, syncBackend, debouncedSyncBackend]);

  return {
    parseDbml,
    syncBackend,
    syncAstToBackend,
    debouncedSyncBackend,
  };
};

