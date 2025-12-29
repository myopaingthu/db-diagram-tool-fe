import { useEffect, useRef, useState } from "react";
import { WebSocketService } from "@/app/services/websocket/websocket.service";

let wsServiceInstance: WebSocketService | null = null;

const getWebSocketService = (): WebSocketService => {
  if (!wsServiceInstance) {
    wsServiceInstance = new WebSocketService();
  }
  return wsServiceInstance;
};

export const useWebSocket = () => {
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = getWebSocketService();
    wsServiceRef.current = ws;
    ws.connect();

    const handleConnectionChange = (isConnected: boolean) => {
      setConnected(isConnected);
    };

    ws.onConnectionChange(handleConnectionChange);

    return () => {
      ws.offConnectionChange(handleConnectionChange);
    };
  }, []);

  const emit = (event: string, data: any) => {
    wsServiceRef.current?.emit(event, data);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    wsServiceRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    wsServiceRef.current?.off(event, callback);
  };

  return {
    connected,
    emit,
    on,
    off,
  };
};

