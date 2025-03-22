import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TankSvgProps {
  fillLevel: number;
}

export default function TankSvg({ fillLevel }: TankSvgProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 2000);
    return () => clearTimeout(timer);
  }, [fillLevel]);

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 100 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tank Outline */}
      <rect
        x="5"
        y="20"
        width="90"
        height="130"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        className="text-neutral-400 dark:text-neutral-600"
      />
      <rect
        x="30"
        y="5"
        width="40"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        className="text-neutral-400 dark:text-neutral-600"
      />
      <rect
        x="20"
        y="150"
        width="60"
        height="5"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        className="text-neutral-400 dark:text-neutral-600"
      />

      {/* Tank Fill Area (Background) */}
      <rect
        x="10"
        y="25"
        width="80"
        height="120"
        rx="3"
        fill="currentColor"
        className="text-neutral-100 dark:text-neutral-800"
      />

      {/* Tank Fill Animation */}
      <rect
        x="10"
        y={25 + 120 - (fillLevel / 100) * 120}
        width="80"
        height={(fillLevel / 100) * 120}
        rx="3"
        fill="currentColor"
        style={{
          transition: animate ? "height 2s ease-out, y 2s ease-out" : "none",
        }}
        className={cn(
          "text-primary origin-bottom",
          animate && "animate-in fade-in duration-1000"
        )}
      />

      {/* Percentage Label */}
      <foreignObject x="0" y="0" width="100" height="160">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="h-full w-full flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-white drop-shadow-md">
            {fillLevel}%
          </span>
        </div>
      </foreignObject>
    </svg>
  );
}
