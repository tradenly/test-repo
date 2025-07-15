import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useGameSessions } from "@/hooks/useGameSessions";
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

  const currentBalance = credits?.balance || 0;
  const canPlay = currentBalance >= 1;
  
  // Filter game sessions for miss_poopee_man game type
  const missPoopeeManSessions = gameSessions?.filter(session => session.game_type === 'miss_poopee_man') || [];
  
  // Calculate stats
  const totalGames = missPoopeeManSessions.length;
  const highScore = missPoopeeManSessions.reduce((max, session) => Math.max(max, session.score), 0);
  const averageScore = totalGames > 0 ? Math.round(missPoopeeManSessions.reduce((sum, session) => sum + session.score, 0) / totalGames) : 0;

  const { handleGameStart, handleGameEnd } = useMissPoopeeManGameHandlers({ user, highScore });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">👻 Miss POOPEE-Man</h1>
        <p className="text-gray-400">
          Navigate through the maze, collect pellets, and avoid the ghosts! Each game costs 1 credit.
        </p>
      </div>

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
        canPlay={canPlay}
        credits={currentBalance}
      />

      <MissPoopeeManRecentGames gameSessions={missPoopeeManSessions} />
    </div>
  );
};