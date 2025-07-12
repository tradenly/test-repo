
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Wallet, CreditCard, HelpCircle } from "lucide-react";
import { PaymentAddressModal } from "./PaymentAddressModal";
import { useCreatePaymentOrder } from "@/hooks/usePaymentOrders";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useToast } from "@/hooks/use-toast";

interface PhantomCreditPurchaseCardProps {
  className?: string;
}

export const PhantomCreditPurchaseCard = ({ className }: PhantomCreditPurchaseCardProps) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentPaymentOrder, setCurrentPaymentOrder] = useState<any>(null);

  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const createPaymentOrderMutation = useCreatePaymentOrder();

  const blockchains = [
    { value: "solana", label: "Solana", symbol: "USDC" },
    { value: "ethereum", label: "Ethereum", symbol: "USDC" },
    { value: "sui", label: "SUI", symbol: "USDC" },
    { value: "cardano", label: "Cardano", symbol: "USDM" }
  ];

  const usdcAddresses = {
    solana: "qinTdo2EZwmN2BShG8aoUXhQvAsmng2FmCsLuouKDaG",
    ethereum: "0xc5307D99C42C90C9519432403081Bf0B1D772EC6",
    sui: "0xe74dc24dc72e5f1aa5ff0cd2af2f2a2d55a5dd51c0536a25d62beed64b5ac5d6",
    cardano: "addr1q99zz8h37xgnvn0g9szx9c8tjt2jg9uyrkv397s4hjp323zf5l0wmwpchcf0gpa2nntxmprxt0w3gnpg348k9z30z0tsuttpqc"
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom wallet is not installed. Please install it from phantom.app");
        setIsConnecting(false);
        return;
      }

      const response = await window.solana.connect();
      setWalletAddress(response.publicKey.toString());
      setIsWalletConnected(true);
      console.log("Connected to Phantom:", response.publicKey.toString());
    } catch (error) {
      console.error("Failed to connect to Phantom:", error);
      alert("Failed to connect to Phantom wallet");
    }
    setIsConnecting(false);
  };

  const handleDisconnectWallet = () => {
    if (window.solana) {
      window.solana.disconnect();
    }
    setIsWalletConnected(false);
    setWalletAddress("");
  };

  const handleSubmit = async () => {
    if (!selectedBlockchain || !usdcAmount || !user) {
      alert("Please select a blockchain and enter a USDC amount");
      return;
    }

    const usdcValue = parseFloat(usdcAmount);
    if (usdcValue < 5) {
      alert("Minimum purchase is 5 USDC (25 credits)");
      return;
    }

    if (usdcValue <= 0) {
      alert("Please enter a valid USDC amount");
      return;
    }

    try {
      const paymentAddress = usdcAddresses[selectedBlockchain as keyof typeof usdcAddresses];
      const creditAmount = Math.floor(usdcValue * 5);

      const paymentOrder = await createPaymentOrderMutation.mutateAsync({
        userId: user.id,
        walletAddress: walletAddress || "manual_payment", // Use placeholder if no wallet connected
        blockchain: selectedBlockchain,
        usdcAmount: usdcValue,
        creditAmount,
        paymentAddress,
      });

      setCurrentPaymentOrder(paymentOrder);
      setShowPaymentModal(true);

      toast({
        title: "Payment Order Created",
        description: `Send ${usdcValue} USDC to receive ${creditAmount} credits. Order expires in 24 hours.`,
      });
    } catch (error: any) {
      console.error("Error creating payment order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payment order",
        variant: "destructive",
      });
    }
  };

  const creditAmount = usdcAmount ? Math.floor(parseFloat(usdcAmount) * 5) : 0;
  const selectedChain = blockchains.find(b => b.value === selectedBlockchain);
  const paymentAddress = selectedBlockchain ? usdcAddresses[selectedBlockchain as keyof typeof usdcAddresses] : "";

  return (
    <>
      <Card className={`bg-gray-800 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Credits with USDC
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-white cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-600 text-white max-w-sm">
                <p>Most payments are processed in under 30 minutes, but in rare cases of blockchain congestion, payment processing can take several hours. Please be patient and aware of this.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
            <p className="text-blue-200 text-sm">
              <strong>💰 Rate:</strong> 1 USDC = 5 Credits | <strong>Minimum:</strong> 5 USDC (25 Credits)
            </p>
          </div>

          <div>
            <Label htmlFor="blockchain" className="text-gray-300">
              Select Blockchain for USDC
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
                    {blockchain.label} ({blockchain.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Phantom Wallet (Optional)</Label>
            {!isWalletConnected ? (
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Phantom Wallet"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">✓ Wallet Connected</p>
                  <p className="text-gray-300 text-xs font-mono">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                  </p>
                </div>
                <Button
                  onClick={handleDisconnectWallet}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white hover:text-black"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="usdc" className="text-gray-300">
              USDC Amount (Min: 5 USDC)
            </Label>
            <Input
              id="usdc"
              type="number"
              placeholder="5.00"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              min="5"
              step="0.1"
            />
            {usdcAmount && (
              <p className="text-sm text-green-400 mt-1">
                Will receive: {creditAmount} Credits
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 25].map((amount) => (
              <Button
                key={amount}
                size="sm"
                onClick={() => setUsdcAmount(amount.toString())}
                className="bg-blue-600 hover:bg-blue-700 text-white hover:text-black"
              >
                {amount} USD
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedBlockchain || !usdcAmount || parseFloat(usdcAmount) < 5 || createPaymentOrderMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
          >
            {createPaymentOrderMutation.isPending ? "Creating Order..." : "Generate Payment Address"}
          </Button>
        </CardContent>
      </Card>

      <PaymentAddressModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        blockchain={selectedChain?.label || ""}
        creditAmount={creditAmount}
        paymentAddress={paymentAddress}
        requiredAmount={`${usdcAmount} USDC`}
      />
    </>
  );
};
