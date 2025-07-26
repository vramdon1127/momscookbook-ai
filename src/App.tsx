import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import TopNavigation from "@/components/TopNavigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <TopNavigation />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/record-recipe" element={<Index />} />
                <Route path="/create-recipe" element={<Index />} />
                <Route path="/recipes" element={<Index />} />
                <Route path="/meal-planner" element={<Index />} />
                <Route path="/cookbooks" element={<Index />} />
                <Route path="/community" element={<Index />} />
                <Route path="/search" element={<Index />} />
                <Route path="/profile" element={<Dashboard />} />
                <Route path="/settings" element={<Dashboard />} />
                <Route path="/premium" element={<Dashboard />} />
                <Route path="/help/*" element={<Dashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
