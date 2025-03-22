import { useState, useEffect, useRef } from "react";
import { Tank } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setIsConnected(true);
        toast({
          title: "Connected to server",
          description: "Real-time updates are now active",
        });
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        toast({
          title: "Disconnected from server",
          description: "Attempting to reconnect...",
          variant: "destructive",
        });
        
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          socketRef.current = null;
        }, 3000);
      };
      
      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case "initial_data":
              setTanks(message.data);
              break;
              
            case "tank_update":
              setTanks(prevTanks => 
                prevTanks.map(tank => 
                  tank.id === message.data.id ? message.data : tank
                )
              );
              break;
              
            case "tank_created":
              setTanks(prevTanks => [...prevTanks, message.data]);
              toast({
                title: "Tank Added",
                description: `${message.data.name} has been added to the system`,
              });
              break;
              
            case "tank_updated":
              setTanks(prevTanks => 
                prevTanks.map(tank => 
                  tank.id === message.data.id ? message.data : tank
                )
              );
              toast({
                title: "Tank Updated",
                description: `${message.data.name} has been updated`,
              });
              break;
              
            case "tank_deleted":
              setTanks(prevTanks => 
                prevTanks.filter(tank => tank.id !== message.data.id)
              );
              toast({
                title: "Tank Removed",
                description: "A tank has been removed from the system",
              });
              break;
              
            default:
              console.warn("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to server",
          variant: "destructive",
        });
      };
    }
    
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);
  
  return { tanks, isConnected };
}
