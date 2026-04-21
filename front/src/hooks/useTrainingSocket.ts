import { useEffect, useRef } from "react";

const WS_URL = `ws://${window.location.hostname}:3000`;

export const originId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);

type Handler = (data: any) => void;

export function useTrainingSocket(handlers: Record<string, Handler>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let ws: WebSocket;
    let timer: ReturnType<typeof setTimeout>;

    const connect = () => {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.originId === originId) return;
          handlersRef.current[msg.event]?.(msg.data);
        } catch {}
      };
      ws.onclose = () => { timer = setTimeout(connect, 2000); };
    };

    connect();
    return () => { ws?.close(); clearTimeout(timer); };
  }, []);
}
