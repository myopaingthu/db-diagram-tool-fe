import { create } from "zustand";
import type { SchemaAST, ParseError, DiagramStatus } from "@/app/types";

interface SchemaState {
  dbmlText: string;
  ast: SchemaAST | null;
  errors: ParseError[];
  status: DiagramStatus;
  name: string;
  description: string;
  setDbmlText: (text: string) => void;
  setAst: (ast: SchemaAST | null) => void;
  setErrors: (errors: ParseError[]) => void;
  setStatus: (status: DiagramStatus) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  reset: () => void;
}

export const useSchemaStore = create<SchemaState>((set) => ({
  dbmlText: "",
  ast: null,
  errors: [],
  status: "idle",
  name: "",
  description: "",
  setDbmlText: (text) => set({ dbmlText: text }),
  setAst: (ast) => set({ ast }),
  setErrors: (errors) => set({ errors }),
  setStatus: (status) => set({ status }),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  reset: () =>
    set({
      dbmlText: "",
      ast: null,
      errors: [],
      status: "idle",
      name: "",
      description: "",
    }),
}));

