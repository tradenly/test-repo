
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank, Wallet, Coins, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStakeOperations } from "./useStakeOperations";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { WalletConnectionDialog } from "./WalletConnectionDialog";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface StakeCreationFormProps {
  user: UnifiedUser;
  pools: any[] | undefined;
}

export const StakeCreationForm = ({ user, pools }: StakeCreationFormProps) => {
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakingType, setStakingType] = useState<'token' | 'nft' | null>(null);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const { createStakeMutation } = useStakeOperations(user);
  const { connectedWallet, disconnectWallet } = useWalletConnection();

  const handleStake = () => {
    if (!connectedWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet before staking.",
        variant: "destructive",
      });
      return;
    }

    if (!stakingType) {
      toast({
        title: "Selection Required",
        description: "Please select whether you want to stake tokens or NFTs.",
        variant: "destructive",
      });
      return;
    }

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
    <>
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Create New Stake
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Staking Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={stakingType === 'nft' ? 'default' : 'outline'}
              onClick={() => setStakingType('nft')}
              className={`h-12 ${
                stakingType === 'nft' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              NFT
            </Button>
            <Button
              variant={stakingType === 'token' ? 'default' : 'outline'}
              onClick={() => setStakingType('token')}
              className={`h-12 ${
                stakingType === 'token' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Coins className="h-4 w-4 mr-2" />
              Token
            </Button>
          </div>

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

          {/* Wallet Connection */}
          <div className="space-y-3">
            {connectedWallet ? (
              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    {connectedWallet.type.charAt(0).toUpperCase() + connectedWallet.type.slice(1)} Connected
                  </span>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-600 hover:bg-red-900/20"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowWalletDialog(true)}
                variant="outline"
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          <Button
            onClick={handleStake}
            disabled={
              createStakeMutation.isPending || 
              !selectedPool || 
              !stakeAmount || 
              !stakingType || 
              !connectedWallet || 
              !pools?.length
            }
            className="w-full"
          >
            {createStakeMutation.isPending ? "Creating Stake..." : "Stake Tokens"}
          </Button>
        </CardContent>
      </Card>

      <WalletConnectionDialog 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog} 
      />
    </>
  );
};
