
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Gift, TrendingUp, History, HelpCircle, Wallet } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits, useCreditTransactions, type CreditTransaction } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { WalletVerificationForm } from "./WalletVerificationForm";
import { useCreateCashoutRequest, useCashoutRequests } from "@/hooks/useCashoutOperations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreditManagementCardProps {
  user: UnifiedUser;
}

export const CreditManagementCard = ({ user }: CreditManagementCardProps) => {
  const { data: credits, isLoading: creditsLoading } = useCredits(user.id);
  const { data: transactions, isLoading: transactionsLoading } = useCreditTransactions(user.id);
  const { data: cashoutRequests } = useCashoutRequests(user.id);
  const { toast } = useToast();
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  
  const createCashoutMutation = useCreateCashoutRequest();

  // Fetch user wallets
  const { data: userWallets } = useQuery({
    queryKey: ["user-wallets", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user.id,
  });

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

    if (amount < 25) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum cashout amount is 25 credits.",
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

    if (!selectedWalletId) {
      toast({
        title: "Wallet Required",
        description: "Please select a wallet for the cashout.",
        variant: "destructive",
      });
      return;
    }

    createCashoutMutation.mutate({
      userId: user.id,
      creditAmount: amount,
      walletId: selectedWalletId,
    }, {
      onSuccess: () => {
        setCashoutAmount("");
        setSelectedWalletId("");
      }
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
      case 'nft_verification': return '🖼️';
      case 'memecoin_verification': return '🪙';
      default: return '📄';
    }
  };

  const isPositiveTransaction = (type: string) => {
    return ['purchase', 'earned', 'bonus', 'nft_verification', 'memecoin_verification', 'refund'].includes(type);
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
          <div className="bg-gray-900/40 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {creditsLoading ? "..." : (credits?.balance?.toFixed(2) || "0.00")}
            </div>
            <div className="text-gray-400">Current Balance</div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gray-900/40 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-green-400 mb-1">
                {transactions?.filter(t => t.transaction_type === 'earned').length || 0}
              </div>
              <div className="text-gray-400 text-sm">Games Won</div>
            </div>
            <div className="bg-gray-900/40 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-blue-400 mb-1">
                {transactions?.filter(t => ['purchase', 'nft_verification', 'memecoin_verification'].includes(t.transaction_type)).length || 0}
              </div>
              <div className="text-gray-400 text-sm">Credit Sources</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="redeem" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="redeem" className="data-[state=active]:bg-gray-600">
              <Gift className="h-4 w-4 mr-2" />
              Redeem Credits
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

          <TabsContent value="redeem" className="space-y-4">
            <WalletVerificationForm user={user} />
          </TabsContent>

          <TabsContent value="cashout" className="space-y-4">
            <div className="bg-gray-900/40 rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Select Wallet</Label>
                  <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choose wallet for cashout" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {userWallets?.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id} className="text-white">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span>{wallet.wallet_name || `${wallet.blockchain} Wallet`}</span>
                            {wallet.is_primary && <Badge className="bg-blue-600">Primary</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-300">Cash Out Amount</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="25.00"
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      max={credits?.balance || 0}
                      min="25"
                    />
                    <Button 
                      onClick={handleCashoutCredits} 
                      className="bg-blue-600 hover:bg-blue-700 text-white hover:text-black"
                      disabled={createCashoutMutation.isPending || !userWallets?.length}
                    >
                      {createCashoutMutation.isPending ? "Processing..." : "Cash Out"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <p className="text-xs text-gray-400">
                      Minimum cashout: 25 Credits = 5 USDC. Funds will be sent to selected wallet.
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-300 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-gray-700 text-white max-w-xs">
                        <div className="space-y-2">
                          <p className="font-medium">Cashout Details:</p>
                          <ul className="text-sm space-y-1">
                            <li>• Minimum cashout amount: 25 credits</li>
                            <li>• Exchange rate: 5 credits = 1 USDC</li>
                            <li>• Example: 25 credits = 5 USDC</li>
                            <li>• Requests require admin approval</li>
                            <li>• Processing time: 24-48 hours</li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {cashoutRequests && cashoutRequests.length > 0 && (
                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="text-white font-medium mb-2">Recent Cashout Requests</h4>
                    <div className="space-y-2">
                      {cashoutRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            {request.amount_credits} credits → {request.amount_crypto} USDC
                          </span>
                          <Badge className={getStatusBadgeColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
