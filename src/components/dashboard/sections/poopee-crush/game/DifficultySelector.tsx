
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

export type DifficultyLevel = 'easy' | 'medium' | 'advanced';

interface DifficultySelectorProps {
  difficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  disabled?: boolean;
}

export const DifficultySelector = ({ 
  difficulty, 
  onDifficultyChange, 
  disabled = false 
}: DifficultySelectorProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Gauge className="h-5 w-5 text-purple-400" />
          Difficulty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={difficulty} onValueChange={onDifficultyChange} disabled={disabled}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 z-50">
            <SelectItem value="easy" className="text-white hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="font-medium text-green-400">Easy</span>
                <span className="text-xs text-gray-400">Standard targets, more moves</span>
              </div>
            </SelectItem>
            <SelectItem value="medium" className="text-white hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="font-medium text-yellow-400">Medium</span>
                <span className="text-xs text-gray-400">1.5x targets, fewer moves</span>
              </div>
            </SelectItem>
            <SelectItem value="advanced" className="text-white hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="font-medium text-red-400">Advanced</span>
                <span className="text-xs text-gray-400">2x targets, challenging</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
