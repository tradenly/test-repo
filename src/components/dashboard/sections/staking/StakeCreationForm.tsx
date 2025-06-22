import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStakeOperations } from "./useStakeOperations";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface StakeCreationFormProps {
  user: UnifiedUser;
  pools: any[] | undefined;
}

export const StakeCreationForm = ({ user, pools }: StakeCreationFormProps) => {
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const { createStakeMutation } = useStakeOperations(user);

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
    setStakeAmount("");
    setSelectedPool("");
  };

  return (
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
          className="w-full"
        >
          {createStakeMutation.isPending ? "Creating Stake..." : "Stake Tokens"}
        </Button>
      </CardContent>
    </Card>
  );
};
