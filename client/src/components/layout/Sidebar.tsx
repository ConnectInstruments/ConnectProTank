import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react"; // Added import for FileTextIcon

// Missing Logo Context and Upload Logic

function useLogo() {
  // Placeholder -  Replace with actual logo state management
  const logoUrl = "/path/to/default/logo.png"; // Default logo
  return {logoUrl};
}


export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Tank Levels",
      path: "/tanks",
      icon: (
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
      ),
    },
    {
      name: "Temperatures",
      path: "/temperatures",
      icon: (
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
      ),
    },
    {
      name: "App Settings",
      path: "/settings",
      icon: (
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
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V4a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V4a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText />, // Corrected icon usage
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 shadow-sm">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-center gap-2">
          <img src="/attached_assets/logo.png" alt="Logo" className="h-12 w-auto" />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={cn(
                "flex items-center p-3 space-x-3 rounded-md transition cursor-pointer",
                location === item.path ||
                  (item.path === "/tanks" && location === "/")
                  ? "bg-neutral-100 dark:bg-neutral-700 text-primary"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center space-x-2">
          <span className="block h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
            Connected
          </span>
        </div>
      </div>
    </aside>
  );
}

// Placeholder for Reports page -  Requires backend API integration and download functionality.
function ReportsPage() {
  return (
    <div>
      <h1>Reports Page</h1>
      <p>This page will eventually display and allow downloading of reports.</p>
    </div>
  );
}

export { ReportsPage };