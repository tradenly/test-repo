
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, Clock, Coins } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useGameSessions, useCreateGameSession } from "@/hooks/useGameSessions";
import { useSpendCredits, useEarnCredits } from "@/hooks/useCreditOperations";
import { GameCanvas } from "@/components/game/GameCanvas";
import { useToast } from "@/hooks/use-toast";

interface FlappyHipposSectionProps {
  user: UnifiedUser;
}

export const FlappyHipposSection = ({ user }: FlappyHipposSectionProps) => {
  const { data: credits, isLoading: creditsLoading } = useCredits(user.id);
  const { data: gameSessions } = useGameSessions(user.id);
  const createGameSession = useCreateGameSession();
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const { toast } = useToast();

  const currentBalance = credits?.balance || 0;
  const canPlay = currentBalance >= 1;
  
  // Calculate stats
  const totalGames = gameSessions?.length || 0;
  const highScore = gameSessions?.reduce((max, session) => Math.max(max, session.score), 0) || 0;

  const handleGameStart = async () => {
    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "Flappy Hippos game play"
      });
      
      toast({
        title: "Game Started!",
        description: "1 credit deducted. Good luck!",
      });
    } catch (error) {
      console.error("Error spending credits:", error);
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGameEnd = async (score: number, pipesPassedCount: number, duration: number) => {
    try {
      // Calculate credits earned based on performance
      let creditsEarned = 0;
      
      // Base rewards
      if (score >= 1) creditsEarned += 0.1; // Basic participation
      if (score >= 5) creditsEarned += 0.2; // Getting started
      if (score >= 10) creditsEarned += 0.5; // Good performance
      if (score >= 25) creditsEarned += 1; // Great performance
      if (score >= 50) creditsEarned += 2; // Excellent performance
      if (score >= 100) creditsEarned += 5; // Master level
      
      // Bonus for new high score
      if (score > highScore) {
        creditsEarned += 1;
      }
      
      // Create game session record
      const gameSession = await createGameSession.mutateAsync({
        user_id: user.id,
        score,
        duration_seconds: duration,
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: pipesPassedCount
      });
      
      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `Flappy Hippos reward - Score: ${score}`,
          gameSessionId: gameSession.id
        });
        
        toast({
          title: "Game Complete!",
          description: `Score: ${score} | Earned: ${creditsEarned.toFixed(1)} credits`,
        });
      } else {
        toast({
          title: "Game Complete!",
          description: `Score: ${score} | Keep practicing to earn credits!`,
        });
      }
    } catch (error) {
      console.error("Error recording game session:", error);
      toast({
        title: "Game Recorded",
        description: `Final Score: ${score}`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🦛 Flappy Hippos</h1>
        <p className="text-gray-400">
          Navigate your hippo through the pipes and earn credits! Each game costs 1 credit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Credit Balance Card */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Your Credits</CardTitle>
            <Coins className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {creditsLoading ? "..." : currentBalance.toFixed(2)}
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
            <div className="text-2xl font-bold text-white">{highScore}</div>
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
            <div className="text-2xl font-bold text-white">{totalGames}</div>
            <p className="text-xs text-gray-400">Total sessions</p>
          </CardContent>
        </Card>

        {/* Average Score Card */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Average Score</CardTitle>
            <Gamepad2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalGames > 0 ? Math.round(gameSessions?.reduce((sum, session) => sum + session.score, 0)! / totalGames) : 0}
            </div>
            <p className="text-xs text-gray-400">Per game</p>
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
          <GameCanvas 
            onGameEnd={handleGameEnd}
            onGameStart={handleGameStart}
            canPlay={canPlay}
            credits={currentBalance}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-900/40 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">How to Play</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Click or press Space to flap</li>
                <li>• Avoid hitting pipes or ground</li>
                <li>• Each pipe passed = 1 point</li>
                <li>• Costs 1 credit per game</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/40 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Credit Rewards</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Score 1+: 0.1 credits</li>
                <li>• Score 10+: 0.5 credits</li>
                <li>• Score 25+: 1 credit</li>
                <li>• New high score: +1 credit bonus</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      {gameSessions && gameSessions.length > 0 && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex justify-between items-center bg-gray-900/40 rounded p-3">
                  <div className="flex items-center gap-4">
                    <div className="text-white font-medium">Score: {session.score}</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-green-400 text-sm">
                    +{session.credits_earned.toFixed(1)} credits
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
