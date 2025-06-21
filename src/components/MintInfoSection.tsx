
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
                src="/lovable-uploads/50ea60fd-e73f-4d84-ba08-1d6992c285b1.png" 
                alt="Gray hippo with open mouth" 
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
                src="/lovable-uploads/5d48fcd1-825e-49ca-86d5-7701ab393070.png" 
                alt="Cute sitting hippo with pink accents" 
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
            <div className="mb-2">
              <img 
                src="/lovable-uploads/c0b71020-c9b3-45d6-ab9e-6039d6dd8bb4.png" 
                alt="Hippo with sunglasses" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">RGS Diary</p>
            <p className="text-sm text-gray-300">What was Lost</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/623aca37-1cc9-4d34-9467-be60a163841a.png" 
                alt="Cool hippo character" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">2K</p>
            <p className="text-sm text-gray-300">What we Bought</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/b896f4cd-250a-4f3c-b051-0128831d13f0.png" 
                alt="Happy hippo with gold chain" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Unlimited Ptoper</p>
            <p className="text-sm text-gray-300">What Forever</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/a17135f5-f44e-47e3-b35e-98de0b61ee4a.png" 
                alt="Blue hippo with chain" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Lost All Ash</p>
            <p className="text-sm text-gray-300">What's at Ash</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/83e7733d-c474-4f7a-b360-e8287b5e0bb5.png" 
                alt="Purple hippo with sunglasses" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Moon</p>
            <p className="text-sm text-gray-300">What'd</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/fa61c441-9bb0-472b-852c-909b43d82890.png" 
                alt="Stylish hippo character" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Regret</p>
            <p className="text-sm text-gray-300">What's</p>
          </div>
        </div>
      </div>
    </section>
  );
};
