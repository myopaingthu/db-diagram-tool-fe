import { io, type Socket } from "socket.io-client";
import { CONFIG } from "@/config";

export class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private connectionCallbacks: Array<(connected: boolean) => void> = [];

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.token = localStorage.getItem("token");

    this.socket = io(CONFIG.WS_HOST, {
      auth: {
        token: this.token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.notifyConnectionChange(true);
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      this.notifyConnectionChange(false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.notifyConnectionChange(false);
    });
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
    callback(this.connected);
  }

  offConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks = this.connectionCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("WebSocket not connected, cannot emit:", event);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  get connected(): boolean {
    return this.socket?.connected || false;
  }
}

