
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, TrendingUp, History } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits, useCreditTransactions, type CreditTransaction } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";

interface CreditManagementCardProps {
  user: UnifiedUser;
}

export const CreditManagementCard = ({ user }: CreditManagementCardProps) => {
  const { data: credits, isLoading: creditsLoading } = useCredits(user.id);
  const { data: transactions, isLoading: transactionsLoading } = useCreditTransactions(user.id);
  const { toast } = useToast();
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [cashoutAmount, setCashoutAmount] = useState("");

  const handlePurchaseCredits = async () => {
    const amount = parseFloat(purchaseAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to purchase.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement Stripe payment integration
    toast({
      title: "Feature Coming Soon",
      description: "Credit purchases will be available soon!",
    });
  };

  const handleCashoutCredits = async () => {
    const amount = parseFloat(cashoutAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to cash out.",
        variant: "destructive",
      });
      return;
    }

    if (amount > (credits?.balance || 0)) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits to cash out this amount.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement cashout functionality
    toast({
      title: "Feature Coming Soon",
      description: "Credit cashouts will be available soon!",
    });
  };

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
      default: return '📄';
    }
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-400" />
          Credit Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Balance */}
          <div className="bg-gray-900/40 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {creditsLoading ? "..." : (credits?.balance?.toFixed(2) || "0.00")}
            </div>
            <div className="text-gray-400">Current Balance</div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gray-900/40 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-green-400 mb-1">
                {transactions?.filter(t => t.transaction_type === 'earned').length || 0}
              </div>
              <div className="text-gray-400 text-sm">Games Won</div>
            </div>
            <div className="bg-gray-900/40 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-blue-400 mb-1">
                {transactions?.filter(t => t.transaction_type === 'purchase').length || 0}
              </div>
              <div className="text-gray-400 text-sm">Purchases</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="buy" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="buy" className="data-[state=active]:bg-gray-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Buy Credits
            </TabsTrigger>
            <TabsTrigger value="cashout" className="data-[state=active]:bg-gray-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cash Out
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-600">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="bg-gray-900/40 rounded-lg p-4">
              <Label className="text-gray-300">Purchase Amount (USD)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="10.00"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button onClick={handlePurchaseCredits} className="bg-blue-600 hover:bg-blue-700">
                  Buy Credits
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[10, 25, 50].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setPurchaseAmount(amount.toString())}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                1 USD = 1 Credit. Credits are used to play games and earn rewards.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cashout" className="space-y-4">
            <div className="bg-gray-900/40 rounded-lg p-4">
              <Label className="text-gray-300">Cash Out Amount</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="5.00"
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  max={credits?.balance || 0}
                />
                <Button onClick={handleCashoutCredits} className="bg-green-600 hover:bg-green-700">
                  Cash Out
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Minimum cashout: $5.00. Funds will be sent to your primary wallet.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="bg-gray-900/40 rounded-lg p-4 max-h-64 overflow-y-auto">
              {transactionsLoading ? (
                <div className="text-gray-400">Loading transactions...</div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction: CreditTransaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b border-gray-700 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTransactionTypeIcon(transaction.transaction_type)}</span>
                        <div>
                          <div className="text-white text-sm font-medium capitalize">
                            {transaction.transaction_type}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          transaction.transaction_type === 'purchase' || transaction.transaction_type === 'earned' || transaction.transaction_type === 'bonus'
                            ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.transaction_type === 'purchase' || transaction.transaction_type === 'earned' || transaction.transaction_type === 'bonus' ? '+' : '-'}
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
                  No transactions yet. Start by purchasing some credits!
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
