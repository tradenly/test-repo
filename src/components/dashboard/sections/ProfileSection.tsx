
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface ProfileSectionProps {
  user: User;
}

interface ProfileForm {
  username: string;
  full_name: string;
  email: string;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const form = useForm<ProfileForm>({
    defaultValues: {
      username: "",
      full_name: "",
      email: user.email || "",
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        form.reset({
          username: data.username || "",
          full_name: data.full_name || "",
          email: user.email || "",
        });
      }
      
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Omit<ProfileForm, "email">) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: data.username,
          full_name: data.full_name,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Email update initiated",
        description: "Please check your new email for confirmation.",
      });
      setIsUpdatingEmail(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
      console.error("Email update error:", error);
      setIsUpdatingEmail(false);
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate({
      username: data.username,
      full_name: data.full_name,
    });
  };

  const handleEmailUpdate = () => {
    const newEmail = form.getValues("email");
    if (newEmail && newEmail !== user.email) {
      setIsUpdatingEmail(true);
      updateEmailMutation.mutate(newEmail);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information</p>
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your full name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Choose a username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-gray-700 hover:bg-gray-600"
              >
                {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Current Email</Label>
            <p className="text-white mt-1">{user.email}</p>
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">New Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter new email address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            onClick={handleEmailUpdate}
            disabled={isUpdatingEmail || updateEmailMutation.isPending}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            {isUpdatingEmail || updateEmailMutation.isPending ? "Updating..." : "Update Email"}
          </Button>
          
          <p className="text-sm text-gray-400">
            You'll need to confirm the new email address before the change takes effect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
