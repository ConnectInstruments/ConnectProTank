import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import TanksPage from "@/pages/tanks";
import TemperaturesPage from "@/pages/temperatures";
import SettingsPage from "@/pages/settings";
import ReportsPage from "./pages/reports";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { useState, createContext, useContext } from "react";

// Logo context
const LogoContext = createContext(null);

const LogoProvider = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState(null); // Initial logo URL (can be a default)

  const updateLogo = (newLogoUrl) => {
    setLogoUrl(newLogoUrl);
  };

  return (
    <LogoContext.Provider value={{ logoUrl, updateLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error("useLogo must be used within a LogoProvider");
  }
  return context;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={TanksPage} />
      <Route path="/tanks" component={TanksPage} />
      <Route path="/temperatures" component={TemperaturesPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <LogoProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <MobileSidebar open={mobileMenuOpen} onClose={toggleMobileMenu} />
            <div className="flex flex-col flex-1 w-full overflow-hidden">
              <TopBar onMobileMenuToggle={toggleMobileMenu} />
              <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto w-full">
                  <Router />
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </LogoProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;