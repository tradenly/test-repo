
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface ProfileForm {
  username: string;
  full_name: string;
  email: string;
}

interface ProfileEmailSettingsProps {
  user: UnifiedUser;
  formData: ProfileForm;
  setFormData: (data: ProfileForm) => void;
  onEmailUpdate: () => void;
  isUpdatingEmail: boolean;
  isUpdating: boolean;
}

export const ProfileEmailSettings = ({ 
  user, 
  formData, 
  setFormData, 
  onEmailUpdate, 
  isUpdatingEmail, 
  isUpdating 
}: ProfileEmailSettingsProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Email Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Current Email</Label>
          <p className="text-white mt-1">{user.email}</p>
        </div>
        
        <div>
          <Label className="text-gray-300">New Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter new email address"
          />
        </div>

        <Button
          onClick={onEmailUpdate}
          disabled={isUpdatingEmail || isUpdating}
          className="bg-blue-600 hover:bg-blue-400 hover:text-black text-white border-0"
        >
          {isUpdatingEmail || isUpdating ? "Updating..." : "Update Email"}
        </Button>
        
        <p className="text-sm text-gray-400">
          You'll need to confirm the new email address before the change takes effect.
        </p>
      </CardContent>
    </Card>
  );
};
