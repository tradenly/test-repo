
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
  const [selectedPool, setSelectedPool] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");

  const { data: pools, isLoading: poolsLoading, error: poolsError } = useQuery({
    queryKey: ["stakingPools"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("staking_pools")
          .select("*")
          .eq("is_active", true)
          .order("apy_percentage", { ascending: false });
        
        if (error) {
          console.error("Pools fetch error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Failed to fetch staking pools:", error);
        throw error;
      }
    },
  });

  const { data: userStakes, isLoading: stakesLoading, error: stakesError } = useQuery({
    queryKey: ["userStakes", user.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("user_stakes")
          .select(`
            *,
            staking_pools(name, apy_percentage, token_symbol)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Stakes fetch error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Failed to fetch user stakes:", error);
        throw error;
      }
    },
  });

  const createStakeMutation = useMutation({
    mutationFn: async ({ poolId, amount }: { poolId: string; amount: string }) => {
      const { error } = await supabase
        .from("user_stakes")
        .insert({
          user_id: user.id,
          pool_id: poolId,
          amount: parseFloat(amount),
          status: "active",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStakes", user.id] });
      toast({
        title: "Stake created",
        description: "Your tokens have been successfully staked.",
      });
      setStakeAmount("");
      setSelectedPool("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create stake. Please try again.",
        variant: "destructive",
      });
      console.error("Stake creation error:", error);
    },
  });

  const handleStake = () => {
    if (!selectedPool || !stakeAmount) {
      toast({
        title: "Error",
        description: "Please select a pool and enter an amount.",
        variant: "destructive",
      });
      return;
    }
    
    createStakeMutation.mutate({ poolId: selectedPool, amount: stakeAmount });
  };

  const isLoading = poolsLoading || stakesLoading;
  const hasError = poolsError || stakesError;

  if (hasError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staking</h1>
          <p className="text-red-400">Failed to load staking data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staking</h1>
          <p className="text-gray-400">Loading staking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Staking</h1>
        <p className="text-gray-400">Stake your POOPEE tokens and NFTs to earn rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Create New Stake
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Select Staking Pool</Label>
              <Select value={selectedPool} onValueChange={setSelectedPool}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose a staking pool" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {pools && pools.length > 0 ? (
                    pools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name} - {pool.apy_percentage}% APY
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-pools" disabled>
                      No pools available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Amount to Stake</Label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter amount"
              />
            </div>

            <Button
              onClick={handleStake}
              disabled={createStakeMutation.isPending || !selectedPool || !stakeAmount || !pools?.length}
              className="w-full bg-gray-700 hover:bg-gray-600"
            >
              {createStakeMutation.isPending ? "Creating Stake..." : "Stake Tokens"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Available Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pools && pools.length > 0 ? (
                pools.map((pool) => (
                  <div key={pool.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{pool.name}</h3>
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {pool.apy_percentage}% APY
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{pool.description || "No description available"}</p>
                    <div className="text-xs text-gray-500">
                      Min: {pool.min_stake_amount ? parseFloat(pool.min_stake_amount.toString()).toLocaleString() : "0"} {pool.token_symbol}
                      {pool.lock_period_days && pool.lock_period_days > 0 && ` • ${pool.lock_period_days} days lock`}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No staking pools available at the moment.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Your Active Stakes</CardTitle>
        </CardHeader>
        <CardContent>
          {userStakes && userStakes.length > 0 ? (
            <div className="space-y-4">
              {userStakes.map((stake) => (
                <div key={stake.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">
                        {stake.staking_pools?.name || "Unknown Pool"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Staked: {stake.amount ? parseFloat(stake.amount.toString()).toLocaleString() : "0"} {stake.staking_pools?.token_symbol || "POOPEE"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Started: {stake.start_date ? new Date(stake.start_date).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">
                        {stake.staking_pools?.apy_percentage || 0}% APY
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {stake.status || "active"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No active stakes yet. Create your first stake above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
