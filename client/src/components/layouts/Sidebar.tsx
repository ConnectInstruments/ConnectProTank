import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  GasStation, 
  Thermometer, 
  Settings, 
  Info 
} from "lucide-react";

const navItems = [
  { href: "/", label: "Tank Levels", icon: GasStation },
  { href: "/temperatures", label: "Temperatures", icon: Thermometer },
  { href: "/settings", label: "App Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center">
              <GasStation className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">ConnectPro</h1>
          </div>
        </div>
        
        <nav className="flex-1 pt-4 px-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors duration-150 ${
                    isActive 
                      ? "bg-gray-100 dark:bg-gray-900 text-orange-500" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Info className="h-4 w-4" />
            <span>v1.2.0</span>
          </div>
        </div>
      </aside>
      
      {/* Mobile sidebar toggle button */}
      <div className="md:hidden">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center">
                <GasStation className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold">ConnectPro</h1>
            </div>
          </div>
          
          <nav className="flex-1 pt-4 px-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors duration-150 ${
                      isActive 
                        ? "bg-gray-100 dark:bg-gray-900 text-orange-500" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Info className="h-4 w-4" />
              <span>v1.2.0</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
