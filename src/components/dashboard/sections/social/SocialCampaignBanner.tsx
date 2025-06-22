
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Gift, Coins } from "lucide-react";

export const SocialCampaignBanner = () => {
  return (
    <Alert className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600/30 mb-6">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-gray-300">
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            <p className="font-medium text-white mb-2">
              🎯 Why Link Your Social Accounts? (Future Rewards Await!)
            </p>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <Gift className="h-3 w-3 text-purple-400" />
                <span>Participate in <strong>exclusive social campaigns</strong> and challenges</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="h-3 w-3 text-yellow-400" />
                <span>Earn <strong>NFTs, meme tokens, and crypto rewards</strong> for sharing content</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs">🤷‍♂️</span>
                <span className="text-gray-400 text-xs">
                  <em>Or maybe we're just collecting your data for our secret hippo army. You'll never know! 🦛</em>
                </span>
              </div>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
