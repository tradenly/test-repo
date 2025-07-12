
export const WalletsDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">💳 Wallets & Credits Guide</h2>
        <p className="text-lg text-gray-300">
          Complete financial ecosystem with USDC payments, credit management, and cashout functionality
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Why Connect a Wallet?</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>USDC Payments:</strong> Purchase credits directly with USDC cryptocurrency</li>
            <li><strong>Instant Transactions:</strong> No waiting for bank transfers or card processing</li>
            <li><strong>Lower Fees:</strong> Bypass traditional payment processor fees</li>
            <li><strong>True Ownership:</strong> Your tokens and NFTs remain in your control</li>
            <li><strong>Multi-Chain Support:</strong> Use USDC across Solana, Ethereum, and SUI networks</li>
            <li><strong>Cashout Capability:</strong> Convert earned credits back to USDC</li>
            <li><strong>Future-Proof:</strong> Ready for upcoming DeFi features and token rewards</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Supported Wallets & Networks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🌐 Browser Extensions</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Phantom (Recommended - Solana/Multi-chain)</li>
              <li>MetaMask (Ethereum)</li>
              <li>SUI Wallet (SUI Network)</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📱 Mobile Wallets</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Phantom Mobile (Recommended)</li>
              <li>Trust Wallet</li>
              <li>Coinbase Wallet</li>
              <li>Rainbow Wallet</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">USDC Credit System</h3>
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-3">💰 Exchange Rates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">1 USDC</div>
              <div className="text-sm">= 5 Credits</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">5 USDC</div>
              <div className="text-sm">= 25 Credits (Minimum Purchase)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">5 Credits</div>
              <div className="text-sm">= 1 USDC (Cashout Rate)</div>
            </div>
          </div>
          <p className="text-blue-200 text-sm">
            <strong>Minimum Purchase:</strong> 5 USDC (25 Credits) | <strong>Minimum Cashout:</strong> 5 Credits (1 USDC)
          </p>
        </div>

        <h3 className="text-xl font-semibold text-white">How Credits Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💳 Purchase Credits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Connect Phantom wallet</li>
              <li>Select USDC amount (min 5 USDC)</li>
              <li>Send payment to generated address</li>
              <li>Credits appear after confirmation</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🎮 Use Credits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>1 credit per game across all three games</li>
              <li>Earn credits back based on performance</li>
              <li>Buy shields/power-ups (5 credits)</li>
              <li>Credits work across the entire platform</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💰 Cashout Credits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Convert earned credits to USDC</li>
              <li>Select connected wallet for payout</li>
              <li>Admin approval required (24-hour process)</li>
              <li>Receive USDC directly to your wallet</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Supported Networks for USDC</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-white mb-2">⚡ Solana (Recommended)</h4>
            <p className="text-sm text-gray-300">Fast & Low-Cost</p>
            <p className="text-xs text-gray-400 mt-2">Best for frequent transactions</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-white mb-2">🔷 Ethereum</h4>
            <p className="text-sm text-gray-300">Most Established</p>
            <p className="text-xs text-gray-400 mt-2">Higher fees but widely supported</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-white mb-2">🌊 SUI</h4>
            <p className="text-sm text-gray-300">Next-Gen Blockchain</p>
            <p className="text-xs text-gray-400 mt-2">Fast and efficient transactions</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Supported Networks for USDM</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-white mb-2">🔴 Cardano</h4>
            <p className="text-sm text-gray-300">Most Secure</p>
            <p className="text-xs text-gray-400 mt-2">Fastest transactions with lowest fees</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Credit Purchase Process</h3>
        <div className="space-y-3">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 1: Connect Your Wallet</h4>
            <p className="text-sm">Go to Dashboard → Wallets and connect your Phantom wallet (recommended for best experience).</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 2: Select Purchase Amount</h4>
            <p className="text-sm">Choose how much USDC you want to spend (minimum 5 USDC for 25 credits).</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 3: Choose Network</h4>
            <p className="text-sm">Select Solana (recommended), Ethereum, or SUI network for your transaction.</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 4: Complete Payment</h4>
            <p className="text-sm">Send the exact USDC amount to the generated payment address. Credits appear after blockchain confirmation.</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Credit Cashout Process</h3>
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-400 mb-3">💸 How to Cash Out</h4>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Earn Credits:</strong> Play games and accumulate credits through performance</li>
            <li><strong>Meet Minimum:</strong> Ensure you have at least 5 credits (1 USDC minimum cashout)</li>
            <li><strong>Select Wallet:</strong> Choose which connected wallet should receive the USDC</li>
            <li><strong>Submit Request:</strong> Request cashout - credits are immediately deducted from your balance</li>
            <li><strong>Admin Review:</strong> Our team reviews and approves cashout requests within 24 hours</li>
            <li><strong>Receive USDC:</strong> Once approved, USDC is sent directly to your selected wallet</li>
          </ol>
        </div>

        <h3 className="text-xl font-semibold text-white">Credit Earning Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🦛 Flappy Hippos</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Score-based rewards (0.1-1.5+ credits)</li>
              <li>High score bonuses (+1.0 credit)</li>
              <li>Shield survival bonuses</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💩 POOPEE Crush</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Match combo rewards</li>
              <li>Level completion bonuses</li>
              <li>Power-up efficiency rewards</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🪵 Falling Logs</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Level progression rewards</li>
              <li>Line clearing bonuses</li>
              <li>Tetris achievement bonuses</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Security Best Practices</h3>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <h4 className="text-red-400 font-semibold mb-2">🔒 Keep Your Wallet Safe</h4>
          <ul className="list-disc list-inside space-y-1 text-red-200">
            <li>Never share your private keys or seed phrase with anyone</li>
            <li>Only connect to the official POOPEE platform</li>
            <li>Always verify you're sending USDC tokens, not native tokens</li>
            <li>Double-check the network matches your selection</li>
            <li>Verify transaction details before confirming</li>
            <li>Use hardware wallets for large amounts</li>
            <li>Monitor your cashout requests in the dashboard</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Transaction History & Analytics</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">📊 Track Everything</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Credit Purchases:</strong> Complete history of USDC payments and credits received</li>
            <li><strong>Game Earnings:</strong> Track credits earned from each game with performance details</li>
            <li><strong>Cashout Requests:</strong> Monitor the status of your withdrawal requests</li>
            <li><strong>Transaction Analytics:</strong> View patterns and optimize your earning strategy</li>
            <li><strong>Cross-Game Performance:</strong> Compare earnings across all three games</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Troubleshooting</h3>
        <div className="space-y-2">
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Wallet won't connect?</summary>
            <p className="mt-2 text-sm">Make sure your wallet is unlocked, on the correct network, and that you're approving the connection request. Try refreshing the page if issues persist.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">USDC transaction failed?</summary>
            <p className="mt-2 text-sm">Ensure you have sufficient USDC balance and network fees. Verify you're sending USDC tokens and not native tokens. Check that the payment address is correct.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Credits not appearing?</summary>
            <p className="mt-2 text-sm">Credits appear after blockchain confirmation (1-5 minutes). Make sure you sent the exact USDC amount to the correct address. Check transaction history for updates.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Cashout request pending?</summary>
            <p className="mt-2 text-sm">Cashout requests require admin approval within 24 hours. Check your recent cashout requests section for status updates. Contact support if delayed beyond 24 hours.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Sent wrong token type?</summary>
            <p className="mt-2 text-sm">If you sent native tokens instead of USDC, contact support immediately. Only USDC payments are processed automatically. Recovery may be possible but requires manual intervention.</p>
          </details>
        </div>
      </div>
    </div>
  );
};
