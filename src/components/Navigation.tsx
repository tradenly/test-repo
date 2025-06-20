
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { User as UserIcon, LogOut, Wallet } from "lucide-react";
import { useHybridAuth } from "@/hooks/useHybridAuth";
import { useZkLogin } from "@/hooks/useZkLogin";

export const Navigation = () => {
  const { user, zkLoginAddress, isAuthenticated } = useHybridAuth();
  const { logout: zkLogout } = useZkLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await zkLogout();
    navigate('/');
  };

  const isOnDashboard = location.pathname === '/dashboard';

  const getUserDisplayName = () => {
    if (zkLoginAddress) {
      return `${zkLoginAddress.slice(0, 6)}...${zkLoginAddress.slice(-4)}`;
    }
    return user?.email || 'User';
  };

  const getAccountLabel = () => {
    if (zkLoginAddress) {
      return (
        <div className="flex flex-col">
          <span className="text-sm">{user?.email || 'ZK Login User'}</span>
          <span className="text-xs text-gray-400 font-mono">
            SUI: {zkLoginAddress.slice(0, 8)}...{zkLoginAddress.slice(-6)}
          </span>
        </div>
      );
    }
    return user?.email;
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
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-400 hover:text-black text-white border-0"
                >
                  {zkLoginAddress ? (
                    <Wallet className="h-4 w-4 mr-2" />
                  ) : (
                    <UserIcon className="h-4 w-4 mr-2" />
                  )}
                  {getUserDisplayName()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-gray-900 border-gray-700" 
                align="end"
              >
                <DropdownMenuLabel className="text-gray-300">
                  {getAccountLabel()}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                {!isOnDashboard && (
                  <DropdownMenuItem 
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-400 hover:text-black text-white border-0"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
