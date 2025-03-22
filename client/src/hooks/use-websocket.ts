import { useEffect, useRef, useState } from "react";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    // Connection opened
    socket.addEventListener("open", () => {
      setIsConnected(true);
      console.log("WebSocket Connected");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      setLastMessage(event);
    });

    // Listen for errors
    socket.addEventListener("error", (error) => {
      console.error("WebSocket Error:", error);
    });

    // Connection closed
    socket.addEventListener("close", () => {
      setIsConnected(false);
      console.log("WebSocket Disconnected");
    });

    // Clean up on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Function to send messages
  const sendMessage = (data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  return { isConnected, lastMessage, sendMessage };
}
