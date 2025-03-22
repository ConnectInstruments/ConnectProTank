import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatusCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

export default function StatusCard({
  title,
  value,
  icon,
  bgColorClass,
  textColorClass,
}: StatusCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            "p-3 rounded-full",
            bgColorClass,
            textColorClass
          )}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
