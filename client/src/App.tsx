import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "./components/layouts/MainLayout";
import TankLevelsPage from "./pages/tanks";
import TemperaturesPage from "./pages/temperatures";
import SettingsPage from "./pages/settings";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={TankLevelsPage} />
        <Route path="/temperatures" component={TemperaturesPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
