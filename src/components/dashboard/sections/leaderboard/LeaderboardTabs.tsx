
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HighScoresLeaderboard } from "./HighScoresLeaderboard";
import { MostGamesLeaderboard } from "./MostGamesLeaderboard";
import { LongestSurvivalLeaderboard } from "./LongestSurvivalLeaderboard";
import { RecentChampionsLeaderboard } from "./RecentChampionsLeaderboard";
import { LeaderboardEntry } from "./useLeaderboardData";

interface LeaderboardTabsProps {
  leaderboardData: LeaderboardEntry[] | undefined;
  isLoading: boolean;
  currentUserId: string;
}

export const LeaderboardTabs = ({ leaderboardData, isLoading, currentUserId }: LeaderboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("high-scores");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading leaderboards...</div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
        <TabsTrigger 
          value="high-scores" 
          className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
        >
          🏆 High Scores
        </TabsTrigger>
        <TabsTrigger 
          value="most-games" 
          className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
        >
          🎮 Most Games
        </TabsTrigger>
        <TabsTrigger 
          value="longest-survival" 
          className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
        >
          ⏱️ Longest Survival
        </TabsTrigger>
        <TabsTrigger 
          value="recent-champions" 
          className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
        >
          🌟 Recent Champions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="high-scores" className="mt-6">
        <HighScoresLeaderboard 
          data={leaderboardData} 
          currentUserId={currentUserId} 
        />
      </TabsContent>

      <TabsContent value="most-games" className="mt-6">
        <MostGamesLeaderboard 
          data={leaderboardData} 
          currentUserId={currentUserId} 
        />
      </TabsContent>

      <TabsContent value="longest-survival" className="mt-6">
        <LongestSurvivalLeaderboard 
          data={leaderboardData} 
          currentUserId={currentUserId} 
        />
      </TabsContent>

      <TabsContent value="recent-champions" className="mt-6">
        <RecentChampionsLeaderboard 
          data={leaderboardData} 
          currentUserId={currentUserId} 
        />
      </TabsContent>
    </Tabs>
  );
};
