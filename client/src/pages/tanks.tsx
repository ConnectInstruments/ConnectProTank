import { useEffect, useState } from "react";
import StatusCard from "@/components/status/StatusCard";
import TankCard from "@/components/tank/TankCard";
import { useTankData } from "@/hooks/use-tank-data";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export default function TanksPage() {
  const { tanks, isLoading, statistics } = useTankData();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdated(prevDate => new Date());
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          title="Total Stock"
          value={`${statistics.formattedTotalStock}`}
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
              <path d="M6 16.5l-3 2.94h18l-3-2.94" />
              <path d="M2 18.5l.5-8h19l.5 8" />
              <path d="M9.5 10.5v-8h5v8" />
            </svg>
          }
          bgColorClass="bg-orange-100 dark:bg-orange-900/30"
          textColorClass="text-orange-600 dark:text-orange-400"
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

      {/* Total Capacity Overview */}
      <div className="mb-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">Total Capacity Status</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {statistics.formattedTotalStock} used of {statistics.formattedTotalCapacity} total capacity
            </p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-full">
            <span className="text-sm font-medium">
              {statistics.stockPercentage}% Utilized
            </span>
          </div>
        </div>

        <div className="mt-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              statistics.stockPercentage > 90 
                ? 'bg-red-500' 
                : statistics.stockPercentage > 75 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${statistics.stockPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tank Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tanks.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-neutral-500"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No Tanks Available</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
              There are no tanks connected to the monitoring system yet. You can add tanks from the App Settings page.
            </p>
            <Button variant="outline" onClick={() => window.location.pathname = '/settings'}>
              Go to Settings
            </Button>
          </div>
        ) : (
          tanks.map((tank) => (
            <TankCard key={tank.id} tank={tank} />
          ))
        )}
      </div>
    </div>
  );
}