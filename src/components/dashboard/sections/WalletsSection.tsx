
import { WalletManagement } from "../wallets/WalletManagement";
import { CreditManagementCard } from "../credits/CreditManagementCard";
import { PhantomCreditPurchaseCard } from "../credits/PhantomCreditPurchaseCard";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface WalletsSectionProps {
  user: UnifiedUser;
}

export const WalletsSection = ({ user }: WalletsSectionProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Wallet Management</h1>
        <p className="text-gray-400">
          Manage your crypto wallets across different blockchains. You can add up to 5 wallets and set one as your primary wallet for rewards and payouts.
        </p>
      </div>
      
      <WalletManagement user={user} />
      
      {/* Credit Management Section */}
      <div className="pt-6 border-t border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Credit Management</h2>
        <p className="text-gray-400 mb-6">
          Buy credits to play games, earn rewards, and cash out your winnings.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreditManagementCard user={user} />
          <PhantomCreditPurchaseCard />
        </div>
      </div>
    </div>
  );
};
