
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

interface ProfilePersonalInfoProps {
  user: UnifiedUser;
  formData: ProfileForm;
  setFormData: (data: ProfileForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

export const ProfilePersonalInfo = ({ 
  user, 
  formData, 
  setFormData, 
  onSubmit, 
  isUpdating 
}: ProfilePersonalInfoProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label className="text-gray-300">Username</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Choose a username"
            />
          </div>

          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-gray-700 hover:bg-gray-600"
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
