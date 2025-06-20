
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
import { User as UserIcon, LogOut, Coins } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";

export const Navigation = () => {
  const { user, logout } = useUnifiedAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: credits } = useCredits(user?.id || "");

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const isOnDashboard = location.pathname === '/dashboard';

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email;
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
          {user && (
            <>
              {/* Credit Balance Display */}
              <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-white font-medium">
                  {credits?.balance || "0.00"}
                </span>
                <span className="text-gray-400 text-sm">Credits</span>
              </div>
              
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
            </>
          )}
          
          {!user && (
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
