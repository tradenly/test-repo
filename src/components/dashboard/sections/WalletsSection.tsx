import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Wallet } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { WalletActions } from "./WalletActions";

type BlockchainType = Database["public"]["Enums"]["blockchain_type"];

interface WalletsSectionProps {
  user: UnifiedUser;
}

interface AddWalletForm {
  blockchain: BlockchainType;
  wallet_address: string;
  wallet_name: string;
}

export const WalletsSection = ({ user }: WalletsSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<AddWalletForm>({
    blockchain: "cardano",
    wallet_address: "",
    wallet_name: "",
  });

  // Fetch wallets - works for both auth types but only stores for Supabase users
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["userWallets", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user.authType === 'supabase',
  });

  const addWalletMutation = useMutation({
    mutationFn: async (walletData: AddWalletForm) => {
      if (user.authType !== 'supabase') {
        throw new Error('Wallet storage only available for email users');
      }
      
      const { error } = await supabase
        .from("user_wallets")
        .insert({
          user_id: user.id,
          blockchain: walletData.blockchain,
          wallet_address: walletData.wallet_address,
          wallet_name: walletData.wallet_name,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userWallets", user.id] });
      toast({
        title: "Wallet added",
        description: "Your wallet has been successfully added.",
      });
      setShowAddForm(false);
      setFormData({
        blockchain: "cardano",
        wallet_address: "",
        wallet_name: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add wallet. Please try again.",
        variant: "destructive",
      });
      console.error("Add wallet error:", error);
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      const { error } = await supabase
        .from("user_wallets")
        .delete()
        .eq("id", walletId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userWallets", user.id] });
      toast({
        title: "Wallet removed",
        description: "Your wallet has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove wallet. Please try again.",
        variant: "destructive",
      });
      console.error("Delete wallet error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.wallet_address.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wallet address.",
        variant: "destructive",
      });
      return;
    }
    addWalletMutation.mutate(formData);
  };

  const getBlockchainIcon = (blockchain: BlockchainType) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Management</h1>
          <p className="text-gray-400">Manage your cryptocurrency wallet addresses</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Wallet Actions Component */}
      <WalletActions user={user} />

      {/* Current ZK Login Wallet Display */}
      {user.authType === 'zklogin' && user.walletAddress && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Connected Wallet</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🌊</div>
              <div>
                <h3 className="text-white font-medium">Primary SUI Wallet</h3>
                <p className="text-gray-400 text-sm">ZK Login Connected</p>
                <p className="text-gray-500 text-xs font-mono">
                  {user.walletAddress.slice(0, 20)}...{user.walletAddress.slice(-10)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Add New Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300">Blockchain</Label>
                <Select
                  value={formData.blockchain}
                  onValueChange={(value: BlockchainType) =>
                    setFormData({ ...formData, blockchain: value })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="cardano">Cardano</SelectItem>
                    <SelectItem value="sui">SUI</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Wallet Address</Label>
                <Input
                  value={formData.wallet_address}
                  onChange={(e) =>
                    setFormData({ ...formData, wallet_address: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter your wallet address"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300">Wallet Name (Optional)</Label>
                <Input
                  value={formData.wallet_name}
                  onChange={(e) =>
                    setFormData({ ...formData, wallet_name: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., Main Wallet, Trading Wallet"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={addWalletMutation.isPending || user.authType !== 'supabase'}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  {addWalletMutation.isPending ? "Adding..." : "Add Wallet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
              
              {user.authType === 'zklogin' && (
                <p className="text-sm text-gray-400">
                  Additional wallet storage for ZK Login users will be available in future updates.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {isLoading && user.authType === 'supabase' ? (
          <Card className="bg-gray-800/40 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-400 text-center">Loading wallets...</p>
            </CardContent>
          </Card>
        ) : wallets && wallets.length > 0 ? (
          wallets.map((wallet) => (
            <Card key={wallet.id} className="bg-gray-800/40 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getBlockchainIcon(wallet.blockchain)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {wallet.wallet_name || `${wallet.blockchain} Wallet`}
                      </h3>
                      <p className="text-gray-400 text-sm capitalize">
                        {wallet.blockchain}
                      </p>
                      <p className="text-gray-500 text-xs font-mono">
                        {wallet.wallet_address.slice(0, 20)}...{wallet.wallet_address.slice(-10)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWalletMutation.mutate(wallet.id)}
                    disabled={deleteWalletMutation.isPending}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800/40 border-gray-700">
            <CardContent className="p-12 text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">
                {user.authType === 'supabase' ? 'No additional wallets added' : 'Wallet Management Available'}
              </h3>
              <p className="text-gray-400 mb-4">
                {user.authType === 'supabase' 
                  ? 'Add your cryptocurrency wallet addresses to track and manage your assets'
                  : 'Your connected ZK Login wallet is displayed above. Additional wallet storage coming soon.'
                }
              </p>
              {user.authType === 'supabase' && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Wallet
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
