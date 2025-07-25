
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import AppRoutes from "@/components/AppRoutes";

const App = () => {
  // Create QueryClient inside component to ensure proper React context
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }), []);

  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="poopee-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="dark bg-black min-h-screen">
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
