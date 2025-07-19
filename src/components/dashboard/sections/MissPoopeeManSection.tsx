
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useGameSessions } from "@/hooks/useGameSessions";
import { useGamePermissions } from "@/hooks/useGamePermissions";
import { GameDisabledBanner } from "@/components/dashboard/GameDisabledBanner";
import { MissPoopeeManStats } from "./miss-poopee-man/MissPoopeeManStats";
import { MissPoopeeManGameArea } from "./miss-poopee-man/MissPoopeeManGameArea";
import { MissPoopeeManRecentGames } from "./miss-poopee-man/MissPoopeeManRecentGames";
import { useMissPoopeeManGameHandlers } from "./miss-poopee-man/useMissPoopeeManGameHandlers";

interface MissPoopeeManSectionProps {
  user: UnifiedUser;
}

export const MissPoopeeManSection = ({ user }: MissPoopeeManSectionProps) => {
  const { data: credits, isLoading: creditsLoading } = useCredits(user.id);
  const { data: gameSessions } = useGameSessions(user.id);
  const { gameSettings, canPlay, showBanner, isLoading: permissionsLoading } = useGamePermissions('miss_poopee_man');

  const currentBalance = credits?.balance || 0;
  const entryCost = gameSettings?.entry_cost_credits || 1;
  const canAffordGame = currentBalance >= entryCost;
  const canStartGame = canPlay && canAffordGame;
  
  // Filter game sessions for miss_poopee_man game type
  const missPoopeeManSessions = gameSessions?.filter(session => session.game_type === 'miss_poopee_man') || [];
  
  // Calculate stats
  const totalGames = missPoopeeManSessions.length;
  const highScore = missPoopeeManSessions.reduce((max, session) => Math.max(max, session.score), 0);
  const averageScore = totalGames > 0 ? Math.round(missPoopeeManSessions.reduce((sum, session) => sum + session.score, 0) / totalGames) : 0;

  const { handleGameStart, handleGameEnd } = useMissPoopeeManGameHandlers({ user, highScore });

  if (permissionsLoading) {
    return <div className="text-white">Loading game settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">👻 Miss POOPEE-Man</h1>
        <p className="text-gray-400">
          Navigate through the maze, collect pellets, and avoid the ghosts! Each game costs {entryCost} credit{entryCost !== 1 ? 's' : ''}.
        </p>
      </div>

      {showBanner && <GameDisabledBanner gameName="Miss POOPEE-Man" />}

      <MissPoopeeManStats 
        currentBalance={currentBalance}
        creditsLoading={creditsLoading}
        highScore={highScore}
        totalGames={totalGames}
        averageScore={averageScore}
      />

      <MissPoopeeManGameArea 
        onGameEnd={handleGameEnd}
        onGameStart={handleGameStart}
        canPlay={canStartGame}
        credits={currentBalance}
      />

      <MissPoopeeManRecentGames gameSessions={missPoopeeManSessions} />
    </div>
  );
};
