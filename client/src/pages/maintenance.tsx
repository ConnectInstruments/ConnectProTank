import { useState, useEffect } from "react";
import { CalendarIcon, Clock10Icon, ToolIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from "lucide-react";
import { format, parseISO, isAfter, addDays, isBefore } from "date-fns";

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTankData } from "@/hooks/use-tank-data";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function MaintenancePage() {
  const { tanks, isLoading } = useTankData();
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<any[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchMaintenance = async () => {
    if (tanks.length === 0) return;
    setIsLoadingMaintenance(true);
    
    try {
      // This is a placeholder - we'll implement the API for this later
      const allMaintenance = [];
      
      for (const tank of tanks) {
        // Simulate fetching maintenance for each tank from API
        const currentDate = new Date();
        const pastDate = addDays(currentDate, -30);
        
        // Add past maintenance entries
        if (tank.lastMaintenance) {
          allMaintenance.push({
            id: `${tank.id}-past-1`,
            tankId: tank.id,
            scheduledDate: tank.lastMaintenance,
            completedDate: tank.lastMaintenance,
            maintenanceType: "Routine Check",
            description: "Regular inspection and cleaning",
            technician: "John Doe",
            status: "completed"
          });
        }
        
        // Add upcoming maintenance entries
        if (tank.nextMaintenance) {
          allMaintenance.push({
            id: `${tank.id}-future-1`,
            tankId: tank.id,
            scheduledDate: tank.nextMaintenance,
            completedDate: null,
            maintenanceType: "Full Inspection",
            description: "Comprehensive inspection and service",
            technician: "Jane Smith",
            status: "scheduled"
          });
        }
        
        // Add some random maintenance entries
        const randomPastDate = new Date(pastDate.getTime() + Math.random() * (currentDate.getTime() - pastDate.getTime()));
        allMaintenance.push({
          id: `${tank.id}-past-2`,
          tankId: tank.id,
          scheduledDate: randomPastDate.toISOString(),
          completedDate: randomPastDate.toISOString(),
          maintenanceType: "Sensor Calibration",
          description: "Calibration of pressure and temperature sensors",
          technician: "Tech Team",
          status: "completed"
        });
        
        // Add one in-progress item
        if (tank.id === 1) {
          allMaintenance.push({
            id: `${tank.id}-current-1`,
            tankId: tank.id,
            scheduledDate: new Date().toISOString(),
            completedDate: null,
            maintenanceType: "Valve Replacement",
            description: "Replacing inlet valve due to wear",
            technician: "Maintenance Team",
            status: "in-progress"
          });
        }
        
        // Add one cancelled item
        if (tank.id === 2) {
          const cancelDate = addDays(currentDate, -10);
          allMaintenance.push({
            id: `${tank.id}-cancelled-1`,
            tankId: tank.id,
            scheduledDate: cancelDate.toISOString(),
            completedDate: null,
            maintenanceType: "Deep Clean",
            description: "Postponed due to production schedule",
            technician: "Cleaning Team",
            status: "cancelled"
          });
        }
      }
      
      // Filter maintenance entries into upcoming and history
      const upcoming = allMaintenance.filter(item => 
        item.status === "scheduled" || item.status === "in-progress"
      ).sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      
      const history = allMaintenance.filter(item => 
        item.status === "completed" || item.status === "cancelled"
      ).sort((a, b) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );
      
      setMaintenanceSchedule(upcoming);
      setMaintenanceHistory(history);
    } catch (error) {
      console.error("Error fetching maintenance data:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMaintenance(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchMaintenance();
    }
  }, [isLoading, tanks]);

  const getTankById = (id: number) => {
    return tanks.find(tank => tank.id === id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">Scheduled</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      case "in-progress":
        return <Clock10Icon className="w-5 h-5 text-orange-500" />;
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ToolIcon className="w-5 h-5" />;
    }
  };

  // Function to mark maintenance as complete
  const completeMaintenance = (maintenanceId: string) => {
    // In a real app, this would make an API call
    const updatedSchedule = maintenanceSchedule.filter(item => item.id !== maintenanceId);
    
    const completedItem = maintenanceSchedule.find(item => item.id === maintenanceId);
    if (completedItem) {
      completedItem.status = "completed";
      completedItem.completedDate = new Date().toISOString();
      setMaintenanceHistory([completedItem, ...maintenanceHistory]);
    }
    
    setMaintenanceSchedule(updatedSchedule);
    
    toast({
      title: "Maintenance Complete",
      description: "Maintenance has been marked as complete",
    });
  };

  // Function to cancel maintenance
  const cancelMaintenance = (maintenanceId: string) => {
    // In a real app, this would make an API call
    const updatedSchedule = maintenanceSchedule.filter(item => item.id !== maintenanceId);
    
    const cancelledItem = maintenanceSchedule.find(item => item.id === maintenanceId);
    if (cancelledItem) {
      cancelledItem.status = "cancelled";
      setMaintenanceHistory([cancelledItem, ...maintenanceHistory]);
    }
    
    setMaintenanceSchedule(updatedSchedule);
    
    toast({
      title: "Maintenance Cancelled",
      description: "Maintenance has been cancelled",
    });
  };

  if (isLoading || isLoadingMaintenance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ToolIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400 animate-pulse" />
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  if (tanks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
            No tanks found. Please add tanks to schedule maintenance.
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
          <h2 className="text-2xl font-bold">Maintenance Management</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Schedule and track maintenance for your tanks
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <ToolIcon className="mr-2 h-4 w-4" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule New Maintenance</DialogTitle>
                <DialogDescription>
                  Create a new maintenance task for one of your tanks.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="tank" className="text-right">
                    Tank
                  </label>
                  <select
                    id="tank"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedTankId || ""}
                    onChange={(e) => setSelectedTankId(Number(e.target.value))}
                  >
                    <option value="">Select a tank</option>
                    {tanks.map((tank) => (
                      <option key={tank.id} value={tank.id}>
                        {tank.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="type" className="text-right">
                    Type
                  </label>
                  <select
                    id="type"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="inspection">Inspection</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="repair">Repair</option>
                    <option value="calibration">Calibration</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="date" className="text-right">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="technician" className="text-right">
                    Technician
                  </label>
                  <input
                    id="technician"
                    type="text"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  ></textarea>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => {
                    toast({
                      title: "Maintenance Scheduled",
                      description: "New maintenance has been scheduled",
                    });
                  }}
                >
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Maintenance Tabs */}
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming ({maintenanceSchedule.length})</TabsTrigger>
          <TabsTrigger value="history">History ({maintenanceHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {maintenanceSchedule.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg">
              <ToolIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                No upcoming maintenance scheduled
              </p>
              <p className="text-neutral-500 dark:text-neutral-500 mt-2">
                Use the Schedule Maintenance button to create new tasks
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceSchedule.map((maintenance) => {
                const tank = getTankById(maintenance.tankId);
                const isUrgent = tank && maintenance.status === "scheduled" && 
                  isBefore(parseISO(maintenance.scheduledDate), addDays(new Date(), 3));
                
                return (
                  <Card key={maintenance.id} className={isUrgent ? "border-red-300" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(maintenance.status)}
                          <CardTitle className="text-lg">
                            {maintenance.maintenanceType}
                            {isUrgent && (
                              <Badge className="ml-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                Urgent
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                        {getStatusBadge(maintenance.status)}
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        <span className="font-medium">
                          {tank ? tank.name : `Tank ${maintenance.tankId}`}
                        </span>
                        <span className="mx-2">•</span>
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        {format(parseISO(maintenance.scheduledDate), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        {maintenance.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                        <span className="font-medium">Technician:</span>
                        <span className="ml-2">{maintenance.technician}</span>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        {maintenance.status === "scheduled" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => completeMaintenance(maintenance.id)}
                            >
                              Mark Complete
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-500 hover:text-red-600"
                              onClick={() => cancelMaintenance(maintenance.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {maintenance.status === "in-progress" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => completeMaintenance(maintenance.id)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {maintenanceHistory.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg">
              <ToolIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                No maintenance history found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceHistory.map((maintenance) => {
                const tank = getTankById(maintenance.tankId);
                
                return (
                  <Card key={maintenance.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(maintenance.status)}
                          <CardTitle className="text-lg">
                            {maintenance.maintenanceType}
                          </CardTitle>
                        </div>
                        {getStatusBadge(maintenance.status)}
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        <span className="font-medium">
                          {tank ? tank.name : `Tank ${maintenance.tankId}`}
                        </span>
                        <span className="mx-2">•</span>
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        {format(parseISO(maintenance.scheduledDate), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        {maintenance.description}
                      </p>
                      
                      <div className="flex flex-col space-y-2 text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                        <div className="flex items-center">
                          <span className="font-medium">Technician:</span>
                          <span className="ml-2">{maintenance.technician}</span>
                        </div>
                        
                        {maintenance.status === "completed" && maintenance.completedDate && (
                          <div className="flex items-center">
                            <span className="font-medium">Completed:</span>
                            <span className="ml-2">
                              {format(parseISO(maintenance.completedDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}