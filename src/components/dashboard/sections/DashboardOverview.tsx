
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank, Wallet, Gift, TrendingUp } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface DashboardOverviewProps {
  user: UnifiedUser;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  // Use existing tables from the current database schema
  const { data: bets } = useQuery({
    queryKey: ["userBets", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: user.authType === 'supabase',
  });

  const { data: rewards } = useQuery({
    queryKey: ["userRewards", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("voting_rewards")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: user.authType === 'supabase',
  });

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return null;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const totalBets = bets?.length || 0;
  const totalRewards = rewards?.reduce((sum, reward) => sum + (parseFloat(reward.reward_amount?.toString() || '0')), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back! 💩
        </h1>
        <p className="text-gray-400">
          Here's your POOPEE dashboard overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Bets
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalBets}
            </div>
            <p className="text-xs text-gray-400">
              Active betting activity
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Rewards Earned
            </CardTitle>
            <Gift className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalRewards.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              {rewards?.length || 0} rewards received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Profile Status
            </CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {profile ? "Active" : "Setup"}
            </div>
            <p className="text-xs text-gray-400">
              Account status
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Platform Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              Coming Soon
            </div>
            <p className="text-xs text-gray-400">
              Portfolio tracking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.authType === 'supabase' ? (
                bets?.slice(0, 3).map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        Bet placed
                      </p>
                      <p className="text-sm text-gray-400">
                        Amount: {bet.amount?.toString() || 'N/A'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(bet.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  Connect your wallet to see activity
                </p>
              )} 
              {user.authType === 'supabase' && (!bets || bets.length === 0) && (
                <p className="text-gray-400 text-center py-4">
                  No betting activity yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <h3 className="font-medium text-white mb-2">🎯 Place Bets</h3>
                <p className="text-sm text-gray-400">
                  Start betting on prediction markets
                </p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <h3 className="font-medium text-white mb-2">🔗 Connect Wallet</h3>
                <p className="text-sm text-gray-400">
                  Add your SUI wallet address
                </p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <h3 className="font-medium text-white mb-2">🎁 View Rewards</h3>
                <p className="text-sm text-gray-400">
                  {totalRewards > 0 ? `${totalRewards.toFixed(2)} rewards available` : "No rewards yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
