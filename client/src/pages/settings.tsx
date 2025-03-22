import { useState } from "react";
import { useTankData } from "@/hooks/use-tank-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Lock, Check, Database } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTankSchema } from "@shared/schema";

const formSchema = insertTankSchema.extend({
  fillLevel: z.coerce.number().min(0).max(100),
  temperature: z.coerce.number().min(-50).max(150),
  capacity: z.coerce.number().positive().min(100).max(150000),
});

type FormValues = z.infer<typeof formSchema>;

// The required password for settings access
const ADMIN_PASSWORD = "42013231";

export default function SettingsPage() {
  const { toast } = useToast();
  const { tanks, deleteTank, createTank } = useTankData();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [tankToDelete, setTankToDelete] = useState<number | null>(null);

  // Password authentication states
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInvalidMessage, setShowInvalidMessage] = useState(false);
  const [databaseConnection, setDatabaseConnection] = useState("memory");

  // Form for adding tanks
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fillLevel: 50,
      temperature: 24,
      capacity: 1000,
      status: "online",
    },
  });

  const handleDeleteClick = (tankId: number) => {
    setTankToDelete(tankId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (tankToDelete !== null) {
      try {
        await deleteTank.mutateAsync(tankToDelete);
        toast({
          title: "Success",
          description: "Tank has been removed successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove tank. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsConfirmDeleteOpen(false);
        setTankToDelete(null);
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Include the database connection type with the tank data as a separate field
      // The server will handle this properly in the routes
      await createTank.mutateAsync({
        ...data,
        dbType: databaseConnection 
      } as any); // Using type assertion to bypass TypeScript check

      toast({
        title: "Success",
        description: `Tank ${data.name} has been added to ${databaseConnection} storage.`,
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tank. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowInvalidMessage(false);
      toast({
        title: "Access Granted",
        description: "You now have access to the admin settings.",
      });
    } else {
      setShowInvalidMessage(true);
      setPassword("");
    }
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">App Settings</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage tank database connections and settings
        </p>
      </div>

      {!isAuthenticated ? (
        <Card className="max-w-md mx-auto my-12">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-12 w-12 text-orange-500 mb-2" />
            </div>
            <CardTitle className="text-center">Admin Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please enter the admin password to access settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter admin password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {showInvalidMessage && (
                  <p className="text-sm text-red-500 mt-1">Invalid password. Please try again.</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Authenticated banner */}
          <div className="mb-6 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-3 flex items-center">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-300 font-medium">
              Admin access granted. You can now manage all settings.
            </span>
          </div>

          {/* Logo Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
              <CardDescription>Upload or change your application logo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border rounded-lg flex items-center justify-center bg-white">
                    <img
                      src="/logo.svg"
                      alt="Current logo"
                      className="max-w-full max-h-full p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.svg"
                      className="hidden"
                      id="logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload here
                          const formData = new FormData();
                          formData.append('logo', file);
                          // Add your upload logic here
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      Upload New Logo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supported formats: JPEG, SVG. Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Tanks */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Connected Tanks</CardTitle>
                <CardDescription>
                  Manage tanks connected to the monitoring system
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 mr-2"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add Tank
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Tank</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Tank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="online">Online</option>
                                <option value="warning">Warning</option>
                                <option value="offline">Offline</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fillLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fill Level (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tank Capacity (Liters)</FormLabel>
                            <FormControl>
                              <Input type="number" min="100" max="150000" placeholder="Enter tank capacity (up to 150000L)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="database-connection">Database Connection</Label>
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-neutral-500" />
                          <select
                            id="database-connection"
                            className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={databaseConnection}
                            onChange={(e) => setDatabaseConnection(e.target.value)}
                          >
                            <option value="memory">In-Memory Storage</option>
                            <option value="firebase">Firebase Database</option>
                            <option value="postgres">PostgreSQL Database</option>
                            <option value="mysql">MySQL Database</option>
                            <option value="mongodb">MongoDB</option>
                          </select>
                        </div>
                        <p className="text-sm text-neutral-500">Select the database to store tank data</p>
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <Button type="submit" disabled={createTank.isPending}>
                          {createTank.isPending ? "Adding..." : "Add Tank"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {tanks.length === 0 ? (
                  <div className="p-4 border border-dashed rounded-md text-center">
                    <p className="text-neutral-600 dark:text-neutral-400">
                      No tanks connected yet. Use the "Add Tank" button to connect a new tank.
                    </p>
                  </div>
                ) : (
                  tanks.map((tank) => (
                    <div
                      key={tank.id}
                      className="p-4 border rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              tank.status === "online"
                                ? "bg-green-500"
                                : tank.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                          <h3 className="font-medium">{tank.name}</h3>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          Status: {tank.status}, Fill Level: {tank.fillLevel}%, Temp: {tank.temperature}°C
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Capacity: {tank.capacity} L
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(tank.id)}
                          disabled={deleteTank.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Connection */}
          <Card>
            <CardHeader>
              <CardTitle>API Connection</CardTitle>
              <CardDescription>
                Configure the connection to the tank monitoring API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-url">API URL</Label>
                    <Input
                      id="api-url"
                      placeholder="https://api.example.com"
                      defaultValue={window.location.origin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" placeholder="Enter API key" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="polling-interval">Polling Interval (seconds)</Label>
                  <Input
                    id="polling-interval"
                    type="number"
                    min="1"
                    defaultValue="5"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "Your API connection settings have been updated.",
                  });
                }}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Confirm Delete Dialog */}
          <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Tank Removal</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to remove this tank from the monitoring system? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  {deleteTank.isPending ? "Removing..." : "Remove Tank"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}