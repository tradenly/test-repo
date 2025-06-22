
import { Volume2, VolumeX, Music, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useGameAudio } from "@/hooks/useGameAudio";

interface AudioControlsProps {
  gameActive: boolean;
}

export const AudioControls = ({ gameActive }: AudioControlsProps) => {
  const { 
    settings, 
    isPlaying, 
    playBackgroundMusic, 
    stopBackgroundMusic, 
    updateSettings 
  } = useGameAudio();

  const handleMusicToggle = async (enabled: boolean) => {
    updateSettings({ musicEnabled: enabled });
    
    if (enabled && gameActive) {
      await playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  };

  const handleSfxToggle = (enabled: boolean) => {
    updateSettings({ sfxEnabled: enabled });
  };

  const handleMusicVolumeChange = (value: number[]) => {
    updateSettings({ musicVolume: value[0] });
  };

  const handleSfxVolumeChange = (value: number[]) => {
    updateSettings({ sfxVolume: value[0] });
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Music className="h-5 w-5" />
          Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Music */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-blue-400" />
              <span className="text-white text-sm">Background Music</span>
            </div>
            <Switch
              checked={settings.musicEnabled}
              onCheckedChange={handleMusicToggle}
            />
          </div>
          
          {settings.musicEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <VolumeX className="h-3 w-3 text-gray-400" />
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={handleMusicVolumeChange}
                  max={1}
                  min={0}
                  step={0.1}
                  className="flex-1"
                />
                <Volume2 className="h-3 w-3 text-gray-400" />
              </div>
              <div className="text-xs text-gray-400 text-center">
                Volume: {Math.round(settings.musicVolume * 100)}%
              </div>
            </div>
          )}
          
          {isPlaying && (
            <div className="text-xs text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Now playing
            </div>
          )}
        </div>

        {/* Sound Effects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-white text-sm">Sound Effects</span>
            </div>
            <Switch
              checked={settings.sfxEnabled}
              onCheckedChange={handleSfxToggle}
            />
          </div>
          
          {settings.sfxEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <VolumeX className="h-3 w-3 text-gray-400" />
                <Slider
                  value={[settings.sfxVolume]}
                  onValueChange={handleSfxVolumeChange}
                  max={1}
                  min={0}
                  step={0.1}
                  className="flex-1"
                />
                <Volume2 className="h-3 w-3 text-gray-400" />
              </div>
              <div className="text-xs text-gray-400 text-center">
                Volume: {Math.round(settings.sfxVolume * 100)}%
              </div>
            </div>
          )}
        </div>

        {!gameActive && (
          <div className="text-xs text-gray-400 text-center mt-4">
            Start a game to hear background music
          </div>
        )}
      </CardContent>
    </Card>
  );
};
