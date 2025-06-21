
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Crown, Shield, Ban, Search } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers', searchTerm],
    queryFn: async () => {
      console.log('🔍 UserManagement: Fetching users, current user:', user?.id);
      
      // Ensure we have a session before making queries
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }
      
      console.log('🔐 UserManagement: Using session:', !!session);

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

      // Merge data
      return profiles.map(profile => ({
        ...profile,
        user_roles: userRoles?.filter(role => role.user_id === profile.id) || [],
        user_credits: userCredits?.filter(credit => credit.user_id === profile.id) || [],
      }));
    },
    enabled: !!user,
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔧 UserManagement: Making user admin:', userId);
      
      // Ensure we have a session
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
      
      console.log('✅ UserManagement: Successfully made user admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "User has been made an admin.",
      });
    },
    onError: (error: any) => {
      console.error('💥 UserManagement: Make admin mutation error:', error);
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
      
      // Ensure we have a session
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
      
      console.log('✅ UserManagement: Successfully removed admin privileges');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "Admin privileges removed.",
      });
    },
    onError: (error: any) => {
      console.error('💥 UserManagement: Remove admin mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin privileges.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage users, roles, and permissions</p>
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username or full name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-gray-400">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users?.map((user) => {
                const isAdmin = user.user_roles?.some(role => role.role === 'admin');
                const credits = user.user_credits?.[0]?.balance || 0;
                
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">
                          {user.full_name || user.username || 'Unnamed User'}
                        </h3>
                        {isAdmin && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                      <p className="text-gray-400 text-sm">Credits: {Number(credits).toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <Button
                          onClick={() => removeAdminMutation.mutate(user.id)}
                          variant="outline"
                          size="sm"
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                          disabled={removeAdminMutation.isPending}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Remove Admin
                        </Button>
                      ) : (
                        <Button
                          onClick={() => makeAdminMutation.mutate(user.id)}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          disabled={makeAdminMutation.isPending}
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Make Admin
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
