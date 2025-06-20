
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";
import { Plus } from "lucide-react";

type BlockchainType = Database["public"]["Enums"]["blockchain_type"];

interface AddWalletFormProps {
  onAdd: (walletData: {
    wallet_address: string;
    wallet_name: string;
    blockchain: BlockchainType;
    is_primary: boolean;
  }) => Promise<void>;
  isAdding: boolean;
  walletCount: number;
}

const blockchainOptions: { value: BlockchainType; label: string }[] = [
  { value: "ethereum", label: "Ethereum" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "cardano", label: "Cardano" },
  { value: "sui", label: "Sui" }
];

const validateWalletAddress = (address: string, blockchain: BlockchainType): string | null => {
  if (!address.trim()) return "Wallet address is required";
  
  switch (blockchain) {
    case "ethereum":
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return "Invalid Ethereum address format";
      }
      break;
    case "bitcoin":
      if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)) {
        return "Invalid Bitcoin address format";
      }
      break;
    case "cardano":
      if (!/^addr1[a-z0-9]{98}$/.test(address)) {
        return "Invalid Cardano address format";
      }
      break;
    case "sui":
      if (!/^0x[a-fA-F0-9]{64}$/.test(address)) {
        return "Invalid Sui address format";
      }
      break;
  }
  
  return null;
};

export const AddWalletForm = ({ onAdd, isAdding, walletCount }: AddWalletFormProps) => {
  const [formData, setFormData] = useState({
    wallet_address: "",
    wallet_name: "",
    blockchain: "" as BlockchainType,
    is_primary: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.wallet_address.trim()) {
      newErrors.wallet_address = "Wallet address is required";
    } else if (formData.blockchain) {
      const addressError = validateWalletAddress(formData.wallet_address, formData.blockchain);
      if (addressError) {
        newErrors.wallet_address = addressError;
      }
    }
    
    if (!formData.wallet_name.trim()) {
      newErrors.wallet_name = "Wallet name is required";
    }
    
    if (!formData.blockchain) {
      newErrors.blockchain = "Please select a blockchain";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await onAdd(formData);
    
    // Reset form
    setFormData({
      wallet_address: "",
      wallet_name: "",
      blockchain: "" as BlockchainType,
      is_primary: false
    });
    setErrors({});
    setIsExpanded(false);
  };

  if (walletCount >= 5) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Maximum of 5 wallets allowed per account</p>
        </CardContent>
      </Card>
    );
  }

  if (!isExpanded) {
    return (
      <Card className="bg-gray-800/40 border-gray-700 border-dashed cursor-pointer hover:bg-gray-800/60 transition-colors" onClick={() => setIsExpanded(true)}>
        <CardContent className="p-6 text-center">
          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">Add New Wallet</p>
          <p className="text-sm text-gray-500">{walletCount}/5 wallets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Add New Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Wallet Name</Label>
            <Input
              value={formData.wallet_name}
              onChange={(e) => setFormData({ ...formData, wallet_name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., My Main Wallet"
            />
            {errors.wallet_name && (
              <p className="text-red-400 text-sm mt-1">{errors.wallet_name}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-300">Blockchain</Label>
            <Select value={formData.blockchain} onValueChange={(value: BlockchainType) => setFormData({ ...formData, blockchain: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {blockchainOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.blockchain && (
              <p className="text-red-400 text-sm mt-1">{errors.blockchain}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-300">Wallet Address</Label>
            <Input
              value={formData.wallet_address}
              onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white font-mono"
              placeholder="Enter wallet address"
            />
            {errors.wallet_address && (
              <p className="text-red-400 text-sm mt-1">{errors.wallet_address}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => setFormData({ ...formData, is_primary: !!checked })}
              className="border-gray-600"
            />
            <Label htmlFor="is_primary" className="text-gray-300">
              Set as primary wallet (for payouts and rewards)
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isAdding}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAdding ? "Adding..." : "Add Wallet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
