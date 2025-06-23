
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserSearchSection } from "./user-management/UserSearchSection";
import { UserListSection } from "./user-management/UserListSection";
import { BanUserDialog } from "./user-management/BanUserDialog";
import { CreateUserDialog } from "./user-management/CreateUserDialog";
import { useUserManagement } from "./user-management/useUserManagement";
import { useQueryClient } from "@tanstack/react-query";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [banDialogUser, setBanDialogUser] = useState<any>(null);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    users,
    isLoading,
    makeAdminMutation,
    removeAdminMutation,
    banUserMutation,
    unbanUserMutation,
    user
  } = useUserManagement(searchTerm);

  const handleCreateUserSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    toast({
      title: "Success",
      description: "User created successfully and will appear in the list shortly.",
    });
  };

  const handleBanUser = (reason: string) => {
    if (banDialogUser) {
      banUserMutation.mutate({ userId: banDialogUser.id, reason });
    }
  };

  const handleBanDialogClose = () => {
    setBanDialogUser(null);
  };

  const isProcessing = 
    makeAdminMutation.isPending || 
    removeAdminMutation.isPending ||
    banUserMutation.isPending ||
    unbanUserMutation.isPending;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage users, roles, permissions, and safety</p>
      </div>

      <UserSearchSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateUser={() => setCreateUserDialogOpen(true)}
      />

      <UserListSection
        users={users}
        isLoading={isLoading}
        currentUserId={user?.id}
        onMakeAdmin={makeAdminMutation.mutate}
        onRemoveAdmin={removeAdminMutation.mutate}
        onBanUser={setBanDialogUser}
        onUnbanUser={unbanUserMutation.mutate}
        isProcessing={isProcessing}
      />

      <BanUserDialog
        user={banDialogUser}
        isOpen={!!banDialogUser}
        onClose={handleBanDialogClose}
        onConfirm={handleBanUser}
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
