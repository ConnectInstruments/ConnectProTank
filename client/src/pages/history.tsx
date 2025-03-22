import { useState, useEffect } from "react";
import { format, parseISO, subDays } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  HistoryIcon, 
  DropletIcon, 
  ThermometerIcon, 
  ClockIcon, 
  AlertCircleIcon,
  SearchIcon,
  CalendarIcon,
  FilterIcon
} from "lucide-react";

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTankData } from "@/hooks/use-tank-data";

export default function HistoryPage() {
  const { tanks, isLoading } = useTankData();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);
  const [tankHistory, setTankHistory] = useState<any[]>([]);
  const [tankEvents, setTankEvents] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [dateRange, setDateRange] = useState("7days");
  const [eventFilter, setEventFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate simulated historical data for the selected tank
  const generateTankHistoryData = (tankId: number, days: number) => {
    const tank = tanks.find((t) => t.id === tankId);
    if (!tank) return [];
    
    const data = [];
    const currentDate = new Date();
    const startLevel = tank.fillLevel;
    const startTemp = tank.temperature;
    const history = [];
    
    // Generate random events
    const events = [
      {
        id: `${tankId}-event-1`,
        tankId: tankId,
        timestamp: subDays(currentDate, Math.floor(Math.random() * days)).toISOString(),
        eventType: "fill",
        value: Math.floor(Math.random() * 30) + 40,
        description: "Automatic fill cycle completed"
      },
      {
        id: `${tankId}-event-2`,
        tankId: tankId,
        timestamp: subDays(currentDate, Math.floor(Math.random() * days)).toISOString(),
        eventType: "temperature",
        value: Math.floor(Math.random() * 5) + 22,
        description: "Temperature adjusted"
      },
      {
        id: `${tankId}-event-3`,
        tankId: tankId,
        timestamp: subDays(currentDate, Math.floor(Math.random() * days)).toISOString(),
        eventType: "alert",
        value: null,
        description: "High temperature alert triggered"
      },
      {
        id: `${tankId}-event-4`,
        tankId: tankId,
        timestamp: subDays(currentDate, Math.floor(Math.random() * days)).toISOString(),
        eventType: "maintenance",
        value: null,
        description: "Filter replaced during routine maintenance"
      }
    ];
    
    // Generate hourly data points for each day
    for (let i = days; i >= 0; i--) {
      const date = subDays(currentDate, i);
      
      // Generate 24 data points for each day
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(date);
        timestamp.setHours(hour);
        
        // Create random variations
        const hourFactor = Math.sin((hour / 24) * Math.PI) * 2; // Variation by hour
        const dayFactor = Math.sin((i / days) * Math.PI * 2) * 3; // Variation by day
        const randomFactor = (Math.random() - 0.5) * 4; // Random noise
        
        // Calculate level and temperature with variations
        let level = startLevel + hourFactor + dayFactor + randomFactor;
        level = Math.max(10, Math.min(95, level)); // Keep within reasonable range
        
        let temp = startTemp + (hourFactor / 4) + (randomFactor / 4);
        temp = parseFloat(temp.toFixed(1));
        
        // Record data point
        data.push({
          timestamp: timestamp.toISOString(),
          fillLevel: level,
          temperature: temp
        });
        
        // Create simple history at key points (mornings, alerts, changes)
        if (hour === 8 || hour === 16 || (level > 85 && hour % 4 === 0) || (level < 25 && hour % 4 === 0)) {
          const entryType = level > 85 ? 'alert_high' : level < 25 ? 'alert_low' : 'status';
          
          history.push({
            id: `${tankId}-${i}-${hour}`,
            tankId: tankId,
            timestamp: timestamp.toISOString(),
            eventType: entryType,
            value: level,
            temperature: temp, 
            description: level > 85 
              ? `High level alert (${level.toFixed(1)}%)` 
              : level < 25 
                ? `Low level alert (${level.toFixed(1)}%)` 
                : `Regular status check - Level: ${level.toFixed(1)}%, Temp: ${temp}°C`
          });
        }
      }
    }
    
    // Sort history by timestamp, newest first
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Sort events by timestamp, newest first
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return { data, history, events };
  };

  useEffect(() => {
    if (!isLoading && tanks.length > 0 && !selectedTankId) {
      setSelectedTankId(tanks[0].id);
    }
  }, [isLoading, tanks]);

  useEffect(() => {
    if (selectedTankId) {
      setIsLoadingHistory(true);
      
      // Get the number of days based on the selected range
      let days = 7;
      switch (dateRange) {
        case "24hours": days = 1; break;
        case "7days": days = 7; break;
        case "30days": days = 30; break;
        case "90days": days = 90; break;
      }
      
      // Generate simulated history data
      setTimeout(() => {
        const { data, history, events } = generateTankHistoryData(selectedTankId, days);
        setHistoryData(data);
        setTankHistory(history);
        setTankEvents(events);
        setIsLoadingHistory(false);
      }, 500); // Simulate API delay
    }
  }, [selectedTankId, dateRange]);

  // Filter history based on search and event type
  const filteredHistory = tankHistory.filter((entry) => {
    const matchesSearch = searchQuery === "" || 
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEventType = eventFilter === "all" || entry.eventType === eventFilter ||
      (eventFilter === "alerts" && (entry.eventType === "alert_high" || entry.eventType === "alert_low"));
    
    return matchesSearch && matchesEventType;
  });

  // Prepare chart data
  const chartData = historyData.filter((_, index) => {
    // Filter based on date range to reduce data points for performance
    const mod = dateRange === "24hours" ? 1 : dateRange === "7days" ? 4 : 12;
    return index % mod === 0;
  }).map((entry) => ({
    time: format(parseISO(entry.timestamp), dateRange === "24hours" ? "HH:mm" : "MMM dd HH:mm"),
    fillLevel: parseFloat(entry.fillLevel.toFixed(1)),
    temperature: entry.temperature
  }));

  // Get badge style based on event type
  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "fill":
        return <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">Fill</Badge>;
      case "temperature":
        return <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">Temperature</Badge>;
      case "alert":
      case "alert_high":
      case "alert_low":
        return <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Alert</Badge>;
      case "maintenance":
        return <Badge className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">Maintenance</Badge>;
      case "status":
        return <Badge className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">Status</Badge>;
      default:
        return <Badge>{eventType}</Badge>;
    }
  };

  // Get icon based on event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "fill":
        return <DropletIcon className="w-5 h-5 text-blue-500" />;
      case "temperature":
        return <ThermometerIcon className="w-5 h-5 text-orange-500" />;
      case "alert":
      case "alert_high":
      case "alert_low":
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />;
      case "maintenance":
        return <HistoryIcon className="w-5 h-5 text-purple-500" />;
      case "status":
        return <ClockIcon className="w-5 h-5 text-green-500" />;
      default:
        return <HistoryIcon className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HistoryIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400 animate-pulse" />
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading history data...</p>
        </div>
      </div>
    );
  }

  if (tanks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
            No tanks found. Please add tanks to view history.
          </p>
          <Button variant="outline" onClick={() => window.location.pathname = '/settings'}>
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tank History</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            View historical data and events for your tanks
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-2">
          <Select
            value={selectedTankId?.toString() || ""}
            onValueChange={(value) => setSelectedTankId(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Tank" />
            </SelectTrigger>
            <SelectContent>
              {tanks.map((tank) => (
                <SelectItem key={tank.id} value={tank.id.toString()}>
                  {tank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Time Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => setDateRange("24hours")}
                  className={dateRange === "24hours" ? "bg-accent" : ""}
                >
                  Last 24 Hours
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDateRange("7days")}
                  className={dateRange === "7days" ? "bg-accent" : ""}
                >
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDateRange("30days")}
                  className={dateRange === "30days" ? "bg-accent" : ""}
                >
                  Last 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDateRange("90days")}
                  className={dateRange === "90days" ? "bg-accent" : ""}
                >
                  Last 90 Days
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoadingHistory ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <HistoryIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400 animate-pulse" />
            <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading history data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Data Visualization */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>
                {`${tanks.find(t => t.id === selectedTankId)?.name || 'Tank'} - `}
                {dateRange === "24hours" ? "Last 24 Hours" :
                 dateRange === "7days" ? "Last 7 Days" :
                 dateRange === "30days" ? "Last 30 Days" : 
                 "Last 90 Days"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(tick) => {
                        // Simplify x-axis labels based on date range
                        if (dateRange === "24hours" || chartData.length <= 24) {
                          return tick.split(' ')[0]; // Just show hours
                        }
                        // For longer ranges, show day/hour
                        const parts = tick.split(' ');
                        return parts.length > 1 ? `${parts[0]} ${parts[1].split(':')[0]}h` : tick;
                      }}
                    />
                    <YAxis yAxisId="left" label={{ value: 'Fill Level (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 40]} label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === "fillLevel") return [`${value}%`, "Fill Level"];
                        if (name === "temperature") return [`${value}°C`, "Temperature"];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="fillLevel"
                      stroke="#3b82f6"
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* History Logs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="history">History Log</TabsTrigger>
              <TabsTrigger value="events">Events ({tankEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <CardTitle>Tank History Log</CardTitle>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search logs..."
                          className="pl-8 w-[200px] md:w-[300px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <FilterIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              onClick={() => setEventFilter("all")}
                              className={eventFilter === "all" ? "bg-accent" : ""}
                            >
                              All Events
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setEventFilter("status")}
                              className={eventFilter === "status" ? "bg-accent" : ""}
                            >
                              Status Updates
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setEventFilter("alerts")}
                              className={eventFilter === "alerts" ? "bg-accent" : ""}
                            >
                              Alerts
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredHistory.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-lg">
                      <HistoryIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                      <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        No history logs found
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-500 mt-2">
                        {searchQuery || eventFilter !== "all" ? 
                          "Try adjusting your search filters" : 
                          "No activity has been recorded yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredHistory.map((entry, index) => (
                        <div key={entry.id} className="relative pl-8">
                          {/* Timeline connector */}
                          {index < filteredHistory.length - 1 && (
                            <div className="absolute left-[14px] top-8 bottom-0 w-[2px] bg-neutral-200 dark:bg-neutral-700"></div>
                          )}
                          
                          {/* Event icon */}
                          <div className="absolute left-0 top-0 rounded-full p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                            {getEventIcon(entry.eventType)}
                          </div>
                          
                          <div className="flex flex-col">
                            <div className="flex items-center mb-1">
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {format(parseISO(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                              <div className="ml-2">
                                {getEventBadge(entry.eventType)}
                              </div>
                            </div>
                            
                            <p className="text-neutral-800 dark:text-neutral-200">
                              {entry.description}
                            </p>
                            
                            {entry.value !== null && entry.temperature && (
                              <div className="flex space-x-4 mt-2 text-sm">
                                <div className="flex items-center">
                                  <DropletIcon className="w-4 h-4 mr-1 text-blue-500" />
                                  <span>{entry.value.toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center">
                                  <ThermometerIcon className="w-4 h-4 mr-1 text-orange-500" />
                                  <span>{entry.temperature}°C</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {index < filteredHistory.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Tank Events</CardTitle>
                  <CardDescription>
                    Key events and alerts for {tanks.find(t => t.id === selectedTankId)?.name || 'this tank'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tankEvents.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-lg">
                      <HistoryIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                      <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        No events found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tankEvents.map((event) => (
                        <div key={event.id} className="flex p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                          <div className="mr-4">
                            {getEventIcon(event.eventType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} Event
                                </span>
                                {getEventBadge(event.eventType)}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {format(parseISO(event.timestamp), "MMM d, yyyy")}
                              </div>
                            </div>
                            
                            <p className="text-neutral-600 dark:text-neutral-400">
                              {event.description}
                            </p>
                            
                            {event.value !== null && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Value:</span> {event.value}
                                {event.eventType === "temperature" ? "°C" : "%"}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}