import { useState } from "react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HippoKongGameArea } from "./hippo-kong/HippoKongGameArea";
import { HippoKongStats } from "./hippo-kong/HippoKongStats";
import { HippoKongRecentGames } from "./hippo-kong/HippoKongRecentGames";
import { GameDisabledBanner } from "../GameDisabledBanner";
import { useGamePermissions } from "@/hooks/useGamePermissions";

interface HippoKongSectionProps {
  user: UnifiedUser;
}

export const HippoKongSection = ({ user }: HippoKongSectionProps) => {
  const { gameSettings, canPlay, showBanner, isLoading } = useGamePermissions('hippo_kong');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">🏔️ Hippo Kong</h1>
          <p className="text-muted-foreground">Loading game settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">🏔️ Hippo Kong</h1>
        <p className="text-muted-foreground">
          Help the gorilla climb to the top while dodging falling barrels!
        </p>
      </div>

      {showBanner && <GameDisabledBanner gameName="Hippo Kong" />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HippoKongGameArea 
            user={user} 
            canPlay={canPlay} 
            gameSettings={gameSettings}
          />
        </div>
        
        <div className="space-y-4">
          <HippoKongStats user={user} />
          <HippoKongRecentGames user={user} />
        </div>
      </div>
    </div>
  );
};