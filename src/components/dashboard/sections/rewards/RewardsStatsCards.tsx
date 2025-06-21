
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, TrendingUp } from "lucide-react";

interface RewardsStatsCardsProps {
  totalUnclaimed: number;
  totalClaimed: number;
  unclaimedCount: number;
  claimedCount: number;
}

export const RewardsStatsCards = ({
  totalUnclaimed,
  totalClaimed,
  unclaimedCount,
  claimedCount,
}: RewardsStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            Unclaimed Rewards
          </CardTitle>
          <Clock className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {totalUnclaimed.toFixed(2)} POOPEE
          </div>
          <p className="text-xs text-gray-400">
            {unclaimedCount} pending rewards
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            Total Claimed
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {totalClaimed.toFixed(2)} POOPEE
          </div>
          <p className="text-xs text-gray-400">
            {claimedCount} claimed rewards
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            Total Earned
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {(totalUnclaimed + totalClaimed).toFixed(2)} POOPEE
          </div>
          <p className="text-xs text-gray-400">
            All time earnings
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
