
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useGameAudio } from "@/hooks/useGameAudio";

interface AudioControlsProps {
  gameActive: boolean;
}

export const AudioControls = ({ gameActive }: AudioControlsProps) => {
  const { isMuted, toggleMute } = useGameAudio();

  return (
    <Button
      onClick={toggleMute}
      variant="outline"
      size="sm"
      className="text-gray-300 border-gray-600 hover:bg-gray-700"
      disabled={!gameActive}
    >
      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  );
};
