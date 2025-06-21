
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useLeaderboardData } from "./leaderboard/useLeaderboardData";
import { LeaderboardTabs } from "./leaderboard/LeaderboardTabs";

interface LeaderboardSectionProps {
  user: UnifiedUser;
}

export const LeaderboardSection = ({ user }: LeaderboardSectionProps) => {
  const { data: leaderboardData, isLoading } = useLeaderboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-400">
          See how you stack up against other Flappy Hippos players!
        </p>
      </div>

      <LeaderboardTabs 
        leaderboardData={leaderboardData} 
        isLoading={isLoading} 
        currentUserId={user.id}
      />
    </div>
  );
};
