
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AddSocialForm as AddSocialFormType, SocialPlatform } from "./useSocialOperations";

interface AddSocialFormProps {
  onSubmit: (data: AddSocialFormType) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const AddSocialForm = ({ onSubmit, isSubmitting, onCancel }: AddSocialFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AddSocialFormType>({
    platform: "twitter",
    username: "",
    profile_url: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(formData);
    setFormData({
      platform: "twitter",
      username: "",
      profile_url: "",
    });
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Add Social Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Platform</Label>
            <Select
              value={formData.platform}
              onValueChange={(value: SocialPlatform) =>
                setFormData({ ...formData, platform: value })
              }
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Username</Label>
            <Input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="@username"
              required
            />
          </div>

          <div>
            <Label className="text-gray-300">Profile URL (Optional)</Label>
            <Input
              value={formData.profile_url}
              onChange={(e) =>
                setFormData({ ...formData, profile_url: e.target.value })
              }
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-700 hover:bg-gray-600"
            >
              {isSubmitting ? "Adding..." : "Add Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
