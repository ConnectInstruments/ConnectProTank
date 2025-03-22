import { useState, useEffect } from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocket } from "@/hooks/use-websocket";

export default function TemperaturesPage() {
  const { tanks } = useWebSocket();
  const [temperatureData, setTemperatureData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("1h");
  
  // Generate some historical data for temperatures
  useEffect(() => {
    if (tanks.length === 0) return;
    
    const generateData = () => {
      const now = new Date();
      const data = [];
      
      // Different time intervals based on range
      const intervals = {
        "1h": { count: 12, minutes: 5 },   // 5-minute intervals for 1 hour
        "24h": { count: 24, minutes: 60 }, // 1-hour intervals for 24 hours
        "7d": { count: 7, minutes: 1440 }  // 1-day intervals for 7 days
      };
      
      const { count, minutes } = intervals[timeRange];
      
      for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * minutes * 60 * 1000);
        const timeLabel = time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: timeRange === "1h" ? 'numeric' : undefined,
          hour12: true
        });
        
        const entry: any = {
          time: timeRange === "7d" 
            ? time.toLocaleDateString('en-US', { weekday: 'short' }) 
            : timeLabel
        };
        
        // Add temperature for each tank with small random variations
        tanks.forEach(tank => {
          // Base temperature from current tank with random fluctuation
          const baseTemp = tank.temperature;
          const randomVariation = (Math.sin(i / (count / 4)) + Math.random() - 0.5) * 2;
          entry[tank.name] = +(baseTemp + randomVariation).toFixed(1);
        });
        
        data.push(entry);
      }
      
      return data;
    };
    
    setTemperatureData(generateData());
  }, [tanks, timeRange]);
  
  const colors = [
    "#FF7A00", // Primary orange
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EC4899"  // Pink
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Temperature Monitoring</h2>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Temperature Trends</CardTitle>
            <Tabs defaultValue="1h" value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <TabsList>
                <TabsTrigger value="1h">1 Hour</TabsTrigger>
                <TabsTrigger value="24h">24 Hours</TabsTrigger>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={temperatureData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="time" stroke="rgba(128, 128, 128, 0.5)" />
                <YAxis 
                  stroke="rgba(128, 128, 128, 0.5)"
                  domain={["dataMin - 2", "dataMax + 2"]}
                  label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip />
                <Legend />
                {tanks.map((tank, index) => (
                  <Line
                    key={tank.id}
                    type="monotone"
                    dataKey={tank.name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tanks.map((tank, index) => (
          <Card key={tank.id}>
            <CardHeader>
              <CardTitle className="text-base">{tank.name} Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 mr-4">
                  <span className="text-xl font-bold text-orange-500">{tank.temperature}°C</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location: {tank.location}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tank.temperature > 25 ? "⚠️ Above normal" : "✓ Normal range"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
