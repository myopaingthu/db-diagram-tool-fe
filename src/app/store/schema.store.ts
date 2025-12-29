import { create } from "zustand";
import type { SchemaAST, ParseError } from "@/app/types";

interface SchemaState {
  dbmlText: string;
  ast: SchemaAST | null;
  errors: ParseError[];
  status: "idle" | "parsing" | "error";
  setDbmlText: (text: string) => void;
  setAst: (ast: SchemaAST | null) => void;
  setErrors: (errors: ParseError[]) => void;
  setStatus: (status: "idle" | "parsing" | "error") => void;
  reset: () => void;
}

export const useSchemaStore = create<SchemaState>((set) => ({
  dbmlText: "",
  ast: null,
  errors: [],
  status: "idle",
  setDbmlText: (text) => set({ dbmlText: text }),
  setAst: (ast) => set({ ast }),
  setErrors: (errors) => set({ errors }),
  setStatus: (status) => set({ status }),
  reset: () =>
    set({
      dbmlText: "",
      ast: null,
      errors: [],
      status: "idle",
    }),
}));

