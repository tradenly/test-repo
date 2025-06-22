
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HighScoresLeaderboard } from "./HighScoresLeaderboard";
import { MostGamesLeaderboard } from "./MostGamesLeaderboard";
import { LongestSurvivalLeaderboard } from "./LongestSurvivalLeaderboard";
import { RecentChampionsLeaderboard } from "./RecentChampionsLeaderboard";
import { LeaderboardEntry } from "./useLeaderboardData";
import { useIsMobile } from "@/hooks/use-mobile";

interface LeaderboardTabsProps {
  leaderboardData: LeaderboardEntry[] | undefined;
  isLoading: boolean;
  currentUserId: string;
}

export const LeaderboardTabs = ({ leaderboardData, isLoading, currentUserId }: LeaderboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("high-scores");
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading leaderboards...</div>
      </div>
    );
  }

  const TabButton = ({ value, icon, text, tooltip }: { value: string; icon: string; text: string; tooltip: string }) => {
    const tabContent = isMobile ? icon : `${icon} ${text}`;
    
    if (isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <TabsTrigger 
              value={value} 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-lg"
            >
              {tabContent}
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <TabsTrigger 
        value={value} 
        className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
      >
        {tabContent}
      </TabsTrigger>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
        <TabButton 
          value="high-scores" 
          icon="🏆" 
          text="High Scores" 
          tooltip="High Scores"
        />
        <TabButton 
          value="most-games" 
          icon="🎮" 
          text="Most Games" 
          tooltip="Most Games"
        />
        <TabButton 
          value="longest-survival" 
          icon="⏱️" 
          text="Longest Survival" 
          tooltip="Longest Survival"
        />
        <TabButton 
          value="recent-champions" 
          icon="🌟" 
          text="Recent Champions" 
          tooltip="Recent Champions"
        />
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
