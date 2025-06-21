
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePaymentOrders } from "@/hooks/usePaymentOrders";
import { Receipt, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const CreditReceiptsCard = () => {
  const { data: paymentOrders, isLoading } = usePaymentOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'expired': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      case 'expired': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getBlockchainIcon = (blockchain: string) => {
    switch (blockchain) {
      case 'solana': return '🟣';
      case 'ethereum': return '⟠';
      case 'sui': return '🔵';
      default: return '🔗';
    }
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-400" />
          Credit Receipts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-gray-400">Loading payment orders...</div>
        ) : paymentOrders && paymentOrders.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {paymentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-900/40 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getBlockchainIcon(order.blockchain)}</span>
                    <div>
                      <p className="text-white font-medium capitalize">
                        {order.blockchain} Payment
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">User Wallet</p>
                    <p className="text-white font-mono text-xs">
                      {order.wallet_address.slice(0, 8)}...{order.wallet_address.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Payment Address</p>
                    <p className="text-white font-mono text-xs">
                      {order.payment_address.slice(0, 8)}...{order.payment_address.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">USDC Amount</p>
                    <p className="text-white font-medium">{order.usdc_amount} USDC</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Credits</p>
                    <p className="text-green-400 font-medium">{order.credit_amount} Credits</p>
                  </div>
                </div>

                {order.transaction_hash && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Transaction Hash</p>
                        <p className="text-white font-mono text-xs">
                          {order.transaction_hash.slice(0, 16)}...{order.transaction_hash.slice(-16)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black"
                        onClick={() => {
                          // In production, you'd link to the actual blockchain explorer
                          navigator.clipboard.writeText(order.transaction_hash!);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}

                {order.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-yellow-400 text-sm">
                      Expires: {formatDistanceToNow(new Date(order.expires_at), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payment orders yet</p>
            <p className="text-sm">Credit purchases will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
