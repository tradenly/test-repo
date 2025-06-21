
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface AvailablePoolsListProps {
  pools: any[] | undefined;
}

export const AvailablePoolsList = ({ pools }: AvailablePoolsListProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Available Pools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pools && pools.length > 0 ? (
            pools.map((pool) => (
              <div key={pool.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{pool.name}</h3>
                  <div className="flex items-center text-green-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {pool.apy_percentage}% APY
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{pool.description || "No description available"}</p>
                <div className="text-xs text-gray-500">
                  Min: {pool.min_stake_amount ? parseFloat(pool.min_stake_amount.toString()).toLocaleString() : "0"} {pool.token_symbol}
                  {pool.lock_period_days && pool.lock_period_days > 0 && ` • ${pool.lock_period_days} days lock`}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">No staking pools available at the moment.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
