
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { 
  sanitizeEmail, 
  sanitizeUsername, 
  sanitizeName, 
  validatePassword, 
  checkRateLimit 
} from "@/utils/inputSanitizer";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        logger.log('🔐 User already authenticated, redirecting to dashboard');
        navigate('/');
      }
    });

    // Listen for OAuth redirect and other auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log(`🔐 Auth state change: ${event}, session exists: ${!!session}`);
      
      if (event === 'SIGNED_IN' && session) {
        logger.log('✅ User signed in successfully');
        
        // Process referral if there's a referral code and this is a new signup
        if (referralCode && event === 'SIGNED_IN') {
          try {
            logger.log('Processing referral for code:', referralCode);
            const { data, error } = await supabase.rpc('process_referral_signup', {
              new_user_id: session.user.id,
              referral_code_param: referralCode
            });
            
            if (data && !error) {
              toast({
                title: "Welcome! 🎉",
                description: "Successfully signed up with referral! Your referrer has received 5 credits.",
              });
            } else if (error) {
              logger.log('Referral processing error:', error);
            }
          } catch (err) {
            logger.log('Referral processing failed:', err);
          }
        } else {
          toast({
            title: "Welcome!",
            description: "Successfully signed in!",
          });
        }
        
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        logger.log('👋 User signed out');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, referralCode]);

  // Show referral info if there's a referral code
  useEffect(() => {
    if (referralCode && !isSignUp) {
      setIsSignUp(true);
      toast({
        title: "Referral Link Detected! 🎁",
        description: "Sign up now to activate your friend's referral bonus!",
      });
    }
  }, [referralCode, isSignUp, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Rate limiting check
    const clientId = `signup_${email}`;
    if (!checkRateLimit(clientId, 3, 15 * 60 * 1000)) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait 15 minutes before trying again",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Input sanitization and validation
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedUsername = sanitizeUsername(username);
    const sanitizedFullName = sanitizeName(fullName);
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.errors.join(', '),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: sanitizedUsername,
            full_name: sanitizedFullName,
            referral_code: referralCode, // Store referral code in user metadata
          }
        }
      });

      if (error) {
        logger.error('❌ Sign up error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: referralCode ? 
            "Check your email for verification link! Your referral will be processed after verification." :
            "Check your email for verification link!",
        });
      }
    } catch (err) {
      logger.error('❌ Unexpected sign up error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Rate limiting check
    const clientId = `signin_${email}`;
    if (!checkRateLimit(clientId, 5, 15 * 60 * 1000)) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait 15 minutes before trying again",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Input sanitization
    const sanitizedEmail = sanitizeEmail(email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        logger.error('❌ Sign in error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      logger.error('❌ Unexpected sign in error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Rate limiting check
    const clientId = `forgot_${email}`;
    if (!checkRateLimit(clientId, 3, 15 * 60 * 1000)) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait 15 minutes before trying again",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Input sanitization
    const sanitizedEmail = sanitizeEmail(email);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        logger.error('❌ Password reset error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Sent",
          description: "Check your email for a password reset link!",
        });
        setShowForgotPassword(false);
      }
    } catch (err) {
      logger.error('❌ Unexpected password reset error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending password reset",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    logger.log('🚀 Starting Google OAuth flow');
    setGoogleLoading(true);

    try {
      const redirectUrl = referralCode ? 
        `${window.location.origin}/?ref=${referralCode}` : 
        `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        }
      });

      if (error) {
        logger.error('❌ Google OAuth error:', error);
        toast({
          title: "Google Sign In Error",
          description: error.message || "Failed to sign in with Google. Please check your Google OAuth configuration.",
          variant: "destructive",
        });
        setGoogleLoading(false);
      } else {
        logger.log('✅ Google OAuth initiated successfully');
        // Don't set loading to false here as user will be redirected
      }
    } catch (err) {
      logger.error('❌ Unexpected Google OAuth error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during Google sign in",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">💩 🦛</div>
          <CardTitle className="text-white">
            {showForgotPassword ? "Reset Password" : 
             isSignUp ? "Join the Fattys" : "Welcome Back"}
            {referralCode && !showForgotPassword && <span className="text-purple-400"> (Referred)</span>}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {showForgotPassword ? "Enter your email to receive a password reset link" :
             isSignUp ? 
              (referralCode ? 
                "Create your account to activate your friend's referral bonus!" : 
                "Create your account to enter the toiletverse") : 
              "Sign in to your account"}
          </CardDescription>
          {referralCode && !showForgotPassword && (
            <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
              <p className="text-sm text-purple-300">
                🎁 Referral Code: <span className="font-mono">{referralCode}</span>
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            // Forgot Password Form
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  disabled={loading}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Google OAuth Button */}
              <div className="mb-6">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 transition-colors"
                  type="button"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {googleLoading ? "Signing in with Google..." : "Continue with Google"}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-800 px-2 text-gray-400">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                {isSignUp && (
                  <>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </>
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
                  disabled={loading || googleLoading}
                >
                  {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
                </Button>
              </form>
              
              {/* Forgot Password Link - Only show for sign in */}
              {!isSignUp && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    disabled={loading || googleLoading}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  disabled={loading || googleLoading}
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loading || googleLoading}
                  type="button"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
