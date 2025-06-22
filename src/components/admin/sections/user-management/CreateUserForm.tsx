
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateUserForm = ({ onSuccess, onCancel }: CreateUserFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    username: "",
    role: "user",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: formData
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: `User ${formData.email} has been created successfully. Temporary password: ${formData.password}`,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Create user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-white">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="user@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="username" className="text-white">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="johndoe"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="fullName" className="text-white">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="John Doe"
        />
      </div>

      <div>
        <Label htmlFor="role" className="text-white">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="user" className="text-white hover:bg-gray-700">User</SelectItem>
            <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password" className="text-white">Temporary Password *</Label>
        <div className="flex gap-2">
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter temporary password"
          />
          <Button
            type="button"
            onClick={generateRandomPassword}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Generate
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          User will be prompted to change this password on first login
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? "Creating..." : "Create User"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
