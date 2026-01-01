import { type FC, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { CheckCircle2, Loader2, AlertCircle, Edit2, Save } from "lucide-react";
import { useSchemaStore, useDiagramStore } from "@/app/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useApi } from "@/app/services/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import type { DiagramStatus } from "@/app/types";

const HeaderContent: FC = () => {
  const location = useLocation();
  const { name, description, status, setName, setDescription, setStatus } = useSchemaStore();
  const { diagramId } = useDiagramStore();
  const api = useApi();
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const isDiagramPage = location.pathname.startsWith("/diagram") && diagramId;

  const getStatusConfig = (statusValue: DiagramStatus) => {
    switch (statusValue) {
      case "idle":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          label: "Idle",
        };
      case "parsing":
        return {
          icon: Loader2,
          color: "text-yellow-600",
          label: "Parsing",
        };
      case "error":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          label: "Error",
        };
      case "editing":
        return {
          icon: Edit2,
          color: "text-blue-600",
          label: "Editing",
        };
      case "saving":
        return {
          icon: Save,
          color: "text-yellow-600",
          label: "Saving",
        };
      default:
        return {
          icon: CheckCircle2,
          color: "text-gray-600",
          label: "Unknown",
        };
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditName(name);
      setEditDescription(description);
    }
  };

  const handleSave = async () => {
    if (!diagramId) {
      toast.error("No diagram selected");
      return;
    }

    try {
      setIsSaving(true);
      setStatus("saving");
      const response = await api.diagrams.update(diagramId, {
        name: editName,
        description: editDescription,
      });

      if (response.status && response.data) {
        setName(editName);
        setDescription(editDescription);
        toast.success("Diagram updated successfully");
      } else {
        toast.error(response.error || "Failed to update diagram");
      }
    } catch (error: any) {
      toast.error(error?.error || "An error occurred");
    } finally {
      setStatus("idle");
      setIsSaving(false);
    }
  };

  if (!isDiagramPage) {
    return null;
  }

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 ml-auto hover:opacity-80 transition-opacity">
          <span className="font-medium">
            {name || "Untitled Diagram"}
          </span>
          <StatusIcon className={`h-4 w-4 ${statusConfig.color} ${status === "parsing" ? "animate-spin" : ""}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Diagram name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Diagram description"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || status === "saving"}
              size="sm"
              className="flex-1"
            >
              {isSaving || status === "saving" ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const AppLayout: FC = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <HeaderContent />
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

