
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSection } from "@/pages/Dashboard";

interface DashboardQuickActionsProps {
  totalRewards: number;
  onSectionChange: (section: DashboardSection) => void;
}

export const DashboardQuickActions = ({ totalRewards, onSectionChange }: DashboardQuickActionsProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div 
            className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600/50 transition-colors"
            onClick={() => onSectionChange("staking")}
          >
            <h3 className="font-medium text-white mb-2">🚀 Start Staking</h3>
            <p className="text-sm text-gray-400">
              Earn up to 25% APY on your POOPEE tokens
            </p>
          </div>
          <div 
            className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600/50 transition-colors"
            onClick={() => onSectionChange("wallets")}
          >
            <h3 className="font-medium text-white mb-2">🔗 Connect Wallet</h3>
            <p className="text-sm text-gray-400">
              Add your Cardano or SUI wallet addresses
            </p>
          </div>
          <div 
            className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600/50 transition-colors"
            onClick={() => onSectionChange("rewards")}
          >
            <h3 className="font-medium text-white mb-2">🎁 Claim Rewards</h3>
            <p className="text-sm text-gray-400">
              {totalRewards > 0 ? `${totalRewards.toFixed(2)} POOPEE waiting` : "No rewards yet"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
