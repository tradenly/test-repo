
export const WalletsDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">💳 Wallets & Credits Guide</h2>
        <p className="text-lg text-gray-300">
          Connect your wallet and manage your credits with USDC payments
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
            <li><strong>Future-Proof:</strong> Ready for upcoming DeFi features and token rewards</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Supported Wallets & Networks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🌐 Browser Extensions</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>MetaMask (Ethereum)</li>
              <li>Phantom (Solana)</li>
              <li>SUI Wallet (SUI Network)</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📱 Mobile Wallets</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Trust Wallet</li>
              <li>Coinbase Wallet</li>
              <li>Rainbow Wallet</li>
              <li>Phantom Mobile</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">USDC Credit Purchases</h3>
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-3">💰 New Pricing Structure</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">1 USDC</div>
              <div className="text-sm">= 5 Credits</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">5 USDC</div>
              <div className="text-sm">= 25 Credits (Minimum)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">25 USDC</div>
              <div className="text-sm">= 125 Credits</div>
            </div>
          </div>
          <p className="text-blue-200 text-sm">
            <strong>Minimum Purchase:</strong> 5 USDC (25 Credits)
          </p>
        </div>

        <h3 className="text-xl font-semibold text-white">Supported Networks for USDC</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-white mb-2">⚡ Solana</h4>
            <p className="text-sm text-gray-300">Fast & Low-Cost</p>
            <p className="text-xs text-gray-400 mt-2">USDC on Solana Network</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-white mb-2">🔷 Ethereum</h4>
            <p className="text-sm text-gray-300">Most Established</p>
            <p className="text-xs text-gray-400 mt-2">USDC on Ethereum Network</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-white mb-2">🌊 SUI</h4>
            <p className="text-sm text-gray-300">Next-Gen Blockchain</p>
            <p className="text-xs text-gray-400 mt-2">USDC on SUI Network</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">How to Purchase Credits</h3>
        <div className="space-y-3">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 1: Connect Your Wallet</h4>
            <p className="text-sm">Go to Dashboard → Wallets and connect your preferred wallet (Phantom recommended).</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 2: Select Network</h4>
            <p className="text-sm">Choose Solana, Ethereum, or SUI network for your USDC transaction.</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 3: Enter USDC Amount</h4>
            <p className="text-sm">Enter the amount of USDC you want to spend (minimum 5 USDC for 25 credits).</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 4: Complete Payment</h4>
            <p className="text-sm">Send the exact USDC amount to the generated payment address. Credits appear after confirmation.</p>
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
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Troubleshooting</h3>
        <div className="space-y-2">
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Wallet won't connect?</summary>
            <p className="mt-2 text-sm">Make sure your wallet is unlocked, on the correct network, and that you're approving the connection request.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">USDC transaction failed?</summary>
            <p className="mt-2 text-sm">Ensure you have sufficient USDC balance and network fees. Verify you're sending USDC tokens and not native tokens.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Credits not appearing?</summary>
            <p className="mt-2 text-sm">Credits appear after blockchain confirmation. This usually takes 1-5 minutes depending on network congestion. Make sure you sent the exact USDC amount.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Sent wrong token type?</summary>
            <p className="mt-2 text-sm">If you sent native tokens instead of USDC, contact support immediately. Only USDC payments are processed automatically.</p>
          </details>
        </div>
      </div>
    </div>
  );
};
