
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useGameSessions } from "@/hooks/useGameSessions";
import { useGamePermissions } from "@/hooks/useGamePermissions";
import { GameDisabledBanner } from "@/components/dashboard/GameDisabledBanner";
import { PoopeeCrushStats } from "./poopee-crush/PoopeeCrushStats";
import { PoopeeCrushGameArea } from "./poopee-crush/PoopeeCrushGameArea";
import { PoopeeCrushRecentGames } from "./poopee-crush/PoopeeCrushRecentGames";
import { usePoopeeCrushGameHandlers } from "./poopee-crush/usePoopeeCrushGameHandlers";

interface PoopeeCrushSectionProps {
  user: UnifiedUser;
}

export const PoopeeCrushSection = ({ user }: PoopeeCrushSectionProps) => {
  const { data: credits, isLoading: creditsLoading } = useCredits(user.id);
  const { data: gameSessions } = useGameSessions(user.id);
  const { gameSettings, canPlay, showBanner, isLoading: permissionsLoading } = useGamePermissions('poopee_crush');

  const currentBalance = credits?.balance || 0;
  const entryCost = gameSettings?.entry_cost_credits || 1;
  const canAffordGame = currentBalance >= entryCost;
  const canStartGame = canPlay && canAffordGame;
  
  // Filter for POOPEE Crush sessions and calculate stats
  const poopeeCrushSessions = gameSessions?.filter(session => 
    session.game_type === 'poopee_crush' || session.metadata?.game_type === 'poopee_crush'
  ) || [];
  
  const totalGames = poopeeCrushSessions.length;
  const highScore = poopeeCrushSessions.reduce((max, session) => Math.max(max, session.score), 0);
  const averageScore = totalGames > 0 ? Math.round(poopeeCrushSessions.reduce((sum, session) => sum + session.score, 0) / totalGames) : 0;

  const { handleGameStart, handleGameEnd } = usePoopeeCrushGameHandlers({ user, highScore });

  if (permissionsLoading) {
    return <div className="text-white">Loading game settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">💩 POOPEE Crush</h1>
        <p className="text-gray-400">
          Match 3 or more POOPEE tiles to clear them and earn points! Each game costs {entryCost} credit{entryCost !== 1 ? 's' : ''}.
        </p>
      </div>

      {showBanner && <GameDisabledBanner gameName="POOPEE Crush" />}

      <PoopeeCrushStats 
        currentBalance={currentBalance}
        creditsLoading={creditsLoading}
        highScore={highScore}
        totalGames={totalGames}
        averageScore={averageScore}
      />

      <PoopeeCrushGameArea 
        onGameEnd={handleGameEnd}
        onGameStart={handleGameStart}
        canPlay={canStartGame}
        credits={currentBalance}
        userId={user.id}
      />

      <PoopeeCrushRecentGames gameSessions={poopeeCrushSessions} />
    </div>
  );
};
