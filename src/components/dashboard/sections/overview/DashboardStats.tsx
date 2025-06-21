
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Wallet, Gift, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  totalStaked: number;
  totalRewards: number;
  stakesCount: number;
  rewardsCount: number;
  walletsCount: number;
}

export const DashboardStats = ({ 
  totalStaked, 
  totalRewards, 
  stakesCount, 
  rewardsCount, 
  walletsCount 
}: DashboardStatsProps) => {
  return (
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
            {stakesCount} active stakes
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
            {rewardsCount} pending rewards
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
            {walletsCount}
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
  );
};
