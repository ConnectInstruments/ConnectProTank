import { useState } from "react";
import { useTankData } from "@/hooks/use-tank-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SettingsPage() {
  const { toast } = useToast();
  const { tanks, deleteTank } = useTankData();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [tankToDelete, setTankToDelete] = useState<number | null>(null);

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

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">App Settings</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage tank database connections and settings
        </p>
      </div>

      {/* Connected Tanks */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connected Tanks</CardTitle>
          <CardDescription>
            Manage tanks connected to the monitoring system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tanks.length === 0 ? (
              <div className="p-4 border border-dashed rounded-md text-center">
                <p className="text-neutral-600 dark:text-neutral-400">
                  No tanks connected yet. Add a tank from the Tank Levels page.
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
    </div>
  );
}
