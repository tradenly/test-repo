
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank, Wallet, Gift, TrendingUp } from "lucide-react";

interface DashboardOverviewProps {
  user: User;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const { data: stakes } = useQuery({
    queryKey: ["userStakes", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_stakes")
        .select(`
          *,
          staking_pools(name, apy_percentage)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: rewards } = useQuery({
    queryKey: ["userRewards", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staking_rewards")
        .select("*")
        .eq("user_id", user.id)
        .eq("claimed", false);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: wallets } = useQuery({
    queryKey: ["userWallets", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data;
    },
  });

  const totalStaked = stakes?.reduce((sum, stake) => sum + parseFloat(stake.amount), 0) || 0;
  const totalRewards = rewards?.reduce((sum, reward) => sum + parseFloat(reward.reward_amount), 0) || 0;

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
              Total Staked
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalStaked.toLocaleString()} POOPEE
            </div>
            <p className="text-xs text-gray-400">
              {stakes?.length || 0} active stakes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Unclaimed Rewards
            </CardTitle>
            <Gift className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalRewards.toFixed(2)} POOPEE
            </div>
            <p className="text-xs text-gray-400">
              {rewards?.length || 0} pending rewards
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Connected Wallets
            </CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {wallets?.length || 0}
            </div>
            <p className="text-xs text-gray-400">
              Across multiple chains
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Portfolio Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(totalStaked * 0.001).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              Estimated USD value
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
              {stakes?.slice(0, 3).map((stake) => (
                <div key={stake.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      Staked {parseFloat(stake.amount).toLocaleString()} POOPEE
                    </p>
                    <p className="text-sm text-gray-400">
                      {stake.staking_pools?.name}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(stake.created_at).toLocaleDateString()}
                  </div>
                </div>
              )) || (
                <p className="text-gray-400 text-center py-4">
                  No staking activity yet
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
                <h3 className="font-medium text-white mb-2">🚀 Start Staking</h3>
                <p className="text-sm text-gray-400">
                  Earn up to 25% APY on your POOPEE tokens
                </p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <h3 className="font-medium text-white mb-2">🔗 Connect Wallet</h3>
                <p className="text-sm text-gray-400">
                  Add your Cardano or SUI wallet addresses
                </p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <h3 className="font-medium text-white mb-2">🎁 Claim Rewards</h3>
                <p className="text-sm text-gray-400">
                  {totalRewards > 0 ? `${totalRewards.toFixed(2)} POOPEE waiting` : "No rewards yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
