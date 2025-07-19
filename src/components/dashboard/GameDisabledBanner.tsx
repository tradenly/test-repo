
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GameDisabledBannerProps {
  gameName: string;
}

export const GameDisabledBanner = ({ gameName }: GameDisabledBannerProps) => {
  return (
    <Alert className="mb-6 border-yellow-600 bg-yellow-600/10">
      <AlertTriangle className="h-4 w-4 text-yellow-400" />
      <AlertDescription className="text-yellow-200">
        <strong>{gameName}</strong> is temporarily disabled for maintenance. 
        Please check back later to continue playing!
      </AlertDescription>
    </Alert>
  );
};
