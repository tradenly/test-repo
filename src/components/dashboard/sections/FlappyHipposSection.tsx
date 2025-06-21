
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useGameSessions } from "@/hooks/useGameSessions";
import { FlappyHipposStats } from "./flappy-hippos/FlappyHipposStats";
import { FlappyHipposGameArea } from "./flappy-hippos/FlappyHipposGameArea";
import { FlappyHipposRecentGames } from "./flappy-hippos/FlappyHipposRecentGames";
import { useFlappyHipposGameHandlers } from "./flappy-hippos/useFlappyHipposGameHandlers";

interface FlappyHipposSectionProps {
  user: UnifiedUser;
}

export const FlappyHipposSection = ({ user }: FlappyHipposSectionProps) => {
  const { data: credits, isLoading: creditsLoading } = useCredits(user.id);
  const { data: gameSessions } = useGameSessions(user.id);

  const currentBalance = credits?.balance || 0;
  const canPlay = currentBalance >= 1;
  
  // Calculate stats
  const totalGames = gameSessions?.length || 0;
  const highScore = gameSessions?.reduce((max, session) => Math.max(max, session.score), 0) || 0;
  const averageScore = totalGames > 0 ? Math.round(gameSessions?.reduce((sum, session) => sum + session.score, 0)! / totalGames) : 0;

  const { handleGameStart, handleGameEnd } = useFlappyHipposGameHandlers({ user, highScore });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🦛 Flappy Hippos</h1>
        <p className="text-gray-400">
          Navigate your hippo through the pipes and earn credits! Each game costs 1 credit.
        </p>
      </div>

      <FlappyHipposStats 
        currentBalance={currentBalance}
        creditsLoading={creditsLoading}
        highScore={highScore}
        totalGames={totalGames}
        averageScore={averageScore}
      />

      <FlappyHipposGameArea 
        onGameEnd={handleGameEnd}
        onGameStart={handleGameStart}
        canPlay={canPlay}
        credits={currentBalance}
      />

      <FlappyHipposRecentGames gameSessions={gameSessions} />
    </div>
  );
};
