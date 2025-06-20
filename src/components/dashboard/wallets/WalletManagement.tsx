
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { WalletCard } from "./WalletCard";
import { AddWalletForm } from "./AddWalletForm";
import { EditWalletModal } from "./EditWalletModal";
import { Database } from "@/integrations/supabase/types";

type Wallet = Database["public"]["Tables"]["user_wallets"]["Row"];
type BlockchainType = Database["public"]["Enums"]["blockchain_type"];

interface WalletManagementProps {
  user: UnifiedUser;
}

export const WalletManagement = ({ user }: WalletManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  // Fetch user's wallets
  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ["user-wallets", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Wallet[];
    },
  });

  // Add wallet mutation
  const addWalletMutation = useMutation({
    mutationFn: async (walletData: {
      wallet_address: string;
      wallet_name: string;
      blockchain: BlockchainType;
      is_primary: boolean;
    }) => {
      // If setting as primary, first unset all other primary wallets
      if (walletData.is_primary) {
        await supabase
          .from("user_wallets")
          .update({ is_primary: false })
          .eq("user_id", user.id);
      }

      const { data, error } = await supabase
        .from("user_wallets")
        .insert({
          user_id: user.id,
          ...walletData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wallets", user.id] });
      toast({
        title: "Wallet added",
        description: "Your wallet has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit wallet mutation
  const editWalletMutation = useMutation({
    mutationFn: async ({ walletId, updates }: { walletId: string; updates: { wallet_name: string; is_primary: boolean } }) => {
      // If setting as primary, first unset all other primary wallets
      if (updates.is_primary) {
        await supabase
          .from("user_wallets")
          .update({ is_primary: false })
          .eq("user_id", user.id);
      }

      const { data, error } = await supabase
        .from("user_wallets")
        .update(updates)
        .eq("id", walletId)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wallets", user.id] });
      toast({
        title: "Wallet updated",
        description: "Your wallet has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete wallet mutation
  const deleteWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      const { error } = await supabase
        .from("user_wallets")
        .delete()
        .eq("id", walletId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wallets", user.id] });
      toast({
        title: "Wallet deleted",
        description: "Your wallet has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set primary wallet mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (walletId: string) => {
      // First unset all primary wallets
      await supabase
        .from("user_wallets")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      // Then set the selected wallet as primary
      const { error } = await supabase
        .from("user_wallets")
        .update({ is_primary: true })
        .eq("id", walletId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wallets", user.id] });
      toast({
        title: "Primary wallet updated",
        description: "Your primary wallet has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update primary wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-white">Loading wallets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            onEdit={setEditingWallet}
            onDelete={deleteWalletMutation.mutate}
            onSetPrimary={setPrimaryMutation.mutate}
          />
        ))}
        
        <AddWalletForm
          onAdd={addWalletMutation.mutate}
          isAdding={addWalletMutation.isPending}
          walletCount={wallets.length}
        />
      </div>

      <EditWalletModal
        wallet={editingWallet}
        isOpen={!!editingWallet}
        onClose={() => setEditingWallet(null)}
        onSave={(walletId, updates) => editWalletMutation.mutate({ walletId, updates })}
        isSaving={editWalletMutation.isPending}
      />
    </div>
  );
};
