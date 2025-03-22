import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Tank } from "@shared/schema";
import TankVisualization from "@/components/ui/tank-visualization";
import { calculateTankVolume, formatLiters } from "@/lib/tank-utils";

interface TankCardProps {
  tank: Tank;
}

export default function TankCard({ tank }: TankCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const lastUpdatedText = tank.lastUpdated
    ? formatDistanceToNow(new Date(tank.lastUpdated), { addSuffix: true })
    : "Unknown";

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <h3 className="font-semibold text-lg">{tank.name}</h3>
        <div className="flex items-center space-x-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              getStatusColor(tank.status)
            )}
          ></span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {getStatusText(tank.status)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <TankVisualization tank={tank} />
      </div>

      </div>
  );
}
