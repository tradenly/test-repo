import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Crown, Shield, Ban, Search, Users, Wallet, MessageSquare, UserPlus } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { EnhancedUserCard } from "./user-management/EnhancedUserCard";
import { BanUserDialog } from "./user-management/BanUserDialog";
import { CreateUserDialog } from "./user-management/CreateUserDialog";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [banDialogUser, setBanDialogUser] = useState<any>(null);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers', searchTerm],
    queryFn: async () => {
      console.log('🔍 UserManagement: Fetching enhanced user data, current user:', user?.id);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }

      // Get profiles first
      let profileQuery = supabase
        .from('profiles')
        .select('id, username, full_name, created_at');

      if (searchTerm) {
        profileQuery = profileQuery.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data: profiles, error: profileError } = await profileQuery.order('created_at', { ascending: false });
      
      if (profileError) {
        console.error('❌ UserManagement: Profile fetch error:', profileError);
        throw profileError;
      }

      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map(p => p.id);

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) {
        console.error('❌ UserManagement: Roles fetch error:', rolesError);
      }

      // Get user credits
      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, balance')
        .in('user_id', userIds);

      if (creditsError) {
        console.error('❌ UserManagement: Credits fetch error:', creditsError);
      }

      // Get social accounts
      const { data: socialAccounts, error: socialError } = await supabase
        .from('user_social_accounts')
        .select('user_id, platform, username, verified')
        .in('user_id', userIds);

      if (socialError) {
        console.error('❌ UserManagement: Social accounts fetch error:', socialError);
      }

      // Get user wallets
      const { data: userWallets, error: walletsError } = await supabase
        .from('user_wallets')
        .select('user_id, blockchain, wallet_address, wallet_name, is_primary')
        .in('user_id', userIds);

      if (walletsError) {
        console.error('❌ UserManagement: Wallets fetch error:', walletsError);
      }

      // Get ban status
      const { data: userBans, error: bansError } = await supabase
        .from('user_bans')
        .select('user_id, reason, banned_at, is_active')
        .in('user_id', userIds)
        .eq('is_active', true);

      if (bansError) {
        console.error('❌ UserManagement: Bans fetch error:', bansError);
      }

      // Merge all data
      return profiles.map(profile => ({
        ...profile,
        user_roles: userRoles?.filter(role => role.user_id === profile.id) || [],
        user_credits: userCredits?.filter(credit => credit.user_id === profile.id) || [],
        social_accounts: socialAccounts?.filter(social => social.user_id === profile.id) || [],
        wallets: userWallets?.filter(wallet => wallet.user_id === profile.id) || [],
        ban_info: userBans?.find(ban => ban.user_id === profile.id) || null,
      }));
    },
    enabled: !!user,
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔧 UserManagement: Making user admin:', userId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }

      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' });
      
      if (error) {
        console.error('❌ UserManagement: Make admin error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "User has been made an admin.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to make user admin.",
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔧 UserManagement: Removing admin from user:', userId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      
      if (error) {
        console.error('❌ UserManagement: Remove admin error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "Admin privileges removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin privileges.",
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      console.log('🔧 UserManagement: Banning user:', userId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }

      // Prevent admins from banning themselves
      if (userId === user?.id) {
        throw new Error('You cannot ban yourself');
      }

      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: userId,
          banned_by: user?.id,
          reason: reason || 'No reason provided',
          is_active: true
        });
      
      if (error) {
        console.error('❌ UserManagement: Ban user error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setBanDialogUser(null);
      toast({
        title: "Success",
        description: "User has been banned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to ban user.",
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔧 UserManagement: Unbanning user:', userId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }

      const { error } = await supabase
        .from('user_bans')
        .update({ 
          is_active: false,
          unbanned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) {
        console.error('❌ UserManagement: Unban user error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "User has been unbanned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unban user.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUserSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    toast({
      title: "Success",
      description: "User created successfully and will appear in the list shortly.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage users, roles, permissions, and safety</p>
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by username or full name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button
              onClick={() => setCreateUserDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({users?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-gray-400">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users?.map((userData) => (
                <EnhancedUserCard
                  key={userData.id}
                  user={userData}
                  currentUserId={user?.id}
                  onMakeAdmin={() => makeAdminMutation.mutate(userData.id)}
                  onRemoveAdmin={() => removeAdminMutation.mutate(userData.id)}
                  onBanUser={() => setBanDialogUser(userData)}
                  onUnbanUser={() => unbanUserMutation.mutate(userData.id)}
                  isProcessing={
                    makeAdminMutation.isPending || 
                    removeAdminMutation.isPending ||
                    banUserMutation.isPending ||
                    unbanUserMutation.isPending
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BanUserDialog
        user={banDialogUser}
        isOpen={!!banDialogUser}
        onClose={() => setBanDialogUser(null)}
        onConfirm={(reason) => banUserMutation.mutate({ userId: banDialogUser.id, reason })}
        isProcessing={banUserMutation.isPending}
      />

      <CreateUserDialog
        isOpen={createUserDialogOpen}
        onClose={() => setCreateUserDialogOpen(false)}
        onSuccess={handleCreateUserSuccess}
      />
    </div>
  );
};
