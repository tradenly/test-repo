
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_BOOSTERS, BoosterType } from "./BoosterSystem";
import { GameProgress } from "./EnhancedGameEngine";

interface BoosterPanelProps {
  gameActive: boolean;
  onUseBooster: (type: BoosterType, targetTile?: {row: number, col: number}) => boolean;
  gameProgress: GameProgress;
}

export const BoosterPanel = ({ gameActive, onUseBooster, gameProgress }: BoosterPanelProps) => {
  const availableBoosters = [
    BoosterType.HINT,
    BoosterType.HAMMER,
    BoosterType.SHUFFLE,
    BoosterType.EXTRA_MOVES
  ];

  const handleBoosterClick = (type: BoosterType) => {
    if (!gameActive) return;
    
    const success = onUseBooster(type);
    if (!success) {
      console.log(`❌ Failed to use booster: ${type}`);
    }
  };

  const getBoosterStatus = (type: BoosterType) => {
    const booster = AVAILABLE_BOOSTERS[type];
    // For demo purposes, we'll show all boosters as available
    // In a real game, this would check against player's credits/inventory
    return {
      available: true,
      remaining: booster.usageLimit || Infinity
    };
  };

  return (
    <Card className="bg-gray-900/50 border-gray-600">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Power-ups</h3>
          <div className="text-sm text-gray-400">
            Use wisely! 🎯
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableBoosters.map((boosterType) => {
            const booster = AVAILABLE_BOOSTERS[boosterType];
            const status = getBoosterStatus(boosterType);
            
            return (
              <div key={boosterType} className="space-y-2">
                <Button
                  onClick={() => handleBoosterClick(boosterType)}
                  disabled={!gameActive || !status.available}
                  className={`w-full h-16 flex flex-col items-center justify-center space-y-1 ${
                    status.available && gameActive
                      ? 'bg-purple-600 hover:bg-purple-700 border-purple-500'
                      : 'bg-gray-700 border-gray-600 cursor-not-allowed'
                  }`}
                  variant="outline"
                >
                  <span className="text-lg">{booster.icon}</span>
                  <span className="text-xs font-medium">{booster.name}</span>
                </Button>
                
                <div className="text-center space-y-1">
                  <div className="text-xs text-gray-400">
                    {booster.description}
                  </div>
                  
                  {booster.usageLimit && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-gray-700 text-gray-300"
                    >
                      {status.remaining} left
                    </Badge>
                  )}
                  
                  <div className="text-xs text-yellow-400">
                    {booster.cost} credits
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Booster Tips */}
        <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">💡 Booster Tips</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Use <strong>Hint</strong> when you can't find moves</p>
            <p>• <strong>Hammer</strong> removes single troublesome tiles</p>
            <p>• <strong>Shuffle</strong> when board has no valid moves</p>
            <p>• <strong>Extra Moves</strong> when you're close to winning</p>
          </div>
        </div>

        {/* Game Status */}
        <div className="mt-3 flex justify-between items-center text-sm">
          <div className="text-gray-400">
            Level {gameProgress.currentLevel} • {gameProgress.moves} moves left
          </div>
          <div className="text-yellow-400 font-semibold">
            {gameProgress.score.toLocaleString()} pts
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
