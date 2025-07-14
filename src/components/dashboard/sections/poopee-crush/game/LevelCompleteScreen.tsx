
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LevelCompleteScreenProps {
  level: number;
  score: number;
  stars: number;
  onContinue: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const LevelCompleteScreen = ({ 
  level, 
  score, 
  stars, 
  onContinue, 
  onRestart, 
  onQuit 
}: LevelCompleteScreenProps) => {
  const renderStars = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <span 
        key={i} 
        className={`text-3xl ${i < stars ? 'text-yellow-400' : 'text-gray-600'}`}
      >
        ⭐
      </span>
    ));
  };

  const getScoreMessage = () => {
    if (stars === 3) return "Perfect! Outstanding performance!";
    if (stars === 2) return "Great job! Well done!";
    if (stars === 1) return "Good work! You completed the level!";
    return "Level completed!";
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-600 max-w-md w-full mx-4">
        <CardContent className="p-8 text-center space-y-6">
          {/* Enhanced Celebration Header with Clear Level Progression */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-yellow-400">
              🎉 Level {level} Complete! 🎉
            </h2>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3">
              <p className="text-xl font-semibold text-white">
                You just conquered Level {level}!
              </p>
              <p className="text-sm text-gray-200">
                Ready for the next challenge?
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <div className="flex justify-center space-x-1">
              {renderStars()}
            </div>
            <p className="text-green-400 font-semibold">{getScoreMessage()}</p>
          </div>

          {/* Score Display */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="text-2xl font-bold text-white">
              {score.toLocaleString()} points
            </div>
            <div className="text-sm text-gray-400">
              Level {level} Score
            </div>
          </div>

          {/* Enhanced Action Buttons with Clear Next Level Indication */}
          <div className="space-y-3">
            <Button 
              onClick={onContinue} 
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 text-lg"
              size="lg"
            >
              🚀 Continue to Level {level + 1} 🚀
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                onClick={onRestart} 
                variant="outline" 
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Replay Level {level}
              </Button>
              <Button 
                onClick={onQuit} 
                variant="destructive" 
                className="flex-1"
              >
                Quit Game
              </Button>
            </div>
          </div>

          {/* Bonus Message with Level Achievement */}
          {stars === 3 && (
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
              <div className="text-yellow-400 text-sm animate-pulse font-semibold">
                🏆 Perfect Level {level} Clear! Bonus Applied! 🏆
              </div>
            </div>
          )}

          {/* Level Progress Indicator */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
            You've now completed {level} level{level === 1 ? '' : 's'}!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
