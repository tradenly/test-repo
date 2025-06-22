
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
import { User as UserIcon, LogOut, Coins, Settings, Loader2 } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const Navigation = () => {
  const { user, logout } = useUnifiedAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: credits, isLoading: creditsLoading, refetch: refetchCredits } = useCredits(user?.id || "");
  const { isAdmin, isLoading: adminLoading } = useAdminAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  console.log('🧭 Navigation: isAdmin:', isAdmin, 'adminLoading:', adminLoading);

  // Refetch credits periodically to ensure real-time updates
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        refetchCredits();
      }, 5000); // Refetch every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user?.id, refetchCredits]);

  // Listen for credit updates from other parts of the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // Refetch when tab becomes visible again
        refetchCredits();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, refetchCredits]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const isOnDashboard = location.pathname === '/dashboard';
  const isOnAdmin = location.pathname === '/admin';

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email;
    }
    return 'User';
  };

  const formatCredits = (balance?: number) => {
    if (balance === undefined || balance === null) return "0.00";
    return balance.toFixed(2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className={`font-bold cursor-pointer text-white ${
            isMobile ? "text-lg" : "text-2xl"
          }`}
          onClick={() => navigate('/')}
        >
          💩 POOPEE
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {user && (
            <>
              {/* Credit Balance Display with Real-time Updates */}
              <div className={`flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2 ${
                isMobile ? "px-2 py-1" : ""
              } transition-all duration-200 ${creditsLoading ? 'animate-pulse' : ''}`}>
                {creditsLoading ? (
                  <Loader2 className={`text-yellow-400 animate-spin ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                ) : (
                  <Coins className={`text-yellow-400 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                )}
                <span className={`text-white font-medium ${
                  isMobile ? "text-sm" : ""
                } transition-all duration-200`}>
                  {formatCredits(credits?.balance)}
                </span>
                {!isMobile && (
                  <span className="text-gray-400 text-sm">Credits</span>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className={`bg-blue-600 hover:bg-blue-400 hover:text-black text-white border-0 ${
                      isMobile ? "h-9 px-3 text-sm" : ""
                    }`}
                  >
                    <UserIcon className={`mr-2 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                    {isMobile ? "Menu" : "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 bg-gray-900 border-gray-700 z-50" 
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="text-gray-300">
                    {isMobile ? getUserDisplayName().split('@')[0] : getUserDisplayName()}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  
                  {/* Credit Balance in Dropdown */}
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800" disabled>
                    <Coins className="h-4 w-4 mr-2 text-yellow-400" />
                    <span className="flex-1">Credits: </span>
                    <span className="text-yellow-400 font-semibold">
                      {formatCredits(credits?.balance)}
                    </span>
                  </DropdownMenuItem>
                  
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
                  
                  {/* Show admin option if user is confirmed admin */}
                  {isAdmin && !isOnAdmin && (
                    <DropdownMenuItem 
                      onClick={() => {
                        console.log('🎯 Navigation: Admin panel clicked, isAdmin:', isAdmin, 'navigating to /admin');
                        navigate('/admin');
                      }}
                      className="text-yellow-300 hover:bg-gray-800 hover:text-yellow-100 cursor-pointer"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
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
              className={`bg-blue-600 hover:bg-blue-400 hover:text-black text-white border-0 ${
                isMobile ? "h-9 px-3 text-sm" : ""
              }`}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
