
import { DashboardStats } from "./overview/DashboardStats";
import { DashboardActivity } from "./overview/DashboardActivity";
import { DashboardQuickActions } from "./overview/DashboardQuickActions";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface DashboardOverviewProps {
  user: UnifiedUser;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.user_metadata?.full_name || user.email}!
        </h1>
        <p className="text-gray-400">
          Here's what's happening with your account today.
        </p>
      </div>
      
      <DashboardStats user={user} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardActivity user={user} />
        <DashboardQuickActions user={user} />
      </div>
    </div>
  );
};
