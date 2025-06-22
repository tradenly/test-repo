
import { SocialAccountCard } from "./SocialAccountCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { LoadingCard } from "./LoadingCard";
import { ReferralCard } from "./ReferralCard";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  profile_url?: string;
  verified: boolean;
  created_at: string;
}

interface SocialAccountsListProps {
  socialAccounts: SocialAccount[];
  isLoading: boolean;
  onDelete: (accountId: string) => void;
  isDeleting: boolean;
  onAddClick: () => void;
  user: UnifiedUser;
}

export const SocialAccountsList = ({
  socialAccounts,
  isLoading,
  onDelete,
  isDeleting,
  onAddClick,
  user,
}: SocialAccountsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingCard />
        <LoadingCard />
        <ReferralCard user={user} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Social Accounts Section */}
      <div className="space-y-4">
        {socialAccounts.length === 0 ? (
          <EmptyStateCard onAddClick={onAddClick} />
        ) : (
          socialAccounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              account={account}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))
        )}
      </div>
      
      {/* Referral Card - Always show below social accounts */}
      <ReferralCard user={user} />
    </div>
  );
};
