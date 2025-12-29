import { type FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/app/services/api";
import { useSchemaStore, useDiagramStore } from "@/app/store";
import { TextEditor } from "./text-editor";
import { DiagramPanel } from "./diagram-panel";
import { useSync } from "@/app/hooks/use-sync";
import { astToNodes, astToEdges } from "@/app/utils/ast-to-flow";
import { toast } from "sonner";

export const EditorPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();
  const { setDbmlText, setAst, reset: resetSchema } = useSchemaStore();
  const { setDiagramId, setNodes, setEdges, reset: resetDiagram } =
    useDiagramStore();
  const [loading, setLoading] = useState(true);
  const { parseDbml } = useSync();

  useEffect(() => {
    const loadDiagram = async () => {
      try {
        setLoading(true);
        resetSchema();
        resetDiagram();

        if (id) {
          const response = await api.diagrams.getById(id);
          if (response.status && response.data) {
            setDbmlText(response.data.dbmlText);
            setDiagramId(response.data._id);
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
//  }, [id, api, setDbmlText, setAst, setDiagramId, resetSchema, resetDiagram, navigate, parseDbml]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-1/4 border-r">
        <TextEditor onBlur={parseDbml} />
      </div>
      <div className="w-3/4">
        <DiagramPanel />
      </div>
    </div>
  );
};

