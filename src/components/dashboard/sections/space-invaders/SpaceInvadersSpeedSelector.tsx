import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export type SpeedLevel = 'novice' | 'intermediate' | 'advanced';

interface SpeedSelectorProps {
  speed: SpeedLevel;
  onSpeedChange: (speed: SpeedLevel) => void;
  disabled?: boolean;
}

export const SpaceInvadersSpeedSelector = ({ 
  speed, 
  onSpeedChange, 
  disabled = false 
}: SpeedSelectorProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-400" />
          Speed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={speed} onValueChange={onSpeedChange} disabled={disabled}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 z-50">
            <SelectItem value="novice" className="text-white hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="font-medium text-green-400">Novice</span>
                <span className="text-xs text-gray-400">Slower aliens, more time to react</span>
              </div>
            </SelectItem>
            <SelectItem value="intermediate" className="text-white hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="font-medium text-yellow-400">Intermediate</span>
                <span className="text-xs text-gray-400">Standard speed</span>
              </div>
            </SelectItem>
            <SelectItem value="advanced" className="text-white hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="font-medium text-red-400">Advanced</span>
                <span className="text-xs text-gray-400">Fast aliens, quick reactions needed</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};