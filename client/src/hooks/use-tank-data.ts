import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tank, tankSchema } from "@shared/schema";
import { useWebSocket } from "./use-websocket";
import { 
  calculateAverageFillLevel, 
  calculateAverageTemperature, 
  calculateTotalStock,
  calculateTotalCapacity,
  formatLiters
} from "@/lib/tank-utils";

export function useTankData() {
  const { lastMessage } = useWebSocket();

  // Fetch all tanks
  const {
    data: tanks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Tank[]>({
    queryKey: ["/api/tanks"],
  });

  // Update when receiving WebSocket messages
  if (lastMessage) {
    try {
      const parsedData = JSON.parse(lastMessage.data);
      if (parsedData.type === "TANK_UPDATE") {
        // Update the tank in the cache
        const updatedTank = parsedData.payload;
        const validatedTank = tankSchema.parse(updatedTank);
        
        queryClient.setQueryData<Tank[]>(
          ["/api/tanks"],
          (oldData) => {
            if (!oldData) return [validatedTank];
            
            const index = oldData.findIndex((tank) => tank.id === validatedTank.id);
            if (index === -1) return [...oldData, validatedTank];
            
            const newData = [...oldData];
            newData[index] = validatedTank;
            return newData;
          }
        );
      } else if (parsedData.type === "TANK_DELETE") {
        // Remove tank from cache when it's deleted
        queryClient.setQueryData<Tank[]>(
          ["/api/tanks"],
          (oldData) => {
            if (!oldData) return [];
            return oldData.filter(tank => tank.id !== parsedData.payload.id);
          }
        );
      }
    } catch (e) {
      console.error("Error parsing WebSocket message:", e);
    }
  }

  // Create a new tank
  const createTank = useMutation({
    mutationFn: (newTank: Omit<Tank, "id" | "lastUpdated">) => {
      return apiRequest("POST", "/api/tanks", newTank);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tanks"] });
    },
  });

  // Delete a tank
  const deleteTank = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/tanks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tanks"] });
    },
  });

  // Calculate statistics
  const avgFillLevel = calculateAverageFillLevel(tanks);
  const avgTemperature = calculateAverageTemperature(tanks);
  const totalStock = calculateTotalStock(tanks);
  const totalCapacity = calculateTotalCapacity(tanks);
  const stockPercentage = totalCapacity ? Math.round((totalStock / totalCapacity) * 100) : 0;
  const isAllSystemsOperational = tanks.every((tank) => tank.status !== "offline");

  return {
    tanks,
    isLoading,
    isError,
    error,
    createTank,
    deleteTank,
    statistics: {
      avgFillLevel,
      avgTemperature,
      totalStock,
      totalCapacity,
      stockPercentage,
      formattedTotalStock: formatLiters(totalStock),
      formattedTotalCapacity: formatLiters(totalCapacity),
      isAllSystemsOperational,
    },
  };
}
