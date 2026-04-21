import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer;

export function initWs(server: Server) {
  wss = new WebSocketServer({ server });
}

export function broadcast(event: string, data?: any, originId?: string) {
  if (!wss) return;
  const msg = JSON.stringify({ event, data, originId });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}
