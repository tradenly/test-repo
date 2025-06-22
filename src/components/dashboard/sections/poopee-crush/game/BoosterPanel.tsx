
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameProgress } from "./EnhancedGameEngine";
import { BoosterType } from "./BoosterSystem";
import { usePoopeeCrushCredits } from "../usePoopeeCrushCredits";
import { toast } from "sonner";

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
  const [processingBooster, setProcessingBooster] = useState<BoosterType | null>(null);

  const boosters = [
    {
      type: BoosterType.HAMMER,
      name: "Hammer",
      description: "Remove any tile",
      icon: "🔨",
      cost: 0.5
    },
    {
      type: BoosterType.SHUFFLE,
      name: "Shuffle",
      description: "Shuffle the board",
      icon: "🔀",
      cost: 1
    },
    {
      type: BoosterType.EXTRA_MOVES,
      name: "+5 Moves",
      description: "Add 5 extra moves",
      icon: "⏰",
      cost: 2
    },
    {
      type: BoosterType.HINT,
      name: "Hint",
      description: "Show possible move",
      icon: "💡",
      cost: 0.25
    }
  ];

  const handleBoosterClick = async (type: BoosterType) => {
    if (!gameActive || isSpending || processingBooster) return;
    
    const booster = boosters.find(b => b.type === type);
    if (!booster) return;
    
    // Check if user can afford the booster
    const canAfford = await checkCanAfford(booster.cost);
    if (!canAfford) {
      toast.error(`You need ${booster.cost} credits to use ${booster.name}`);
      return;
    }
    
    setProcessingBooster(type);
    
    try {
      // Handle hammer mode specially - it requires target selection
      if (type === BoosterType.HAMMER) {
        if (hammerMode) {
          // Cancel hammer mode
          onHammerModeChange(false);
          setProcessingBooster(null);
          return;
        } else {
          // Enter hammer mode - wait for tile selection
          onHammerModeChange(true);
          toast.info("Click on a tile to remove it with the hammer");
          setProcessingBooster(null);
          return;
        }
      }
      
      // For other boosters, spend credits first then use the booster
      await spendCredits.mutateAsync({
        amount: booster.cost,
        description: `Used ${booster.name} booster in POOPEE Crush`
      });
      
      // Use the booster
      const success = onUseBooster(type);
      
      if (success) {
        toast.success(`${booster.name} used successfully!`);
      } else {
        toast.error(`Failed to use ${booster.name}`);
        // Note: Credits already spent, but booster failed - could implement refund logic here
      }
    } catch (error) {
      console.error(`Failed to use booster ${type}:`, error);
      toast.error(`Failed to use ${booster.name}`);
    } finally {
      setProcessingBooster(null);
    }
  };

  const getButtonVariant = (type: BoosterType) => {
    if (type === BoosterType.HAMMER && hammerMode) {
      return "default"; // Highlighted when hammer mode is active
    }
    return "outline";
  };

  const getButtonClassName = (type: BoosterType) => {
    let baseClass = "h-auto p-3 flex flex-col items-center space-y-1 border-gray-600";
    
    if (type === BoosterType.HAMMER && hammerMode) {
      baseClass += " bg-yellow-600 hover:bg-yellow-500 border-yellow-400";
    } else {
      baseClass += " hover:bg-gray-800";
    }
    
    return baseClass;
  };

  if (!gameActive) {
    return null;
  }

  return (
    <Card className="bg-gray-900/50 border-gray-600">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">Power-ups</h3>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            Level {gameProgress.currentLevel}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {boosters.map((booster) => (
            <Button
              key={booster.type}
              onClick={() => handleBoosterClick(booster.type)}
              variant={getButtonVariant(booster.type)}
              className={getButtonClassName(booster.type)}
              disabled={!gameActive || isSpending || (processingBooster && processingBooster !== booster.type)}
            >
              <span className="text-2xl">{booster.icon}</span>
              <span className="text-xs font-medium text-white">
                {booster.type === BoosterType.HAMMER && hammerMode ? "Cancel" : booster.name}
              </span>
              <span className="text-xs text-gray-400">{booster.cost} credits</span>
              {processingBooster === booster.type && (
                <span className="text-xs text-yellow-400">Processing...</span>
              )}
            </Button>
          ))}
        </div>
        
        {hammerMode && (
          <div className="mt-3 text-center">
            <span className="text-sm text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded">
              🔨 Hammer Mode: Click a tile to remove it
            </span>
          </div>
        )}
        
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500">
            Power-ups cost credits and provide strategic advantages
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
