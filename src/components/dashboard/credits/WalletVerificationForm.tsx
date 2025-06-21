
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Scan, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface WalletVerificationFormProps {
  user: UnifiedUser;
}

interface VerificationResult {
  nftCount: number;
  memecoinCount: number;
  creditsAwarded: number;
  transactionId: string;
}

const blockchains = [
  { value: "solana", label: "Solana" },
  { value: "ethereum", label: "Ethereum" },
  { value: "sui", label: "SUI" }
];

export const WalletVerificationForm = ({ user }: WalletVerificationFormProps) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedBlockchain, setSelectedBlockchain] = useState("");
  const [verifyNFTs, setVerifyNFTs] = useState(true);
  const [verifyMemecoins, setVerifyMemecoins] = useState(true);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyWalletMutation = useMutation({
    mutationFn: async () => {
      console.log("Starting wallet verification:", { walletAddress, selectedBlockchain, verifyNFTs, verifyMemecoins });
      
      if (!verifyNFTs && !verifyMemecoins) {
        throw new Error("Please select at least one verification type");
      }

      const verificationType = verifyNFTs && verifyMemecoins ? "both" : verifyNFTs ? "nft" : "memecoin";
      
      // Check if this wallet has already been verified
      const { data: existingVerification } = await (supabase as any)
        .from("wallet_verifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("wallet_address", walletAddress)
        .eq("verification_type", verificationType)
        .single();

      if (existingVerification) {
        throw new Error("This wallet has already been verified for the selected verification type");
      }

      // Mock verification logic (in production, this would call blockchain APIs)
      // For now, we'll simulate finding some NFTs and meme coins
      const mockNFTCount = verifyNFTs ? Math.floor(Math.random() * 10) + 1 : 0;
      const mockMemecoinCount = verifyMemecoins ? Math.floor(Math.random() * 5000) + 500 : 0;
      
      const nftCredits = mockNFTCount * 5;
      const memecoinCredits = Math.floor(mockMemecoinCount / 500);
      const totalCredits = nftCredits + memecoinCredits;

      if (totalCredits === 0) {
        throw new Error("No eligible NFTs or meme coins found in this wallet");
      }

      // Record the verification
      const { data: verification, error: verificationError } = await (supabase as any)
        .from("wallet_verifications")
        .insert([{
          user_id: user.id,
          wallet_address: walletAddress,
          blockchain: selectedBlockchain,
          verification_type: verificationType,
          nft_count: mockNFTCount,
          memecoin_count: mockMemecoinCount,
          credits_awarded: totalCredits
        }])
        .select()
        .single();

      if (verificationError) {
        console.error("Error recording verification:", verificationError);
        throw verificationError;
      }

      // Update user credits
      const { data: currentCredits } = await (supabase as any)
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      const newBalance = (currentCredits?.balance || 0) + totalCredits;

      if (currentCredits) {
        await (supabase as any)
          .from("user_credits")
          .update({ balance: newBalance })
          .eq("user_id", user.id);
      } else {
        await (supabase as any)
          .from("user_credits")
          .insert([{ user_id: user.id, balance: totalCredits }]);
      }

      // Record the transaction
      const transactionType = verificationType === "both" ? "nft_verification" : 
                             verificationType === "nft" ? "nft_verification" : "memecoin_verification";
      
      const { data: transaction } = await (supabase as any)
        .from("credit_transactions")
        .insert([{
          user_id: user.id,
          transaction_type: transactionType,
          amount: totalCredits,
          description: `Wallet verification: ${mockNFTCount} NFTs, ${mockMemecoinCount} meme coins`,
          status: "completed",
          completed_at: new Date().toISOString(),
          reference_id: verification.id
        }])
        .select()
        .single();

      return {
        nftCount: mockNFTCount,
        memecoinCount: mockMemecoinCount,
        creditsAwarded: totalCredits,
        transactionId: transaction.id
      };
    },
    onSuccess: (result) => {
      setVerificationResult(result);
      queryClient.invalidateQueries({ queryKey: ["user-credits", user.id] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", user.id] });
      toast({
        title: "Wallet Verified Successfully!",
        description: `Awarded ${result.creditsAwarded} credits for your NFTs and meme coins.`,
      });
    },
    onError: (error: any) => {
      console.error("Wallet verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Missing Wallet Address",
        description: "Please enter a wallet address to verify.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBlockchain) {
      toast({
        title: "Missing Blockchain",
        description: "Please select a blockchain.",
        variant: "destructive",
      });
      return;
    }

    verifyWalletMutation.mutate();
  };

  const resetForm = () => {
    setVerificationResult(null);
    setWalletAddress("");
    setSelectedBlockchain("");
    setVerifyNFTs(true);
    setVerifyMemecoins(true);
  };

  if (verificationResult) {
    return (
      <div className="bg-gray-900/40 rounded-lg p-6 text-center space-y-4">
        <div className="text-green-400 text-2xl">🎉</div>
        <h3 className="text-xl font-bold text-white">Verification Successful!</h3>
        <div className="space-y-2 text-gray-300">
          <p>Found {verificationResult.nftCount} POOPEE NFTs</p>
          <p>Found {verificationResult.memecoinCount} POOPEE meme coins</p>
          <p className="text-green-400 font-bold text-lg">
            Total Credits Awarded: {verificationResult.creditsAwarded}
          </p>
        </div>
        <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 text-white">
          Verify Another Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 rounded-lg p-4 space-y-4">
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
        <p className="text-blue-200 text-sm">
          <strong>🎁 Rewards:</strong> 5 Credits per POOPEE NFT | 1 Credit per 500 POOPEE meme coins
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="blockchain" className="text-gray-300">
            Select Blockchain
          </Label>
          <Select value={selectedBlockchain} onValueChange={setSelectedBlockchain}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Choose blockchain..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {blockchains.map((blockchain) => (
                <SelectItem
                  key={blockchain.value}
                  value={blockchain.value}
                  className="text-white hover:bg-gray-600"
                >
                  {blockchain.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="wallet-address" className="text-gray-300">
            Wallet Address
          </Label>
          <Input
            id="wallet-address"
            type="text"
            placeholder="Enter your wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-gray-300">Verification Type</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verify-nfts"
                checked={verifyNFTs}
                onCheckedChange={(checked) => setVerifyNFTs(checked === true)}
                className="border-gray-600"
              />
              <Label htmlFor="verify-nfts" className="text-gray-300">
                Verify POOPEE NFTs (5 credits each)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verify-memecoins"
                checked={verifyMemecoins}
                onCheckedChange={(checked) => setVerifyMemecoins(checked === true)}
                className="border-gray-600"
              />
              <Label htmlFor="verify-memecoins" className="text-gray-300">
                Verify POOPEE meme coins (1 credit per 500 coins)
              </Label>
            </div>
          </div>
        </div>

        <Button
          onClick={handleVerify}
          disabled={verifyWalletMutation.isPending || (!verifyNFTs && !verifyMemecoins)}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
        >
          {verifyWalletMutation.isPending ? (
            <>
              <Scan className="h-4 w-4 mr-2 animate-spin" />
              Scanning Wallet...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Verify Wallet & Claim Credits
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
