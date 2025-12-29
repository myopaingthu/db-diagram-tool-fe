import { Base } from "./base";
import type { ApiResponse } from "@/app/types";

export interface Diagram {
  _id: string;
  userId: string;
  name: string;
  description: string;
  dbmlText: string;
  status: "editing" | "idle" | "saving";
  validationErrors: any[];
  setting: {
    modelJson: string;
    layout: any;
    preferences: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiagramDto {
  name: string;
  description?: string;
}

export interface UpdateDiagramDto {
  name?: string;
  description?: string;
  dbmlText?: string;
  status?: "editing" | "idle" | "saving";
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

  list(): Promise<ApiResponse<Diagram[]>> {
    return this.http.get("/api/core/diagrams");
  }
}

