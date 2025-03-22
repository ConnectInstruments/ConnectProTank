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

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/30">
        <button className="w-full py-2 px-4 flex items-center justify-center space-x-2 rounded-md border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
}
