import { useEffect, useState } from "react";
import StatusCard from "@/components/status/StatusCard";
import TankCard from "@/components/tank/TankCard";
import { useTankData } from "@/hooks/use-tank-data";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTankSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertTankSchema.extend({
  fillLevel: z.coerce.number().min(0).max(100),
  temperature: z.coerce.number().min(-50).max(150),
});

type FormValues = z.infer<typeof formSchema>;

export default function TanksPage() {
  const { toast } = useToast();
  const { tanks, isLoading, statistics, createTank } = useTankData();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fillLevel: 50,
      temperature: 24,
      status: "online",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createTank.mutateAsync(data);
      toast({
        title: "Success",
        description: `Tank ${data.name} has been added successfully.`,
      });
      form.reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tank. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading tanks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tank Levels</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Real-time monitoring of tank fill levels
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
          <button
            className={`p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
              isRefreshing ? "animate-spin" : ""
            }`}
            onClick={handleRefresh}
          >
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
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusCard
          title="All Systems"
          value={statistics.isAllSystemsOperational ? "Operational" : "Warning"}
          icon={
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          bgColorClass="bg-green-100 dark:bg-green-900/30"
          textColorClass="text-green-600 dark:text-green-400"
        />

        <StatusCard
          title="Average Fill Level"
          value={`${statistics.avgFillLevel}%`}
          icon={
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
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
              <path d="M3 7h18" />
              <path d="M8 10v8" />
              <path d="M16 10v8" />
              <path d="M12 10v8" />
            </svg>
          }
          bgColorClass="bg-primary-light/20"
          textColorClass="text-primary"
        />

        <StatusCard
          title="Average Temperature"
          value={`${statistics.avgTemperature}°C`}
          icon={
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
          }
          bgColorClass="bg-blue-100 dark:bg-blue-900/30"
          textColorClass="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Tank Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tanks.map((tank) => (
          <TankCard key={tank.id} tank={tank} />
        ))}

        {/* Add New Tank Card */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-dashed border-neutral-300 dark:border-neutral-600 overflow-hidden p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-neutral-600 dark:text-neutral-300"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2 text-center">Add New Tank</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-4">
                Connect a new tank to the system
              </p>
              <Button variant="outline">
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
            </div>
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
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTank.isPending}>
                    {createTank.isPending ? "Adding..." : "Add Tank"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
