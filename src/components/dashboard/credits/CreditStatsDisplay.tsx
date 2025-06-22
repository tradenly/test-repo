
import { Coins } from "lucide-react";
import { UserCredits, CreditTransaction } from "@/hooks/useCredits";

interface CreditStatsDisplayProps {
  creditsData?: UserCredits;
  creditsLoading: boolean;
  transactionsData?: CreditTransaction[];
}

export const CreditStatsDisplay = ({ 
  creditsData, 
  creditsLoading, 
  transactionsData 
}: CreditStatsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-gray-900/40 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-white mb-2">
          {creditsLoading ? "..." : (creditsData?.balance?.toFixed(2) || "0.00")}
        </div>
        <div className="text-gray-400">Current Balance</div>
      </div>

      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        <div className="bg-gray-900/40 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-green-400 mb-1">
            {transactionsData?.filter(t => t.transaction_type === 'earned').length || 0}
          </div>
          <div className="text-gray-400 text-sm">Games Won</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-blue-400 mb-1">
            {transactionsData?.filter(t => ['purchase', 'nft_verification', 'memecoin_verification'].includes(t.transaction_type)).length || 0}
          </div>
          <div className="text-gray-400 text-sm">Credit Sources</div>
        </div>
      </div>
    </div>
  );
};
