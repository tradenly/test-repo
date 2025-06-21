
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Users } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type SocialPlatform = Database["public"]["Enums"]["social_platform"];

interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  profile_url: string | null;
}

interface SocialAccountsListProps {
  socialAccounts: SocialAccount[] | undefined;
  isLoading: boolean;
  onDelete: (accountId: string) => void;
  isDeleting: boolean;
  onAddClick: () => void;
}

export const SocialAccountsList = ({
  socialAccounts,
  isLoading,
  onDelete,
  isDeleting,
  onAddClick,
}: SocialAccountsListProps) => {
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "twitter":
        return "🐦";
      case "discord":
        return "💬";
      case "telegram":
        return "📱";
      case "instagram":
        return "📷";
      case "youtube":
        return "📺";
      default:
        return "🔗";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardContent className="p-6">
          <p className="text-gray-400 text-center">Loading social accounts...</p>
        </CardContent>
      </Card>
    );
  }

  if (!socialAccounts || socialAccounts.length === 0) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No social accounts linked</h3>
          <p className="text-gray-400 mb-4">
            Connect your social media accounts to enhance your profile
          </p>
          <Button
            onClick={onAddClick}
            className="bg-gray-700 hover:bg-gray-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {socialAccounts.map((account) => (
        <Card key={account.id} className="bg-gray-800/40 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {getPlatformIcon(account.platform)}
                </div>
                <div>
                  <h3 className="text-white font-medium capitalize">
                    {account.platform}
                  </h3>
                  <p className="text-gray-400">{account.username}</p>
                  {account.profile_url && (
                    <a
                      href={account.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(account.id)}
                disabled={isDeleting}
                className="border-red-600 text-red-400 hover:bg-red-600/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
