
import { Database } from "@/integrations/supabase/types";
import { SocialAccountCard } from "./SocialAccountCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { LoadingCard } from "./LoadingCard";

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
  if (isLoading) {
    return <LoadingCard />;
  }

  if (!socialAccounts || socialAccounts.length === 0) {
    return <EmptyStateCard onAddClick={onAddClick} />;
  }

  return (
    <div className="space-y-6">
      {socialAccounts.map((account) => (
        <SocialAccountCard
          key={account.id}
          account={account}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
