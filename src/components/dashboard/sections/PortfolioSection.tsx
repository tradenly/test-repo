
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Coins, Image, Wallet } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface PortfolioSectionProps {
  user: UnifiedUser;
}

export const PortfolioSection = ({ user }: PortfolioSectionProps) => {
  const { data: tokenBalances } = useQuery({
    queryKey: ["tokenBalances", user.id],
    queryFn: async () => {
      // Only fetch token balances if user has Supabase auth
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("token_balances")
        .select("*")
        .eq("user_id", user.id)
        .order("last_updated", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const { data: nftHoldings } = useQuery({
    queryKey: ["nftHoldings", user.id],
    queryFn: async () => {
      // Only fetch NFT holdings if user has Supabase auth
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("nft_holdings")
        .select("*")
        .eq("user_id", user.id)
        .order("acquired_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const { data: stakes } = useQuery({
    queryKey: ["userStakes", user.id],
    queryFn: async () => {
      // Only fetch stakes if user has Supabase auth
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("user_stakes")
        .select(`
          *,
          staking_pools(name, apy_percentage, token_symbol)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const totalTokenValue = tokenBalances?.reduce((sum, token) => {
    // Rough estimation: 1 POOPEE = $0.001
    const tokenPrice = token.token_symbol === "POOPEE" ? 0.001 : 0;
    return sum + (parseFloat(token.balance.toString()) * tokenPrice);
  }, 0) || 0;

  const totalStakedValue = stakes?.reduce((sum, stake) => {
    const tokenPrice = stake.staking_pools?.token_symbol === "POOPEE" ? 0.001 : 0;
    return sum + (parseFloat(stake.amount.toString()) * tokenPrice);
  }, 0) || 0;

  const getBlockchainIcon = (blockchain: string) => {
    switch (blockchain) {
      case "cardano":
        return "🔵";
      case "sui":
        return "🌊";
      case "ethereum":
        return "💎";
      case "bitcoin":
        return "₿";
      default:
        return "🔗";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-gray-400">
          {user.authType === 'supabase' 
            ? "Overview of your crypto assets and investments" 
            : "Portfolio data is currently available for email users only"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Portfolio Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(totalTokenValue + totalStakedValue).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              Estimated USD value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Token Holdings
            </CardTitle>
            <Coins className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tokenBalances?.length || 0}
            </div>
            <p className="text-xs text-gray-400">
              Different tokens
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              NFT Collection
            </CardTitle>
            <Image className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {nftHoldings?.length || 0}
            </div>
            <p className="text-xs text-gray-400">
              NFTs owned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Token Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {tokenBalances && tokenBalances.length > 0 ? (
              <div className="space-y-4">
                {tokenBalances.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">
                        {getBlockchainIcon(token.blockchain)}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{token.token_symbol}</h3>
                        <p className="text-sm text-gray-400 capitalize">{token.blockchain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {parseFloat(token.balance.toString()).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        ${(parseFloat(token.balance.toString()) * (token.token_symbol === "POOPEE" ? 0.001 : 0)).toFixed(2)}
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
                    ? "No token balances found" 
                    : "Token tracking available for email users"
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {user.authType === 'supabase'
                    ? "Your token balances will appear here once detected"
                    : "Sign up with email to track your tokens"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">NFT Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {nftHoldings && nftHoldings.length > 0 ? (
              <div className="space-y-4">
                {nftHoldings.slice(0, 5).map((nft) => (
                  <div key={nft.id} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                      {nft.image_url ? (
                        <img
                          src={nft.image_url}
                          alt={nft.token_name || "NFT"}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Image className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {nft.token_name || "Unnamed NFT"}
                      </h3>
                      <p className="text-sm text-gray-400">{nft.collection_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {getBlockchainIcon(nft.blockchain)} {nft.blockchain}
                        </span>
                        {nft.is_staked && (
                          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                            Staked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {nftHoldings.length > 5 && (
                  <p className="text-sm text-gray-400 text-center">
                    +{nftHoldings.length - 5} more NFTs
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  {user.authType === 'supabase' 
                    ? "No NFTs found" 
                    : "NFT tracking available for email users"
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {user.authType === 'supabase'
                    ? "Your NFT collection will appear here once detected"
                    : "Sign up with email to track your NFTs"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Active Stakes</CardTitle>
        </CardHeader>
        <CardContent>
          {stakes && stakes.length > 0 ? (
            <div className="space-y-4">
              {stakes.map((stake) => (
                <div key={stake.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">
                        {stake.staking_pools?.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Staked: {parseFloat(stake.amount.toString()).toLocaleString()} {stake.staking_pools?.token_symbol}
                      </p>
                      <p className="text-xs text-gray-500">
                        Since: {new Date(stake.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">
                        {stake.staking_pools?.apy_percentage}% APY
                      </div>
                      <div className="text-sm text-gray-400">
                        ~${(parseFloat(stake.amount.toString()) * 0.001).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {user.authType === 'supabase' 
                  ? "No active stakes" 
                  : "Staking available for email users"
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {user.authType === 'supabase'
                  ? "Start staking to earn passive income"
                  : "Sign up with email to access staking features"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
