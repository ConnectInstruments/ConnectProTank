import { useState, useEffect } from "react";
import { Thermometer, Droplet, History, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TankProps {
  id: number;
  name: string;
  location: string;
  lastUpdated: Date;
  level: number;
  temperature: number;
  volume: number;
  maxCapacity: number;
  hasError?: boolean;
}

export default function TankVisualization({
  id,
  name,
  location,
  lastUpdated,
  level,
  temperature,
  volume,
  maxCapacity,
  hasError = false
}: TankProps) {
  const [animatedLevel, setAnimatedLevel] = useState(level);
  const [lastUpdateText, setLastUpdateText] = useState("");
  
  // Animate level changes
  useEffect(() => {
    setAnimatedLevel(level);
  }, [level]);
  
  // Calculate how long since the last update
  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const seconds = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / 1000);
      
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
  
  // Calculate tank fill position
  const fillHeight = 100 - animatedLevel;
  const fillY = 20 + fillHeight;
  const isCritical = level <= 15;
  
  return (
    <Card className={cn(
      "overflow-hidden transition-colors duration-200",
      isCritical ? "border-red-300 dark:border-red-900" : ""
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
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
          <div className="relative w-40 h-56">
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
                  "text-2xl font-bold text-white px-2 py-1 rounded",
                  isCritical ? "bg-red-500/80" : "bg-orange-500/80"
                )}
              >
                {level}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">Temperature</div>
            <div className="mt-1 flex items-center">
              <Thermometer className="text-orange-500 h-4 w-4 mr-1" />
              <span className="text-lg font-semibold">{temperature}°C</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">Volume</div>
            <div className="mt-1 flex items-center">
              <Droplet className={cn(
                "h-4 w-4 mr-1",
                isCritical ? "text-red-500" : "text-orange-500"
              )} />
              <span className="text-lg font-semibold">{volume}L</span>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "mt-4 flex",
          isCritical ? "justify-between" : "justify-end"
        )}>
          {isCritical && (
            <button type="button" className="inline-flex items-center px-2 py-1 text-xs rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none transition-colors duration-150">
              <span className="mr-1">⚠️</span>
              Refill Alert
            </button>
          )}
          
          <div className="flex space-x-2">
            <button type="button" className="inline-flex items-center px-2 py-1 text-xs rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-150">
              <History className="h-3 w-3 mr-1" />
              History
            </button>
            <button type="button" className="inline-flex items-center px-2 py-1 text-xs rounded-md text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-150">
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
