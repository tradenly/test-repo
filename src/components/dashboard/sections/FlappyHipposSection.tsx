
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useGameSessions } from "@/hooks/useGameSessions";
import { useGamePermissions } from "@/hooks/useGamePermissions";
import { GameDisabledBanner } from "@/components/dashboard/GameDisabledBanner";
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
  const { gameSettings, canPlay, showBanner, isLoading: permissionsLoading } = useGamePermissions('flappy_hippos');

  const currentBalance = credits?.balance || 0;
  const entryCost = gameSettings?.entry_cost_credits || 1;
  const canAffordGame = currentBalance >= entryCost;
  const canStartGame = canPlay && canAffordGame;
  
  // Calculate stats
  const totalGames = gameSessions?.length || 0;
  const highScore = gameSessions?.reduce((max, session) => Math.max(max, session.score), 0) || 0;
  const averageScore = totalGames > 0 ? Math.round(gameSessions?.reduce((sum, session) => sum + session.score, 0)! / totalGames) : 0;

  const { handleGameStart, handleGameEnd } = useFlappyHipposGameHandlers({ user, highScore });

  if (permissionsLoading) {
    return <div className="text-white">Loading game settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🦛 Flappy Hippos</h1>
        <p className="text-gray-400">
          Navigate your hippo through the pipes and earn credits! Each game costs {entryCost} credit{entryCost !== 1 ? 's' : ''}.
        </p>
      </div>

      {showBanner && <GameDisabledBanner gameName="Flappy Hippos" />}

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
        canPlay={canStartGame}
        credits={currentBalance}
        gameSettings={gameSettings}
      />

      <FlappyHipposRecentGames gameSessions={gameSessions} />
    </div>
  );
};
