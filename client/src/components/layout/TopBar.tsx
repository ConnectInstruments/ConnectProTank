import { useTheme } from "@/hooks/use-theme";
import { useCurrentDateTime } from "@/lib/date-utils";

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

export default function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { date, time } = useCurrentDateTime();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            className="md:hidden p-2 mr-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
            onClick={onMobileMenuToggle}
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
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
          <h1 className="md:hidden text-lg font-bold text-primary">ConnectPro</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            <span>{date}</span> <span>{time}</span>
          </div>

          <button
            className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
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
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M6.34 17.66l-1.41 1.41" />
                <path d="M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
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
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
