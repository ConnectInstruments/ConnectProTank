import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Database, Droplet, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import TankVisualization from "@/components/ui/tank-visualization";
import StatsCard from "@/components/ui/stats-card";
import { useWebSocket } from "@/hooks/use-websocket";

export default function TankLevelsPage() {
  const { tanks } = useWebSocket();
  
  // Get statistics
  const { data: stats, refetch, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tank Levels</h2>
        <Button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center text-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tanks.map(tank => (
          <TankVisualization 
            key={tank.id}
            id={tank.id}
            name={tank.name}
            location={tank.location}
            lastUpdated={tank.lastUpdated}
            level={tank.currentPercentage}
            temperature={tank.temperature}
            volume={tank.currentLevel}
            maxCapacity={tank.maxCapacity}
            hasError={tank.currentPercentage <= 15}
          />
        ))}
      </div>
      
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium">Overview Statistics</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard 
                title="Total Capacity" 
                value={stats?.totalCapacity ? `${stats.totalCapacity.toLocaleString()}L` : "Loading..."}
                icon={<Database className="text-orange-500 h-5 w-5" />}
              />
              
              <StatsCard 
                title="Current Volume" 
                value={stats?.currentVolume ? `${stats.currentVolume.toLocaleString()}L` : "Loading..."}
                icon={<Droplet className="text-orange-500 h-5 w-5" />}
              />
              
              <StatsCard 
                title="Avg. Temperature" 
                value={stats?.avgTemperature ? `${stats.avgTemperature}°C` : "Loading..."}
                icon={<Thermometer className="text-orange-500 h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
