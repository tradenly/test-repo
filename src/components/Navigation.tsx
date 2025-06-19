
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate('/')}
        >
          💩 POOPEE 🦛
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Dashboard
              </Button>
              <span className="text-gray-300">Welcome, {user.email}</span>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
