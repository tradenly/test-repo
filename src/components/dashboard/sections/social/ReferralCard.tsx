
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Coins, Share2, ExternalLink } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useReferralData } from "@/hooks/useReferralData";

interface ReferralCardProps {
  user: UnifiedUser;
}

export const ReferralCard = ({ user }: ReferralCardProps) => {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const { referral, referralStats, isLoadingReferral, isLoadingStats } = useReferralData(user.id);

  const getReferralLink = () => {
    if (!referral) return "";
    return `${window.location.origin}/?ref=${referral.referral_code}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    const referralLink = getReferralLink();
    const message = `🦛💩 Join me in the POOPEE toiletverse! Play games, earn credits, and collect NFTs! Use my referral link: ${referralLink}`;
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`;
        break;
      case "instagram":
        // Instagram doesn't support direct URL sharing, so we'll copy the message
        copyToClipboard(`${message}\n\n${referralLink}`);
        toast({
          title: "Ready for Instagram!",
          description: "Message and link copied. Paste in your Instagram story or bio!",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (isLoadingReferral) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-600/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Share2 className="h-5 w-5 text-purple-400" />
          Share Your Referral Link
        </CardTitle>
        <CardDescription className="text-gray-300">
          Invite friends and earn 5 credits for each successful signup!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Link Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Your Unique Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={getReferralLink()}
              readOnly
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button
              onClick={() => copyToClipboard(getReferralLink())}
              variant="secondary"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {copiedLink ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {referral && (
            <p className="text-xs text-gray-400">
              Referral Code: <span className="font-mono text-purple-400">{referral.referral_code}</span>
            </p>
          )}
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Share on Social Media</label>
          <div className="flex gap-3">
            <Button
              onClick={() => shareOnSocial("twitter")}
              variant="outline"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 border-blue-600 text-white"
            >
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter/X
            </Button>
            <Button
              onClick={() => shareOnSocial("facebook")}
              variant="outline"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 border-blue-700 text-white"
            >
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
            <Button
              onClick={() => shareOnSocial("instagram")}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-purple-600 text-white"
            >
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </Button>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Your Referral Stats</label>
          {isLoadingStats ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Successful Referrals</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {referralStats?.totalReferrals || 0}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">Credits Earned</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {referralStats?.totalCreditsEarned || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Referrals */}
        {referralStats?.recentReferrals && referralStats.recentReferrals.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Recent Referrals</label>
            <div className="space-y-2">
              {referralStats.recentReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between bg-gray-800/30 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      +{referral.credits_awarded} credits
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {referral.referral_code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <p className="text-sm text-blue-200">
            <strong>How it works:</strong> Share your unique link with friends. When they sign up using your link, 
            you'll automatically receive 5 credits! There's no limit to how many friends you can refer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
