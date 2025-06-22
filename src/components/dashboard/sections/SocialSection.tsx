
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useSocialOperations } from "./social/useSocialOperations";
import { AddSocialForm } from "./social/AddSocialForm";
import { SocialAccountsList } from "./social/SocialAccountsList";
import { SocialCampaignBanner } from "./social/SocialCampaignBanner";

interface SocialSectionProps {
  user: UnifiedUser;
}

export const SocialSection = ({ user }: SocialSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const {
    socialAccounts,
    isLoading,
    addSocialMutation,
    deleteSocialMutation,
  } = useSocialOperations(user);

  const handleAddAccount = (formData: any) => {
    addSocialMutation.mutate(formData, {
      onSuccess: () => {
        setShowAddForm(false);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Social Accounts & Referrals</h1>
          <p className="text-gray-400">Link your social media accounts and share your referral link</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <SocialCampaignBanner />

      {showAddForm && (
        <AddSocialForm
          onSubmit={handleAddAccount}
          isSubmitting={addSocialMutation.isPending}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <SocialAccountsList
        socialAccounts={socialAccounts}
        isLoading={isLoading}
        onDelete={(accountId) => deleteSocialMutation.mutate(accountId)}
        isDeleting={deleteSocialMutation.isPending}
        onAddClick={() => setShowAddForm(true)}
        user={user}
      />
    </div>
  );
};
