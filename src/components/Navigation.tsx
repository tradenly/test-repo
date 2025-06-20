
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { User as UserIcon, LogOut } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const Navigation = () => {
  const { user, logout } = useUnifiedAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const isOnDashboard = location.pathname === '/dashboard';

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email;
    }
    if (user?.walletAddress) {
      return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;
    }
    return 'User';
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-400 hover:text-black text-white border-0"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-gray-900 border-gray-700" 
                align="end"
              >
                <DropdownMenuLabel className="text-gray-300">
                  {getUserDisplayName()}
                  {user.authType === 'zklogin' && (
                    <div className="text-xs text-blue-400">ZK Login</div>
                  )}
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
