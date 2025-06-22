
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Coins, Gift, TrendingUp, History, HelpCircle } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits, useCreditTransactions } from "@/hooks/useCredits";
import { WalletVerificationForm } from "./WalletVerificationForm";
import { useCreateCashoutRequest, useCashoutRequests } from "@/hooks/useCashoutOperations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditStatsDisplay } from "./CreditStatsDisplay";
import { CashoutForm } from "./CashoutForm";
import { CreditTransactionHistory } from "./CreditTransactionHistory";
import { RecentCashoutRequests } from "./RecentCashoutRequests";

interface CreditManagementCardProps {
  user: UnifiedUser;
}

export const CreditManagementCard = ({ user }: CreditManagementCardProps) => {
  const { data: creditsData, isLoading: creditsLoading } = useCredits(user.id);
  const { data: transactionsData, isLoading: transactionsLoading } = useCreditTransactions(user.id);
  const { data: cashoutRequestsData } = useCashoutRequests(user.id);
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
        <CreditStatsDisplay 
          creditsData={creditsData}
          creditsLoading={creditsLoading}
          transactionsData={transactionsData}
        />

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
            <CashoutForm
              creditsData={creditsData}
              userWallets={userWallets}
              selectedWallet={selectedWallet}
              setSelectedWallet={setSelectedWallet}
              cashoutAmount={cashoutAmount}
              setCashoutAmount={setCashoutAmount}
              onCashout={handleCashout}
              isLoading={createCashoutMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <CreditTransactionHistory
              transactionsData={transactionsData}
              transactionsLoading={transactionsLoading}
            />
          </TabsContent>
        </Tabs>

        <RecentCashoutRequests cashoutRequestsData={cashoutRequestsData} />
      </CardContent>
    </Card>
  );
};
