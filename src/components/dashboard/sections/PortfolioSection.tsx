
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Coins, Image, Wallet } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface PortfolioSectionProps {
  user: UnifiedUser;
}

export const PortfolioSection = ({ user }: PortfolioSectionProps) => {
  const { data: bets } = useQuery({
    queryKey: ["userBets", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const { data: marketBets } = useQuery({
    queryKey: ["userMarketBets", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("prediction_market_bets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const { data: games } = useQuery({
    queryKey: ["userGames", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const totalBetValue = bets?.reduce((sum, bet) => {
    return sum + (parseFloat(bet.amount?.toString() || '0'));
  }, 0) || 0;

  const totalMarketBetValue = marketBets?.reduce((sum, bet) => {
    return sum + (parseFloat(bet.amount?.toString() || '0'));
  }, 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-gray-400">
          {user.authType === 'supabase' 
            ? "Overview of your betting activity and positions" 
            : "Portfolio data is currently available for email users only"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Bet Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(totalBetValue + totalMarketBetValue).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              Total wagered amount
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Active Bets
            </CardTitle>
            <Coins className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(bets?.length || 0) + (marketBets?.length || 0)}
            </div>
            <p className="text-xs text-gray-400">
              Total positions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Games Created
            </CardTitle>
            <Image className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {games?.length || 0}
            </div>
            <p className="text-xs text-gray-400">
              Games managed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Bets</CardTitle>
          </CardHeader>
          <CardContent>
            {bets && bets.length > 0 ? (
              <div className="space-y-4">
                {bets.slice(0, 5).map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div>
                      <h3 className="font-medium text-white">
                        Bet #{bet.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Amount: {bet.amount?.toString() || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {bet.status || 'Active'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(bet.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  {user.authType === 'supabase' 
                    ? "No bets found" 
                    : "Betting tracking available for email users"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Prediction Market Bets</CardTitle>
          </CardHeader>
          <CardContent>
            {marketBets && marketBets.length > 0 ? (
              <div className="space-y-4">
                {marketBets.slice(0, 5).map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div>
                      <h3 className="font-medium text-white">
                        Market Bet #{bet.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Amount: {bet.amount?.toString() || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {bet.outcome || 'Pending'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(bet.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  {user.authType === 'supabase' 
                    ? "No market bets found" 
                    : "Market betting available for email users"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
