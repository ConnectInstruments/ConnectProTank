import { useState } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useThemeContext } from "../ThemeProvider";
import { useDateTime } from "@/hooks/use-date-time";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useThemeContext();
  const { dateTime } = useDateTime();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-3 md:hidden">
            <h1 className="text-lg font-bold">ConnectPro</h1>
          </div>
        </div>
        
        <div className="flex flex-1 justify-end items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {dateTime}
          </div>
          
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-1 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
