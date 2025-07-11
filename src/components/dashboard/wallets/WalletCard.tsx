
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Wallet = Database["public"]["Tables"]["user_wallets"]["Row"];
type BlockchainType = Database["public"]["Enums"]["blockchain_type"];

interface WalletCardProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (walletId: string) => void;
  onSetPrimary: (walletId: string) => void;
}

const blockchainColors: Record<BlockchainType, string> = {
  ethereum: "bg-blue-500",
  solana: "bg-purple-500", 
  cardano: "bg-purple-500",
  sui: "bg-cyan-500"
};

const formatWalletAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const WalletCard = ({ wallet, onEdit, onDelete, onSetPrimary }: WalletCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(wallet.id);
    setIsDeleting(false);
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700 relative">
      {wallet.is_primary && (
        <div className="absolute top-2 right-2">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <span>{wallet.wallet_name || "Unnamed Wallet"}</span>
          <Badge 
            className={`${blockchainColors[wallet.blockchain]} text-white border-0`}
          >
            {wallet.blockchain.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-gray-400 text-sm">Wallet Address</p>
          <p className="text-white font-mono text-sm break-all">
            {formatWalletAddress(wallet.wallet_address)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onEdit(wallet)}
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-black"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          {!wallet.is_primary && (
            <Button
              size="sm"
              onClick={() => onSetPrimary(wallet.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-black"
            >
              <Star className="h-4 w-4 mr-1" />
              Set Primary
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-black disabled:bg-gray-600 disabled:text-gray-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
