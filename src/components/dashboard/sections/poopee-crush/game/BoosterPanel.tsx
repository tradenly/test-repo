
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shuffle, Lightbulb, Hammer } from "lucide-react";
import { BoosterType } from "./BoosterSystem";
import { GameProgress } from "./EnhancedGameEngine";
import { usePoopeeCrushCredits } from "../usePoopeeCrushCredits";
import { useState } from "react";
import { useCredits } from "@/hooks/useCredits";

interface BoosterPanelProps {
  gameActive: boolean;
  onUseBooster: (type: BoosterType, targetTile?: {row: number, col: number}) => boolean;
  gameProgress: GameProgress;
  userId: string;
  onHammerModeChange: (active: boolean) => void;
  hammerMode: boolean;
}

export const BoosterPanel = ({ 
  gameActive, 
  onUseBooster, 
  gameProgress, 
  userId,
  onHammerModeChange,
  hammerMode 
}: BoosterPanelProps) => {
  const { spendCredits, checkCanAfford, isSpending } = usePoopeeCrushCredits(userId);
  const { data: credits } = useCredits(userId);

  const handleBoosterUse = async (type: BoosterType, cost: number, description: string) => {
    if (!gameActive || isSpending) return;

    try {
      console.log(`🔧 [BoosterPanel] Using ${type} booster`);
      
      // Check affordability first
      const canAfford = await checkCanAfford(cost);
      if (!canAfford) {
        console.log(`❌ [BoosterPanel] Cannot afford ${type} booster (cost: ${cost})`);
        return;
      }
      
      // Special handling for hammer - enter targeting mode
      if (type === BoosterType.HAMMER) {
        onHammerModeChange(true);
        return;
      }

      // For other boosters, spend credits first then use booster
      await spendCredits.mutateAsync({
        amount: cost,
        description: description
      });
      
      // Use the booster
      const success = onUseBooster(type);
      
      if (!success) {
        console.error(`❌ [BoosterPanel] Failed to use ${type} booster`);
      }
    } catch (error) {
      console.error(`💥 [BoosterPanel] Error using ${type} booster:`, error);
    }
  };

  const currentBalance = credits?.balance || 0;

  const boosters = [
    {
      type: BoosterType.SHUFFLE,
      name: "Shuffle",
      description: "Shuffle the board",
      cost: 1,
      icon: Shuffle,
      available: currentBalance >= 1 && gameProgress.moves > 0,
      cooldown: false
    },
    {
      type: BoosterType.HINT,
      name: "Hint",
      description: "Show possible moves",
      cost: 0.5,
      icon: Lightbulb,
      available: currentBalance >= 0.5 && gameProgress.moves > 0,
      cooldown: false
    },
    {
      type: BoosterType.HAMMER,
      name: "Hammer",
      description: "Destroy any tile",
      cost: 0.5,
      icon: Hammer,
      available: currentBalance >= 0.5 && gameProgress.moves > 0,
      cooldown: false
    }
  ];

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Boosters</CardTitle>
        <div className="text-sm text-gray-300">
          Balance: <span className="text-yellow-400 font-semibold">{currentBalance.toFixed(2)}</span> credits
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {boosters.map((booster) => {
          const IconComponent = booster.icon;
          const isHammerActive = booster.type === BoosterType.HAMMER && hammerMode;
          
          return (
            <div key={booster.type} className="space-y-2">
              <Button
                onClick={() => handleBoosterUse(
                  booster.type, 
                  booster.cost, 
                  `Used ${booster.name} booster in POOPEE Crush`
                )}
                disabled={!gameActive || !booster.available || isSpending || booster.cooldown}
                className={`w-full justify-between ${
                  isHammerActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                size="sm"
              >
                <div className="flex items-center flex-1 min-w-0">
                  {isSpending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                  ) : (
                    <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{booster.name}</div>
                    <div className="text-xs opacity-80 truncate">{booster.description}</div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ml-2 flex-shrink-0 ${
                    booster.available ? 'text-yellow-400 border-yellow-400' : 'text-gray-500 border-gray-500'
                  }`}
                >
                  {booster.cost} ⭐
                </Badge>
              </Button>
              
              {isHammerActive && (
                <div className="text-xs text-orange-400 bg-orange-900/20 p-2 rounded border border-orange-700">
                  🎯 Click on any tile to destroy it with the hammer!
                </div>
              )}
              
              {!booster.available && currentBalance < booster.cost && (
                <div className="text-xs text-red-400">
                  Need {(booster.cost - currentBalance).toFixed(2)} more credits
                </div>
              )}
            </div>
          );
        })}
        
        {!gameActive && (
          <div className="text-center text-gray-400 text-sm mt-4">
            Start a game to use boosters
          </div>
        )}
      </CardContent>
    </Card>
  );
};
