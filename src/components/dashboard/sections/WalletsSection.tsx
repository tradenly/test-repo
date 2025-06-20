
import { WalletActions } from "./WalletActions";
import { TransactionHistory } from "../TransactionHistory";
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
          Manage your SUI wallet, send transactions, and view your assets.
        </p>
      </div>
      
      <WalletActions user={user} />
      
      {user.walletAddress && (
        <TransactionHistory walletAddress={user.walletAddress} />
      )}
    </div>
  );
};
