import { useState, useEffect } from "react";
import { useTankData } from "@/hooks/use-tank-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Tank } from "@shared/schema";

const generateTemperatureHistory = (tank: Tank) => {
  // Generate some fake historical data based on current temperature
  const currentTemp = tank.temperature;
  const history = [];
  const now = new Date();
  
  for (let i = 12; i >= 0; i--) {
    const timePoint = new Date(now.getTime() - i * 3600000); // hourly data points
    // Add some variation to the temperature
    const variation = Math.sin(i * 0.5) * 2;
    const temp = (currentTemp + variation).toFixed(1);
    
    history.push({
      time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: parseFloat(temp),
    });
  }
  
  return history;
};

export default function TemperaturesPage() {
  const { tanks, isLoading } = useTankData();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<string>("all");
  const [temperatureData, setTemperatureData] = useState<any[]>([]);

  useEffect(() => {
    if (tanks && tanks.length > 0) {
      // All tanks view - combine data for multiline chart
      if (activeTab === "all") {
        const combinedData = [];
        const now = new Date();
        
        for (let i = 12; i >= 0; i--) {
          const timePoint = new Date(now.getTime() - i * 3600000);
          const dataPoint: any = {
            time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          
          tanks.forEach(tank => {
            // Create a unique variation for each tank
            const variation = Math.sin(i * 0.5 + tank.id * 0.3) * 2;
            const temp = (tank.temperature + variation).toFixed(1);
            dataPoint[tank.name] = parseFloat(temp);
          });
          
          combinedData.push(dataPoint);
        }
        
        setTemperatureData(combinedData);
      } else {
        // Single tank view
        const tankId = parseInt(activeTab, 10);
        const tank = tanks.find(t => t.id === tankId);
        
        if (tank) {
          setTemperatureData(generateTemperatureHistory(tank));
        }
      }
    }
  }, [tanks, activeTab]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading temperature data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Temperatures</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor temperature readings from all tanks
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Temperature Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold">Temperature History</h3>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Tanks</TabsTrigger>
                {tanks.map((tank) => (
                  <TabsTrigger key={tank.id} value={tank.id.toString()}>
                    {tank.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={temperatureData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" />
                <YAxis domain={['auto', 'auto']} label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                
                {activeTab === "all" ? (
                  tanks.map((tank, index) => (
                    <Line
                      key={tank.id}
                      type="monotone"
                      dataKey={tank.name}
                      stroke={`hsl(${index * 40}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))
                ) : (
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="hsl(28, 100%, 50%)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Temperatures */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Current Readings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tanks.map((tank) => (
            <Card key={tank.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{tank.name}</h4>
                    <p className="text-2xl font-bold">{tank.temperature}°C</p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    tank.temperature > 30 
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
                      : tank.temperature < 15
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Status: {tank.status.charAt(0).toUpperCase() + tank.status.slice(1)}</span>
                  <span>Fill Level: {tank.fillLevel}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
