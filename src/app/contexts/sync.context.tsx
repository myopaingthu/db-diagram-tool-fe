import { createContext, useContext, type ReactNode } from "react";
import { useSync } from "@/app/hooks/use-sync";
import type { SchemaAST, DiagramStatus } from "@/app/types";

interface SyncContextValue {
  parseDbml: (text: string) => void;
  syncBackend: (syncData: {
    ast?: SchemaAST | null;
    nodes?: any[];
    edges?: any[];
    errors?: any[];
    status?: DiagramStatus;
    dbmlText?: string;
  }) => Promise<void>;
  debouncedSyncBackend: (syncData: {
    ast?: SchemaAST | null;
    nodes?: any[];
    edges?: any[];
    errors?: any[];
    status?: DiagramStatus;
    dbmlText?: string;
  }) => void;
  syncAstToBackend: (ast: SchemaAST) => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const sync = useSync();

  return (
    <SyncContext.Provider
      value={{
        parseDbml: sync.parseDbml,
        syncBackend: sync.syncBackend,
        debouncedSyncBackend: sync.debouncedSyncBackend,
        syncAstToBackend: sync.syncAstToBackend,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSyncContext = (): SyncContextValue => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncContext must be used within a SyncProvider");
  }
  return context;
};

