
import { Badge } from "@/components/ui/badge";
import { CashoutRequest } from "@/hooks/useCashoutOperations";

interface RecentCashoutRequestsProps {
  cashoutRequestsData?: CashoutRequest[];
}

export const RecentCashoutRequests = ({ cashoutRequestsData }: RecentCashoutRequestsProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (!cashoutRequestsData || !Array.isArray(cashoutRequestsData) || cashoutRequestsData.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-700 pt-6">
      <h3 className="text-white font-medium mb-4">Recent Cashout Requests</h3>
      <div className="space-y-3">
        {cashoutRequestsData.slice(0, 3).map((request) => (
          <div key={request.id} className="bg-gray-900/40 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">
                  {request.amount_credits} credits → {request.amount_crypto} USDC
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(request.requested_at).toLocaleDateString()}
                </div>
              </div>
              <Badge className={getStatusBadgeColor(request.status)}>
                {request.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
