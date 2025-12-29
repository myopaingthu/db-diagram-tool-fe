export const CONFIG = {
  API_HOST: import.meta.env.VITE_API_HOST || "http://localhost:3000",
  WS_HOST: import.meta.env.VITE_WS_HOST || "ws://localhost:3000",
} as const;

