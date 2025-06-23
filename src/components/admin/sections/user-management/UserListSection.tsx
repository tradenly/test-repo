
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedUserCard } from "./EnhancedUserCard";

interface UserListSectionProps {
  users: any[] | undefined;
  isLoading: boolean;
  currentUserId?: string;
  onMakeAdmin: (userId: string) => void;
  onRemoveAdmin: (userId: string) => void;
  onBanUser: (user: any) => void;
  onUnbanUser: (userId: string) => void;
  isProcessing: boolean;
}

export const UserListSection = ({
  users,
  isLoading,
  currentUserId,
  onMakeAdmin,
  onRemoveAdmin,
  onBanUser,
  onUnbanUser,
  isProcessing
}: UserListSectionProps) => {
  return (
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
                currentUserId={currentUserId}
                onMakeAdmin={() => onMakeAdmin(userData.id)}
                onRemoveAdmin={() => onRemoveAdmin(userData.id)}
                onBanUser={() => onBanUser(userData)}
                onUnbanUser={() => onUnbanUser(userData.id)}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
