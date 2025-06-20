
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Clock, Coins } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";

interface FlappyHipposSectionProps {
  user: UnifiedUser;
}

export const FlappyHipposSection = ({ user }: FlappyHipposSectionProps) => {
  const { data: credits, isLoading: creditsLoading } = useCredits(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🦛 Flappy Hippos</h1>
        <p className="text-gray-400">
          Play our addictive side-scrolling game and earn rewards! Use credits to play and compete for high scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Credit Balance Card */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Your Credits</CardTitle>
            <Coins className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {creditsLoading ? "..." : (credits?.balance?.toFixed(2) || "0.00")}
            </div>
            <p className="text-xs text-gray-400">Available to play</p>
          </CardContent>
        </Card>

        {/* High Score Card */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">High Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">Personal best</p>
          </CardContent>
        </Card>

        {/* Games Played Card */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Games Played</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">Total sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Game Arena
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900/60 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🦛</div>
            <h3 className="text-xl font-bold text-white mb-2">Game Coming Soon!</h3>
            <p className="text-gray-400 mb-6">
              Get ready for an epic side-scrolling adventure with our adorable hippos. 
              Earn credits by achieving high scores and completing challenges!
            </p>
            <Button disabled className="bg-gray-600 text-gray-400 cursor-not-allowed">
              Play Game (Coming Soon)
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/40 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">How to Play</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Spend credits to start a game</li>
                <li>• Navigate through obstacles</li>
                <li>• Earn points for distance traveled</li>
                <li>• Get bonus credits for high scores</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Rewards</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Credits for completing games</li>
                <li>• Bonus rewards for milestones</li>
                <li>• Leaderboard competitions</li>
                <li>• Special achievement badges</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
