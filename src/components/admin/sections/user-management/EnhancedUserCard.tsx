
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Ban, ChevronDown, ChevronRight, AlertTriangle, Wallet, MessageSquare } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EnhancedUserCardProps {
  user: any;
  currentUserId?: string;
  onMakeAdmin: () => void;
  onRemoveAdmin: () => void;
  onBanUser: () => void;
  onUnbanUser: () => void;
  isProcessing: boolean;
}

export const EnhancedUserCard = ({
  user,
  currentUserId,
  onMakeAdmin,
  onRemoveAdmin,
  onBanUser,
  onUnbanUser,
  isProcessing
}: EnhancedUserCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isAdmin = user.user_roles?.some((role: any) => role.role === 'admin');
  const credits = user.user_credits?.[0]?.balance || 0;
  const isBanned = !!user.ban_info;
  const isCurrentUser = user.id === currentUserId;
  
  return (
    <div className={`p-4 rounded-lg ${
      isBanned 
        ? 'bg-red-900/20 border-2 border-red-600/50' 
        : 'bg-gray-900/50 border border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-medium">
              {user.full_name || user.username || 'Unnamed User'}
            </h3>
            {isAdmin && <Crown className="h-4 w-4 text-yellow-400" />}
            {isBanned && <AlertTriangle className="h-4 w-4 text-red-400" />}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="text-gray-300">
              @{user.username || 'no-username'}
            </Badge>
            <Badge variant="outline" className="text-yellow-400">
              {Number(credits).toFixed(2)} credits
            </Badge>
            {user.social_accounts?.length > 0 && (
              <Badge variant="outline" className="text-blue-400">
                <MessageSquare className="h-3 w-3 mr-1" />
                {user.social_accounts.length} social
              </Badge>
            )}
            {user.wallets?.length > 0 && (
              <Badge variant="outline" className="text-green-400">
                <Wallet className="h-3 w-3 mr-1" />
                {user.wallets.length} wallets
              </Badge>
            )}
          </div>
          
          <p className="text-gray-400 text-xs">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </p>
          
          {isBanned && (
            <div className="mt-2 p-2 bg-red-900/30 rounded text-red-300 text-sm">
              <strong>Banned:</strong> {user.ban_info.reason}
              <br />
              <span className="text-xs">
                Since: {new Date(user.ban_info.banned_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Details
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          
          {!isBanned ? (
            <>
              {isAdmin ? (
                <Button
                  onClick={onRemoveAdmin}
                  variant="outline"
                  size="sm"
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                  disabled={isProcessing || isCurrentUser}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Remove Admin
                </Button>
              ) : (
                <Button
                  onClick={onMakeAdmin}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={isProcessing}
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Make Admin
                </Button>
              )}
              
              <Button
                onClick={onBanUser}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-400 hover:bg-red-600/20"
                disabled={isProcessing || isCurrentUser}
              >
                <Ban className="h-4 w-4 mr-1" />
                Ban User
              </Button>
            </>
          ) : (
            <Button
              onClick={onUnbanUser}
              variant="outline"
              size="sm"
              className="border-green-600 text-green-400 hover:bg-green-600/20"
              disabled={isProcessing}
            >
              <Shield className="h-4 w-4 mr-1" />
              Unban User
            </Button>
          )}
        </div>
      </div>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent className="mt-4 space-y-4">
          {/* Social Accounts Section */}
          {user.social_accounts?.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Connected Social Accounts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {user.social_accounts.map((social: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-800/50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {social.platform}
                      </Badge>
                      {social.verified && (
                        <Badge variant="outline" className="text-green-400 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-300 mt-1">@{social.username}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallets Section */}
          {user.wallets?.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connected Wallets
              </h4>
              <div className="space-y-2">
                {user.wallets.map((wallet: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-800/50 rounded text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="capitalize">
                        {wallet.blockchain}
                      </Badge>
                      {wallet.is_primary && (
                        <Badge variant="outline" className="text-blue-400 text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-300">
                      {wallet.wallet_name && (
                        <span className="font-medium">{wallet.wallet_name}: </span>
                      )}
                      <code className="text-xs bg-gray-700 px-1 py-0.5 rounded">
                        {wallet.wallet_address}
                      </code>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {user.social_accounts?.length === 0 && user.wallets?.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No additional account information available</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
