
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        // If no session, check for hash params (from email link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (data.session && !error) {
              setIsValidSession(true);
            } else {
              console.error('Session setup error:', error);
              toast({
                title: "Invalid Reset Link",
                description: "This password reset link is invalid or has expired.",
                variant: "destructive",
              });
              navigate('/auth');
            }
          } catch (err) {
            console.error('Session setup failed:', err);
            toast({
              title: "Error",
              description: "Failed to validate reset link.",
              variant: "destructive",
            });
            navigate('/auth');
          }
        } else {
          toast({
            title: "Invalid Reset Link",
            description: "This password reset link is invalid or has expired.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('❌ Password update error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated!",
        });
        
        // Redirect to dashboard after successful password reset
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('❌ Unexpected password update error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating your password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">💩 🦛</div>
            <CardTitle className="text-white">Validating Reset Link...</CardTitle>
            <CardDescription className="text-gray-400">
              Please wait while we validate your password reset link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">💩 🦛</div>
          <CardTitle className="text-white">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              onClick={() => navigate('/auth')}
              variant="ghost"
              className="text-gray-400 hover:text-white transition-colors"
              disabled={loading}
              type="button"
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
