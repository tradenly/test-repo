
import { Badge } from "@/components/ui/badge";
import { CreditTransaction } from "@/hooks/useCredits";

interface CreditTransactionHistoryProps {
  transactionsData?: CreditTransaction[];
  transactionsLoading: boolean;
}

export const CreditTransactionHistory = ({
  transactionsData,
  transactionsLoading
}: CreditTransactionHistoryProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '💳';
      case 'earned': return '🎮';
      case 'spent': return '🎯';
      case 'cashout': return '💰';
      case 'bonus': return '🎁';
      case 'refund': return '↩️';
      case 'nft_verification': return '🖼️';
      case 'memecoin_verification': return '🪙';
      default: return '📄';
    }
  };

  const isPositiveTransaction = (type: string) => {
    return ['purchase', 'earned', 'bonus', 'nft_verification', 'memecoin_verification', 'refund'].includes(type);
  };

  return (
    <div className="bg-gray-900/40 rounded-lg p-4 max-h-64 overflow-y-auto">
      {transactionsLoading ? (
        <div className="text-gray-400">Loading transactions...</div>
      ) : transactionsData && transactionsData.length > 0 ? (
        <div className="space-y-3">
          {transactionsData.slice(0, 10).map((transaction: CreditTransaction) => (
            <div key={transaction.id} className="flex items-center justify-between border-b border-gray-700 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getTransactionTypeIcon(transaction.transaction_type)}</span>
                <div>
                  <div className="text-white text-sm font-medium capitalize">
                    {transaction.transaction_type.replace('_', ' ')}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  isPositiveTransaction(transaction.transaction_type) ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositiveTransaction(transaction.transaction_type) ? '+' : ''}
                  {transaction.amount}
                </div>
                <Badge className={`text-xs ${getStatusBadgeColor(transaction.status)}`}>
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-4">
          No transactions yet. Start by verifying your wallet or purchasing credits!
        </div>
      )}
    </div>
  );
};
