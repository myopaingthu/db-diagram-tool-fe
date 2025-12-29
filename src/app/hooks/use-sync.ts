import { useEffect, useCallback } from "react";
import { useWebSocket } from "./use-websocket";
import { useSchemaStore } from "@/app/store/schema.store";
import { useDiagramStore } from "@/app/store/diagram.store";
import { astToNodes, astToEdges } from "@/app/utils/ast-to-flow";
import type { SchemaAST, ParseError } from "@/app/types";

export const useSync = () => {
  const { emit, on, off, connected } = useWebSocket();
  const { setAst, setErrors, setStatus } = useSchemaStore();
  const { setNodes, setEdges } = useDiagramStore();

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

  useEffect(() => {
    if (!connected) return;

    const handleParsed = (data: {
      ast: SchemaAST;
      errors: ParseError[];
    }) => {
      if (data.ast) {
        setAst(data.ast);
        const nodes = astToNodes(data.ast);
        const edges = astToEdges(data.ast);
        setNodes(nodes);
        setEdges(edges);
      }
      setErrors(data.errors || []);
      setStatus(data.errors && data.errors.length > 0 ? "error" : "idle");
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
    on("diagram:error", handleError);

    return () => {
      off("diagram:parsed", handleParsed);
      off("diagram:error", handleError);
    };
  }, [connected, on, off, setAst, setErrors, setStatus, setNodes, setEdges]);

  return {
    parseDbml,
  };
};

