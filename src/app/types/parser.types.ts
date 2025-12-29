export interface ParseError {
  line: number;
  column?: number;
  message: string;
  type: "syntax" | "semantic" | "validation";
  code?: string;
}

