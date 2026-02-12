import type { ParseError } from "./parser.types";

export type AiChatRole = "user" | "assistant";

export interface AiChatMessage {
  _id?: string;
  requestId: string;
  diagramId?: string;
  userId?: string;
  role: AiChatRole;
  content: string;
  generatedDbml?: string;
  validDbml?: boolean;
  parseErrors?: ParseError[];
  provider?: string;
  model?: string;
  createdAt?: string;
  updatedAt?: string;
  streaming?: boolean;
}

export interface AiPromptPayload {
  diagramId?: string;
  prompt: string;
  currentDbml: string;
  name?: string;
  description?: string;
}

export interface AiSessionPayload {
  diagramId: string;
  requestId: string;
}

export interface AiTokenPayload {
  requestId: string;
  chunk: string;
}

export interface AiDonePayload {
  requestId: string;
  diagramId: string;
  assistantMessage: string;
  dbmlText?: string;
  valid: boolean;
  errors?: ParseError[];
}

export interface AiErrorPayload {
  requestId?: string;
  message: string;
}
