
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";

interface WalletConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletConnectionDialog = ({ open, onOpenChange }: WalletConnectionDialogProps) => {
  const { connectMetaMask, connectPhantom, isConnecting } = useWalletConnection();

  const handleMetaMaskConnect = async () => {
    await connectMetaMask();
    onOpenChange(false);
  };

  const handlePhantomConnect = async () => {
    await connectPhantom();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <Button
            onClick={handleMetaMaskConnect}
            disabled={isConnecting}
            className="w-full h-14 flex items-center gap-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            )}
            <div className="text-left flex-1">
              <div className="font-semibold">MetaMask</div>
              <div className="text-sm opacity-80">Ethereum Wallet</div>
            </div>
          </Button>

          <Button
            onClick={handlePhantomConnect}
            disabled={isConnecting}
            className="w-full h-14 flex items-center gap-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
            )}
            <div className="text-left flex-1">
              <div className="font-semibold">Phantom</div>
              <div className="text-sm opacity-80">Solana Wallet</div>
            </div>
          </Button>

          <Button
            disabled
            className="w-full h-14 flex items-center gap-4 bg-gray-600 cursor-not-allowed opacity-50"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold">ETERNL</div>
              <div className="text-sm opacity-80">Cardano Wallet (Coming Soon)</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
