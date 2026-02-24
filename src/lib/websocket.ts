import { useEffect, useRef, useCallback } from "react";
import { getWsUrl } from "./api";

export function useWishlistWebSocket(slug: string | null, onMessage: () => void) {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!slug) return;
    
    const wsUrl = getWsUrl(`/ws/wishlist/${slug}`);
    const url = wsUrl.startsWith("http") ? wsUrl.replace(/^http/, "ws") : wsUrl;
    
    const ws = new WebSocket(url);
    
    ws.onmessage = () => {
      onMessage();
    };
    
    ws.onerror = (e) => {
      console.warn("WebSocket error", e);
      ws.close();
    };
    
    ws.onclose = () => {
      // Very basic reconnect logic could go here
    };

    wsRef.current = ws;
  }, [slug, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
}
