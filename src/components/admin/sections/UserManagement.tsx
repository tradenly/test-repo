
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Crown, Shield, Ban, Search } from "lucide-react";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          created_at,
          user_roles (role),
          user_credits (balance)
        `);

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "User has been made an admin.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to make user admin.",
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "Admin privileges removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove admin privileges.",
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
                      <p className="text-gray-400 text-sm">Credits: {credits.toFixed(2)}</p>
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
