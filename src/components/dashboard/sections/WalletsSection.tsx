
import { WalletManagement } from "../wallets/WalletManagement";
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
    </div>
  );
};
