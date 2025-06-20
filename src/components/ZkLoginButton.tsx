
import { Button } from "@/components/ui/button";
import { useZkLogin } from "@/hooks/useZkLogin";
import { Loader2, AlertCircle } from "lucide-react";

interface ZkLoginButtonProps {
  onSuccess?: (address: string) => void;
  className?: string;
  showDetailedStatus?: boolean;
}

export const ZkLoginButton = ({ onSuccess, className, showDetailedStatus = false }: ZkLoginButtonProps) => {
  const { startZkLogin, isLoading, userAddress, hasValidJWT, error, isReadyForTransactions } = useZkLogin();

  const handleLogin = () => {
    if (userAddress && onSuccess) {
      onSuccess(userAddress);
    } else {
      startZkLogin();
    }
  };

  if (userAddress && hasValidJWT) {
    return (
      <div className="space-y-2">
        <Button 
          onClick={handleLogin}
          className={className}
          variant="outline"
        >
          🔐 ZK Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </Button>
        {showDetailedStatus && (
          <p className="text-xs text-green-400">✅ Ready for transactions</p>
        )}
      </div>
    );
  }

  if (userAddress && !hasValidJWT) {
    return (
      <div className="space-y-2">
        <Button 
          onClick={startZkLogin}
          disabled={isLoading}
          className={className}
          variant="destructive"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <AlertCircle className="mr-2 h-4 w-4" />
          Re-authenticate with Google
        </Button>
        {showDetailedStatus && (
          <p className="text-xs text-yellow-400">⚠️ Session expired - re-authentication needed for transactions</p>
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
      {showDetailedStatus && !userAddress && (
        <p className="text-xs text-gray-400">ZK Login required for secure transactions</p>
      )}
    </div>
  );
};
