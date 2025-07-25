import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useTrafficAnalytics } from "@/hooks/useTrafficAnalytics";
import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";
import AdminPanel from "../pages/AdminPanel";
import ContactUs from "../pages/ContactUs";

const AppRoutes = () => {
  // Get user for traffic analytics - this must be inside Router context
  const { user } = useUnifiedAuth();
  
  // Initialize traffic analytics - this uses useLocation so must be inside Router
  useTrafficAnalytics(user);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/contact" element={<ContactUs />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;