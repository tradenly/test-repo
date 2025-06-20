
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Clock, Send, Receive } from 'lucide-react';
import { suiTransactionService } from '@/services/suiTransactionService';

interface TransactionHistoryProps {
  walletAddress: string;
}

export const TransactionHistory = ({ walletAddress }: TransactionHistoryProps) => {
  const [showHistory, setShowHistory] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ['transactionHistory', walletAddress],
    queryFn: async () => {
      return await suiTransactionService.getTransactionHistory(walletAddress);
    },
    enabled: !!walletAddress && showHistory,
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const getTransactionType = (tx: any) => {
    const effects = tx.effects;
    if (!effects) return 'Unknown';
    
    // Simple heuristic to determine transaction type
    if (effects.status?.status === 'success') {
      return 'Transfer';
    }
    return 'Failed';
  };

  const getExplorerUrl = (digest: string) => {
    return `https://suivision.xyz/txblock/${digest}`;
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Transaction History
          </span>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </Button>
        </CardTitle>
      </CardHeader>
      
      {showHistory && (
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <span className="ml-2 text-white">Loading transactions...</span>
            </div>
          ) : history?.success ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.transactions.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  No transactions found
                </div>
              ) : (
                history.transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 p-3 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                          <Send className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {getTransactionType(tx)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatTimestamp(tx.timestampMs)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs ${
                          tx.effects?.status?.status === 'success' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.effects?.status?.status || 'Unknown'}
                        </div>
                        <Button
                          onClick={() => window.open(getExplorerUrl(tx.digest), '_blank')}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          title="View on Explorer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Digest: {tx.digest.slice(0, 20)}...{tx.digest.slice(-10)}
                    </div>
                    
                    {tx.effects?.gasUsed && (
                      <div className="text-xs text-gray-400 mt-1">
                        Gas Used: {(parseInt(tx.effects.gasUsed.computationCost) / 1000000000).toFixed(6)} SUI
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-red-400">
              Failed to load transaction history: {history?.error}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
