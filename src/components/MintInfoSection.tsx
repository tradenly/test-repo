
import { Button } from "@/components/ui/button";

export const MintInfoSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-16">
          The MEMENOMICS 📊
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/94398dd3-8fbc-453f-a517-4ba31ec9e3d5.png" 
                alt="SUI Network Icon" 
                className="w-16 h-16 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">SUI NFT Mint</h3>
            <div className="space-y-3 text-left">
              <p className="text-lg text-gray-300"><span className="font-bold">Platform:</span> TradePort</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Supply:</span> TBD</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Date:</span> Coming Soon</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Price:</span> Your Regret</p>
            </div>
            <Button className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold border border-gray-600">
              Mint coming soon on tradeport.xyz
            </Button>
            <p className="text-sm text-gray-400 mt-2 font-bold">
              MINTING MAY CAUSE REGRET.
            </p>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/1b2b8e90-5d58-42db-b73f-5dd406333bf1.png" 
                alt="Cardano Icon" 
                className="w-16 h-16 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Cardano Token</h3>
            <div className="space-y-3 text-left">
              <p className="text-lg text-gray-300"><span className="font-bold">Token:</span> POOPEE</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Supply:</span> 420,069,000</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Distribution:</span> TBD</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Utility:</span> Literally Forever</p>
            </div>
            <Button className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold border border-gray-600">
              Coming Soon (Maybe)
            </Button>
            <p className="text-sm text-gray-400 mt-2 font-bold">
              THERE IS NO REFUND. THERE IS NO ESCAPE.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="text-4xl mb-2">💾</div>
            <p className="text-white font-bold">RGS Diary</p>
            <p className="text-sm text-gray-300">What was Lost</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-white font-bold">2K</p>
            <p className="text-sm text-gray-300">What we Bought</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="text-4xl mb-2">🧻</div>
            <p className="text-white font-bold">Unlimited Ptoper</p>
            <p className="text-sm text-gray-300">What Forever</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-white font-bold">Lost All Ash</p>
            <p className="text-sm text-gray-300">What's at Ash</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-white font-bold">Moon</p>
            <p className="text-sm text-gray-300">What'd</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="text-4xl mb-2">🎭</div>
            <p className="text-white font-bold">Regret</p>
            <p className="text-sm text-gray-300">What's</p>
          </div>
        </div>
      </div>
    </section>
  );
};
