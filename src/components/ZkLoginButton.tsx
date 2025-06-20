
import { Button } from "@/components/ui/button";
import { useZkLogin } from "@/hooks/useZkLogin";
import { Loader2, AlertTriangle } from "lucide-react";

interface ZkLoginButtonProps {
  onSuccess?: (address: string) => void;
  className?: string;
}

export const ZkLoginButton = ({ onSuccess, className }: ZkLoginButtonProps) => {
  const { startZkLogin, isLoading, userAddress, error, isMockMode } = useZkLogin();

  const handleLogin = () => {
    if (userAddress && onSuccess) {
      onSuccess(userAddress);
    } else {
      startZkLogin();
    }
  };

  if (userAddress) {
    return (
      <div className="space-y-2">
        <Button 
          onClick={handleLogin}
          className={className}
          variant="outline"
        >
          🔐 Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          {isMockMode && <AlertTriangle className="ml-2 h-4 w-4 text-yellow-500" />}
        </Button>
        {isMockMode && (
          <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border">
            <strong>Test Mode:</strong> Using mock salt. Client ID needs whitelisting for production use.
          </div>
        )}
      </div>
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
