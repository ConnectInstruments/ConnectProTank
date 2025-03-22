import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import TanksPage from "@/pages/tanks";
import TemperaturesPage from "@/pages/temperatures";
import SettingsPage from "@/pages/settings";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TanksPage} />
      <Route path="/tanks" component={TanksPage} />
      <Route path="/temperatures" component={TemperaturesPage} />
      <Route path="/settings" component={SettingsPage} />
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
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <MobileSidebar open={mobileMenuOpen} onClose={toggleMobileMenu} />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar onMobileMenuToggle={toggleMobileMenu} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                <Router />
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
