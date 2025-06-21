
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

interface ActiveStakesListProps {
  userStakes: any[] | undefined;
}

export const ActiveStakesList = ({ userStakes }: ActiveStakesListProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Your Active Stakes</CardTitle>
      </CardHeader>
      <CardContent>
        {userStakes && userStakes.length > 0 ? (
          <div className="space-y-4">
            {userStakes.map((stake) => (
              <div key={stake.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">
                      {stake.staking_pools?.name || "Unknown Pool"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Staked: {stake.amount ? parseFloat(stake.amount.toString()).toLocaleString() : "0"} {stake.staking_pools?.token_symbol || "POOPEE"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Started: {stake.start_date ? new Date(stake.start_date).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium">
                      {stake.staking_pools?.apy_percentage || 0}% APY
                    </div>
                    <div className="text-sm text-gray-400 capitalize">
                      {stake.status || "active"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No active stakes yet. Create your first stake above!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
