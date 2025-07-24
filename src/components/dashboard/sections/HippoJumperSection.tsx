import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useGamePermissions } from "@/hooks/useGamePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HippoJumperGameArea } from "./hippo-jumper/HippoJumperGameArea";
import { HippoJumperStats } from "./hippo-jumper/HippoJumperStats";
import { HippoJumperRecentGames } from "./hippo-jumper/HippoJumperRecentGames";
import { GameDisabledBanner } from "../GameDisabledBanner";

interface HippoJumperSectionProps {
  user: UnifiedUser;
}

export const HippoJumperSection = ({ user }: HippoJumperSectionProps) => {
  const { gameSettings, canPlay, showBanner, isLoading } = useGamePermissions('hippo_jumper');

  if (isLoading) {
    return <div>Loading game settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hippo Jumper</h2>
          <p className="text-muted-foreground">
            Help our hippo jump across platforms and collect points!
          </p>
        </div>
      </div>

      {showBanner && <GameDisabledBanner gameName="Hippo Jumper" />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HippoJumperGameArea 
            user={user} 
            canPlay={canPlay}
            gameSettings={gameSettings}
          />
        </div>
        
        <div className="space-y-4">
          <HippoJumperStats user={user} />
          <HippoJumperRecentGames user={user} />
        </div>
      </div>
    </div>
  );
};