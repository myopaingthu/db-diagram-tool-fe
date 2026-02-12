import { Base } from "./base";
import type { ApiResponse, DiagramStatus } from "@/app/types";
import type { SchemaAST, ParseError } from "@/app/types";
import type { AiChatMessage } from "@/app/types";
import type { Node, Edge } from "@xyflow/react";

export interface Diagram {
  _id: string;
  userId?: string;
  name?: string;
  description?: string;
  dbmlText: string;
  status: DiagramStatus;
  validationErrors?: any[];
  errors?: ParseError[];
  ast?: SchemaAST;
  nodes?: Node[];
  edges?: Edge[];
  setting?: {
    modelJson: string;
    layout: any;
    preferences: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiagramDto {
  name: string;
  description?: string;
}

export interface UpdateDiagramDto {
  name?: string;
  description?: string;
  dbmlText?: string;
  status?: DiagramStatus;
}

export class Diagrams extends Base {
  getDefault(): Promise<ApiResponse<{ dbmlText: string; ast: any }>> {
    return this.http.get("/api/core/diagrams/default");
  }

  getById(id: string): Promise<ApiResponse<Diagram>> {
    return this.http.get(`/api/core/diagrams/${id}`);
  }

  create(data: CreateDiagramDto): Promise<ApiResponse<Diagram>> {
    return this.http.post("/api/core/diagrams", data);
  }

  update(id: string, data: UpdateDiagramDto): Promise<ApiResponse<Diagram>> {
    return this.http.put(`/api/core/diagrams/${id}`, data);
  }

  list(page?: number, limit?: number): Promise<ApiResponse<{ diagrams: Diagram[]; total: number; page: number; limit: number; totalPages: number }>> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (limit !== undefined) params.append("limit", limit.toString());
    const queryString = params.toString();
    return this.http.get(`/api/core/diagrams${queryString ? `?${queryString}` : ""}`);
  }

  sync(
    id: string | null | undefined,
    payload: {
      dbmlText?: string;
      ast?: SchemaAST;
      nodes?: Node[];
      edges?: Edge[];
      errors?: ParseError[];
      status?: DiagramStatus;
    }
  ): Promise<ApiResponse<Diagram>> {
    if (id) {
      return this.http.put(`/api/core/diagrams/sync/${id}`, payload);
    } else {
      return this.http.post("/api/core/diagrams/sync", payload);
    }
  }

  getAiMessages(
    id: string,
    limit?: number
  ): Promise<ApiResponse<AiChatMessage[]>> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", String(limit));
    const query = params.toString();
    return this.http.get(
      `/api/core/diagrams/${id}/ai/messages${query ? `?${query}` : ""}`
    );
  }

  clearAiMessages(id: string): Promise<ApiResponse<boolean>> {
    return this.http.delete(`/api/core/diagrams/${id}/ai/messages`);
  }
}
