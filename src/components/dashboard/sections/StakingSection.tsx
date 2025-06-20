
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PiggyBank, TrendingUp } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface StakingSectionProps {
  user: UnifiedUser;
}

export const StakingSection = ({ user }: StakingSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMarket, setSelectedMarket] = useState("");
  const [betAmount, setBetAmount] = useState("");

  const { data: markets, isLoading: marketsLoading, error: marketsError } = useQuery({
    queryKey: ["predictionMarkets"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("prediction_markets")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Markets fetch error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Failed to fetch prediction markets:", error);
        throw error;
      }
    },
  });

  const { data: userBets, isLoading: betsLoading, error: betsError } = useQuery({
    queryKey: ["userMarketBets", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("prediction_market_bets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Bets fetch error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Failed to fetch user bets:", error);
        throw error;
      }
    },
    enabled: user.authType === 'supabase',
  });

  const createBetMutation = useMutation({
    mutationFn: async ({ marketId, amount }: { marketId: string; amount: string }) => {
      if (user.authType !== 'supabase') {
        throw new Error('Betting currently requires email authentication for data persistence');
      }
      
      const { error } = await supabase
        .from("prediction_market_bets")
        .insert({
          user_id: user.id,
          market_id: marketId,
          amount: parseFloat(amount),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMarketBets", user.id] });
      toast({
        title: "Bet placed",
        description: "Your bet has been successfully placed.",
      });
      setBetAmount("");
      setSelectedMarket("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
      console.error("Bet creation error:", error);
    },
  });

  const handleBet = () => {
    if (!selectedMarket || !betAmount) {
      toast({
        title: "Error",
        description: "Please select a market and enter an amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (user.authType !== 'supabase') {
      toast({
        title: "Feature Limitation",
        description: "Betting data persistence requires email authentication. ZK Login betting coming soon!",
        variant: "destructive",
      });
      return;
    }
    
    createBetMutation.mutate({ marketId: selectedMarket, amount: betAmount });
  };

  const isLoading = marketsLoading || betsLoading;
  const hasError = marketsError || betsError;

  if (hasError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Prediction Markets</h1>
          <p className="text-red-400">Failed to load market data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Prediction Markets</h1>
          <p className="text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Prediction Markets</h1>
        <p className="text-gray-400">Place bets on prediction markets</p>
        {user.authType === 'zklogin' && (
          <p className="text-amber-400 text-sm mt-1">
            Note: Full betting functionality with data persistence requires email authentication
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Place New Bet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Select Market</Label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose a prediction market" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {markets && markets.length > 0 ? (
                    markets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-markets" disabled>
                      No markets available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Bet Amount</Label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter amount"
              />
            </div>

            <Button
              onClick={handleBet}
              disabled={createBetMutation.isPending || !selectedMarket || !betAmount || !markets?.length}
              className="w-full bg-gray-700 hover:bg-gray-600"
            >
              {createBetMutation.isPending ? "Placing Bet..." : "Place Bet"}
            </Button>
            
            {user.authType === 'zklogin' && (
              <p className="text-sm text-gray-400">
                Bet data will be simulated for ZK Login users until full integration is complete
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Available Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {markets && markets.length > 0 ? (
                markets.map((market) => (
                  <div key={market.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{market.title}</h3>
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {market.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{market.description || "No description available"}</p>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(market.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No prediction markets available at the moment.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Your Active Bets</CardTitle>
        </CardHeader>
        <CardContent>
          {userBets && userBets.length > 0 ? (
            <div className="space-y-4">
              {userBets.map((bet) => (
                <div key={bet.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">
                        Bet #{bet.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Amount: {bet.amount ? parseFloat(bet.amount.toString()).toLocaleString() : "0"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Placed: {new Date(bet.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">
                        {bet.outcome || 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {user.authType === 'supabase' 
                  ? "No active bets yet. Place your first bet above!"
                  : "Betting interface is ready! Full data persistence available with email authentication."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
