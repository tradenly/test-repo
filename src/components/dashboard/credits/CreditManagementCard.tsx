
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Gift, TrendingUp, History, HelpCircle, Wallet, DollarSign, Loader2 } from "lucide-react";
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
  const { data: creditsData, isLoading: creditsLoading } = useCredits(user.id);
  const { data: transactionsData, isLoading: transactionsLoading } = useCreditTransactions(user.id);
  const { data: cashoutRequestsData } = useCashoutRequests(user.id);
  const { toast } = useToast();
  const [cashoutAmount, setCashoutAmount] = useState<number>(0);
  const [selectedWallet, setSelectedWallet] = useState("");
  
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

  const handleCashout = () => {
    if (!selectedWallet || !cashoutAmount) return;
    
    createCashoutMutation.mutate({
      userId: user.id,
      creditAmount: cashoutAmount,
      walletId: selectedWallet,
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
          <Coins className="h-5 w-5 text-blue-400" />
          Credit Management
        </CardTitle>
        <CardDescription className="text-gray-300">
          Manage your credits, make purchases, and request cashouts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <Tabs defaultValue="redeem" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="redeem" className="data-[state=active]:bg-gray-600">
              <Gift className="h-4 w-4 mr-2" />
              Redeem Credits
            </TabsTrigger>
            <TabsTrigger value="cashout" className="data-[state=active]:bg-gray-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cash Out
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-gray-400 hover:text-white cursor-help ml-1" />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-600 text-white max-w-sm">
                  <p>Cashing out credits can take up to<br />24 hours for security reasons and<br />to verify legitimacy of claim.</p>
                </TooltipContent>
              </Tooltip>
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
                {/* Wallet Selection */}
                <div>
                  <Label className="text-gray-300">Select Withdrawal Wallet</Label>
                  <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                      <SelectValue placeholder="Choose a wallet for withdrawal" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {userWallets?.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id} className="text-white">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span>{wallet.wallet_name || `${wallet.blockchain} Wallet`}</span>
                            <Badge variant="secondary" className="text-xs">
                              {wallet.blockchain}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!userWallets || userWallets.length === 0) && (
                    <p className="text-yellow-400 text-sm mt-1">
                      You need to add a wallet before requesting cashouts.
                    </p>
                  )}
                </div>

                {/* Amount Input */}
                <div>
                  <Label className="text-gray-300">Credits to Cash Out</Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white pr-20"
                      placeholder="Enter amount..."
                      min="5"
                      max={Math.floor((creditsData?.balance || 0) / 5) * 5}
                      step="5"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      ≈ {(cashoutAmount / 5).toFixed(2)} USDC
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">
                      Min: 5 credits (1 USDC)
                    </span>
                    <span className="text-gray-400">
                      Max: {Math.floor((creditsData?.balance || 0) / 5) * 5} credits
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCashout}
                  disabled={
                    !selectedWallet ||
                    !cashoutAmount ||
                    cashoutAmount < 5 ||
                    cashoutAmount > (creditsData?.balance || 0) ||
                    createCashoutMutation.isPending ||
                    (userWallets?.length || 0) === 0
                  }
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {createCashoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Request Cashout
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        {/* Recent Cashout Requests */}
        {cashoutRequestsData && Array.isArray(cashoutRequestsData) && cashoutRequestsData.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  );
};
