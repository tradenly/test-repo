
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { ProfileAccountInfo } from "./profile/ProfileAccountInfo";
import { ProfilePersonalInfo } from "./profile/ProfilePersonalInfo";
import { ProfileEmailSettings } from "./profile/ProfileEmailSettings";
import { useProfileData } from "./profile/useProfileData";

interface ProfileSectionProps {
  user: UnifiedUser;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const {
    isLoading,
    formData,
    setFormData,
    handleProfileSubmit,
    handleEmailUpdate,
    isUpdatingEmail,
    isUpdatingProfile,
    isUpdatingEmailMutation,
  } = useProfileData(user);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information</p>
      </div>

      <ProfileAccountInfo user={user} />

      <ProfilePersonalInfo 
        user={user}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleProfileSubmit}
        isUpdating={isUpdatingProfile}
      />

      <ProfileEmailSettings 
        user={user}
        formData={formData}
        setFormData={setFormData}
        onEmailUpdate={handleEmailUpdate}
        isUpdatingEmail={isUpdatingEmail}
        isUpdating={isUpdatingEmailMutation}
      />
    </div>
  );
};
