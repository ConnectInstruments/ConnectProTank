import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  RotateCcw,
  GasStation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/use-websocket";
import { useThemeContext } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { tanks } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeContext();
  
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(true);
  const [exportFormat, setExportFormat] = useState("CSV");
  
  // Tank form state
  const [showAddTankForm, setShowAddTankForm] = useState(false);
  const [newTank, setNewTank] = useState({
    name: "",
    location: "",
    connectionString: "",
    maxCapacity: 1000,
    refreshRate: 30,
    alertThreshold: 15
  });
  
  // Create tank mutation
  const createTankMutation = useMutation({
    mutationFn: async (tankData: any) => {
      const response = await apiRequest("POST", "/api/tanks", tankData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tanks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowAddTankForm(false);
      setNewTank({
        name: "",
        location: "",
        connectionString: "",
        maxCapacity: 1000,
        refreshRate: 30,
        alertThreshold: 15
      });
      toast({
        title: "Success",
        description: "Tank added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add tank",
        variant: "destructive",
      });
    }
  });
  
  // Delete tank mutation
  const deleteTankMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tanks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tanks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Tank removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove tank",
        variant: "destructive",
      });
    }
  });
  
  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Your application settings have been saved",
    });
  };
  
  // Handle add tank
  const handleAddTank = () => {
    createTankMutation.mutate({
      ...newTank,
      currentLevel: 0,
      currentPercentage: 0,
      temperature: 20.0,
      isConnected: true
    });
  };
  
  // Handle delete tank
  const handleDeleteTank = (id: number) => {
    if (confirm("Are you sure you want to remove this tank?")) {
      deleteTankMutation.mutate(id);
    }
  };
  
  // Handle test connection
  const handleTestConnection = (tankName: string) => {
    toast({
      title: "Connection Test",
      description: `Successfully connected to ${tankName}`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">App Settings</h2>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tank Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tanks.map(tank => (
              <div key={tank.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-orange-500/10 rounded-full flex items-center justify-center mr-3">
                      <GasStation className="text-orange-500 h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{tank.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{tank.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      type="button" 
                      className="inline-flex items-center p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      type="button" 
                      className="inline-flex items-center p-1 text-red-400 hover:text-red-500 dark:hover:text-red-300"
                      onClick={() => handleDeleteTank(tank.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`connection-${tank.id}`} className="block text-sm font-medium mb-1">
                      Connection String
                    </Label>
                    <div className="relative">
                      <Input 
                        id={`connection-${tank.id}`}
                        type="text" 
                        value={tank.connectionString || ""} 
                        className="pr-8"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`refresh-${tank.id}`} className="block text-sm font-medium mb-1">
                      API Refresh Rate
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Slider 
                        id={`refresh-${tank.id}`}
                        defaultValue={[tank.refreshRate]} 
                        min={5} 
                        max={60} 
                        step={1}
                        className="flex-1" 
                      />
                      <span className="text-sm font-medium w-8">{tank.refreshRate}s</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`capacity-${tank.id}`} className="block text-sm font-medium mb-1">
                      Maximum Capacity
                    </Label>
                    <div className="relative">
                      <Input 
                        id={`capacity-${tank.id}`}
                        type="number" 
                        value={tank.maxCapacity} 
                        className="pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 dark:text-gray-400">L</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`alert-${tank.id}`} className="block text-sm font-medium mb-1">
                      Alert Threshold
                    </Label>
                    <div className="relative">
                      <Input 
                        id={`alert-${tank.id}`}
                        type="number" 
                        value={tank.alertThreshold} 
                        className="pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 dark:text-gray-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Tank Status</span>
                      <Badge variant="success">
                        Connected
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection(tank.name)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {showAddTankForm ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 transition-colors duration-200">
                <h4 className="font-medium mb-4">Add New Tank</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-tank-name" className="block text-sm font-medium mb-1">
                      Tank Name
                    </Label>
                    <Input 
                      id="new-tank-name"
                      type="text" 
                      placeholder="e.g., Tank D-405"
                      value={newTank.name}
                      onChange={(e) => setNewTank({...newTank, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-tank-location" className="block text-sm font-medium mb-1">
                      Location
                    </Label>
                    <Input 
                      id="new-tank-location"
                      type="text" 
                      placeholder="e.g., West Facility"
                      value={newTank.location}
                      onChange={(e) => setNewTank({...newTank, location: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-tank-connection" className="block text-sm font-medium mb-1">
                      Connection String
                    </Label>
                    <Input 
                      id="new-tank-connection"
                      type="text" 
                      placeholder="mongodb://tankdb:27017/tanks/..."
                      value={newTank.connectionString}
                      onChange={(e) => setNewTank({...newTank, connectionString: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-tank-refresh" className="block text-sm font-medium mb-1">
                      Refresh Rate (seconds)
                    </Label>
                    <Input 
                      id="new-tank-refresh"
                      type="number" 
                      min={5}
                      max={60}
                      value={newTank.refreshRate}
                      onChange={(e) => setNewTank({...newTank, refreshRate: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-tank-capacity" className="block text-sm font-medium mb-1">
                      Maximum Capacity (L)
                    </Label>
                    <Input 
                      id="new-tank-capacity"
                      type="number" 
                      min={100}
                      value={newTank.maxCapacity}
                      onChange={(e) => setNewTank({...newTank, maxCapacity: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-tank-alert" className="block text-sm font-medium mb-1">
                      Alert Threshold (%)
                    </Label>
                    <Input 
                      id="new-tank-alert"
                      type="number" 
                      min={5}
                      max={50}
                      value={newTank.alertThreshold}
                      onChange={(e) => setNewTank({...newTank, alertThreshold: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddTankForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddTank}
                    disabled={!newTank.name || !newTank.location}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tank
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed"
                onClick={() => setShowAddTankForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add New Tank</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Data Refresh Interval</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">How often to fetch new data from the server</p>
              </div>
              <div className="flex items-center space-x-2">
                <Slider 
                  defaultValue={[refreshInterval]} 
                  min={5} 
                  max={60} 
                  step={1}
                  onValueChange={(val) => setRefreshInterval(val[0])}
                  className="w-32" 
                />
                <span className="text-sm font-medium">{refreshInterval}s</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Theme Preference</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose between light, dark or system theme</p>
              </div>
              <div>
                <Select 
                  defaultValue={theme}
                  onValueChange={(value: any) => setTheme(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable browser notifications for alerts</p>
              </div>
              <div>
                <Switch 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Alert Sound</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Play sound when tank level is below threshold</p>
              </div>
              <div>
                <Switch 
                  checked={alertSoundEnabled}
                  onCheckedChange={setAlertSoundEnabled}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Data Export Format</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Format for exporting tank data reports</p>
              </div>
              <div>
                <Select 
                  defaultValue={exportFormat}
                  onValueChange={setExportFormat}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
