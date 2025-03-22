import { useState, useEffect } from "react";
import { Thermometer, Droplet, History, Settings, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { calculateTankVolume, formatLiters } from "@/lib/tank-utils";
import { Tank } from "@shared/schema";

interface TankVisualizationProps {
  tank: Tank;
  hasError?: boolean;
}

export default function TankVisualization({
  tank,
  hasError = false
}: TankVisualizationProps) {
  const { id, name, fillLevel, temperature, capacity, status, lastUpdated } = tank;
  const [animatedLevel, setAnimatedLevel] = useState(fillLevel);
  const [lastUpdateText, setLastUpdateText] = useState("");
  
  // Animate level changes
  useEffect(() => {
    setAnimatedLevel(fillLevel);
  }, [fillLevel]);
  
  // Calculate how long since the last update
  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const seconds = Math.floor((now.getTime() - new Date(lastUpdated || "").getTime()) / 1000);
      
      if (seconds < 60) {
        setLastUpdateText(`Updated: ${seconds} sec ago`);
      } else if (seconds < 3600) {
        setLastUpdateText(`Updated: ${Math.floor(seconds / 60)} min ago`);
      } else {
        setLastUpdateText(`Updated: ${Math.floor(seconds / 3600)} hr ago`);
      }
    };
    
    calculateTimeAgo();
    const interval = setInterval(calculateTimeAgo, 10000);
    
    return () => clearInterval(interval);
  }, [lastUpdated]);
  
  // Calculate tank fill position and volume
  const fillHeight = 100 - animatedLevel;
  const fillY = 20 + fillHeight;
  const isCritical = fillLevel <= 15;
  const currentVolume = calculateTankVolume(tank);
  
  return (
    <Card className={cn(
      "overflow-hidden transition-colors duration-200",
      isCritical ? "border-red-300 dark:border-red-900" : ""
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status === "warning" ? "Low Level Alert" : "Normal Operation"}
            </p>
          </div>
          {isCritical ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <span className="sr-only">Warning</span>
              Low Level
            </Badge>
          ) : (
            <div className="text-sm font-medium text-orange-500">
              {lastUpdateText}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-center">
          {/* Tank SVG Visualization */}
          <div className="relative w-36 h-52 sm:w-40 sm:h-56">
            <svg viewBox="0 0 100 140" className="w-full h-full">
              {/* Tank body */}
              <rect 
                x="10" 
                y="20" 
                width="80" 
                height="100" 
                rx="2" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-gray-300 dark:text-gray-700" 
              />
              
              {/* Tank cap */}
              <path 
                d="M10,20 Q10,10 50,10 Q90,10 90,20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-gray-300 dark:text-gray-700" 
              />
              
              {/* Tank base */}
              <rect 
                x="5" 
                y="120" 
                width="90" 
                height="10" 
                rx="2" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-gray-300 dark:text-gray-700" 
              />
              
              {/* Tank filling - dynamic height based on level */}
              <rect 
                x="10" 
                y={fillY} 
                width="80" 
                height={100 - fillHeight} 
                fill={isCritical ? "#EF4444" : "#FF7A00"} 
                className="transition-all duration-1000 ease-in-out" 
              />
              
              {/* Level marker lines */}
              <line x1="8" y1="40" x2="12" y2="40" stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-500" />
              <line x1="8" y1="60" x2="12" y2="60" stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-500" />
              <line x1="8" y1="80" x2="12" y2="80" stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-500" />
              <line x1="8" y1="100" x2="12" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-500" />
              
              {/* Level text */}
              <text x="4" y="40" fontSize="6" textAnchor="end" className="fill-current text-gray-500 dark:text-gray-400">100%</text>
              <text x="4" y="80" fontSize="6" textAnchor="end" className="fill-current text-gray-500 dark:text-gray-400">50%</text>
              <text x="4" y="120" fontSize="6" textAnchor="end" className="fill-current text-gray-500 dark:text-gray-400">0%</text>
            </svg>
            
            {/* Percentage overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className={cn(
                  "text-xl sm:text-2xl font-bold text-white px-2 py-1 rounded",
                  isCritical ? "bg-red-500/80" : "bg-orange-500/80"
                )}
              >
                {Math.round(fillLevel)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-2 sm:p-3">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Temperature</div>
            <div className="mt-1 flex items-center">
              <Thermometer className="text-orange-500 h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="text-sm sm:text-base font-semibold">{temperature}°C</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-2 sm:p-3">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Volume</div>
            <div className="mt-1 flex items-center">
              <Droplet className={cn(
                "h-3 w-3 sm:h-4 sm:w-4 mr-1",
                isCritical ? "text-red-500" : "text-orange-500"
              )} />
              <span className="text-xs sm:text-sm font-semibold">
                {formatLiters(currentVolume)} / {formatLiters(capacity)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center">
            <Database className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
            <span className="text-xs text-gray-500">Cap: {formatLiters(capacity)}</span>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2">
            <button type="button" className="inline-flex items-center px-1 sm:px-2 py-1 text-xs rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-150">
              <History className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button type="button" className="inline-flex items-center px-1 sm:px-2 py-1 text-xs rounded-md text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-150">
              <Settings className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Configure</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
