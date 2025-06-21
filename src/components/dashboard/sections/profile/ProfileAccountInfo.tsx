
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface ProfileAccountInfoProps {
  user: UnifiedUser;
}

export const ProfileAccountInfo = ({ user }: ProfileAccountInfoProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Authentication Type</Label>
          <p className="text-white mt-1">Email/Password</p>
        </div>
        
        <div>
          <Label className="text-gray-300">Email</Label>
          <p className="text-white mt-1">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  );
};
