
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface DashboardActivityProps {
  user: UnifiedUser;
  stakes: any[] | undefined;
}

export const DashboardActivity = ({ user, stakes }: DashboardActivityProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user.authType === 'supabase' ? (
            stakes?.slice(0, 3).map((stake) => (
              <div key={stake.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    Staked {parseFloat(stake.amount.toString()).toLocaleString()} POOPEE
                  </p>
                  <p className="text-sm text-gray-400">
                    {stake.staking_pools?.name}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(stake.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              Connect your wallet to see staking activity
            </p>
          )} 
          {user.authType === 'supabase' && (!stakes || stakes.length === 0) && (
            <p className="text-gray-400 text-center py-4">
              No staking activity yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
