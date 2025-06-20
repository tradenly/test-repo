
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnokiFlowProvider } from "@mysten/enoki/react";
import { ZK_LOGIN_CONFIG } from "@/config/zkLogin";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <EnokiFlowProvider apiKey={ZK_LOGIN_CONFIG.ENOKI_API_KEY}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
              <Navigation />
              <div>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
            <Toaster />
          </Router>
        </QueryClientProvider>
      </EnokiFlowProvider>
    </ErrorBoundary>
  );
}

export default App;
