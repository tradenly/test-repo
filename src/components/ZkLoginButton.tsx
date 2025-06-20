
import { Button } from "@/components/ui/button";
import { useZkLogin } from "@/hooks/useZkLogin";
import { Loader2 } from "lucide-react";

interface ZkLoginButtonProps {
  onSuccess?: (address: string) => void;
  className?: string;
}

export const ZkLoginButton = ({ onSuccess, className }: ZkLoginButtonProps) => {
  const { startZkLogin, isLoading, userAddress, error } = useZkLogin();

  const handleLogin = () => {
    if (userAddress && onSuccess) {
      onSuccess(userAddress);
    } else {
      startZkLogin();
    }
  };

  if (userAddress) {
    return (
      <Button 
        onClick={handleLogin}
        className={className}
        variant="outline"
      >
        🔐 Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={startZkLogin}
        disabled={isLoading}
        className={className}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        🔐 Login with Google (ZK)
      </Button>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
