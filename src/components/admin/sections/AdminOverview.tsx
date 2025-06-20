
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Coins, Activity, TrendingUp } from "lucide-react";

export const AdminOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total credits in circulation
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('balance');
      
      const totalCredits = creditsData?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0;

      // Get game sessions count
      const { count: totalSessions } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true });

      // Get recent transactions count
      const { count: recentTransactions } = await supabase
        .from('credit_transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return {
        totalUsers: totalUsers || 0,
        totalCredits,
        totalSessions: totalSessions || 0,
        recentTransactions: recentTransactions || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Credits in Circulation",
      value: stats?.totalCredits?.toFixed(2) || "0.00",
      icon: Coins,
      color: "text-yellow-400",
    },
    {
      title: "Total Game Sessions",
      value: stats?.totalSessions || 0,
      icon: Activity,
      color: "text-green-400",
    },
    {
      title: "24h Transactions",
      value: stats?.recentTransactions || 0,
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <div className="text-gray-400">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Overview</h1>
        <p className="text-gray-400">System-wide statistics and quick insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-gray-800/40 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database</span>
              <span className="text-green-400 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Authentication</span>
              <span className="text-green-400 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Game Engine</span>
              <span className="text-green-400 font-medium">Operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
