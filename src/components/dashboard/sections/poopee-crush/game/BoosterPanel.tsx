
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameProgress } from "./EnhancedGameEngine";
import { BoosterType } from "./BoosterSystem";

interface BoosterPanelProps {
  gameActive: boolean;
  onUseBooster: (type: BoosterType, targetTile?: {row: number, col: number}) => boolean;
  gameProgress: GameProgress;
}

export const BoosterPanel = ({ gameActive, onUseBooster, gameProgress }: BoosterPanelProps) => {
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

  const handleBoosterClick = (type: BoosterType) => {
    if (!gameActive) return;
    
    const success = onUseBooster(type);
    if (!success) {
      console.log(`Failed to use booster: ${type}`);
    }
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
              variant="outline"
              className="h-auto p-3 flex flex-col items-center space-y-1 hover:bg-gray-800 border-gray-600"
              disabled={!gameActive}
            >
              <span className="text-2xl">{booster.icon}</span>
              <span className="text-xs font-medium text-white">{booster.name}</span>
              <span className="text-xs text-gray-400">{booster.cost} credits</span>
            </Button>
          ))}
        </div>
        
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500">
            Power-ups provide helpful assistance but won't instantly win levels
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
