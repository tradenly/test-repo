
import { AdminSection } from "@/pages/AdminPanel";
import { AdminOverview } from "./sections/AdminOverview";
import { UserManagement } from "./sections/UserManagement";
import { CreditManagement } from "./sections/CreditManagement";
import { ActivityMonitor } from "./sections/ActivityMonitor";
import { PayoutManagement } from "./sections/PayoutManagement";
import { AdminAnalytics } from "./sections/AdminAnalytics";
import { ToolRequestManagement } from "./sections/ToolRequestManagement";
import { GameManagement } from "./sections/GameManagement";
import { AIAgentManagement } from "./sections/AIAgentManagement";
import { ContactManagement } from "./sections/ContactManagement";

interface AdminContentProps {
  activeSection: AdminSection;
}

export const AdminContent = ({ activeSection }: AdminContentProps) => {
  switch (activeSection) {
    case "overview":
      return <AdminOverview />;
    case "users":
      return <UserManagement />;
    case "credits":
      return <CreditManagement />;
    case "activity":
      return <ActivityMonitor />;
    case "payouts":
      return <PayoutManagement />;
    case "analytics":
      return <AdminAnalytics />;
    case "requests":
      return <ToolRequestManagement />;
    case "games":
      return <GameManagement />;
    case "ai-agent":
      return <AIAgentManagement />;
    case "contact":
      return <ContactManagement />;
    default:
      return <AdminOverview />;
  }
};
