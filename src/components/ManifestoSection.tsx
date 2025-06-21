
import { Button } from "@/components/ui/button";

export const ManifestoSection = () => {
  const manifestoItems = [
    {
      icon: "🧠",
      title: "ZERO UTILITY",
      description: "Designed for intellectual rot."
    },
    {
      icon: "📉",
      title: "GOING TO ZERO", 
      description: "We expect nothing, and so should you."
    },
    {
      icon: "🦛",
      title: "TROPICAL FATTY-BORN",
      description: "Raised by degenerates, ignored by adults."
    },
    {
      icon: "🌈",
      title: "MULTICHAIN MAYHEM",
      description: "SUI and Cardano, because why not."
    },
    {
      icon: "📜",
      title: "NO ROADMAP",
      description: "If there was one, it would've been forgotten already."
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-4">
          How to Join the Regret 😭
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/c0b71020-c9b3-45d6-ab9e-6039d6dd8bb4.png" 
                alt="Hippo with sunglasses" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Mint Your Fatty</h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet, pay the gas, and receive your digital disappointment.
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold">
              Get Rekt
            </Button>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/b896f4cd-250a-4f3c-b051-0128831d13f0.png" 
                alt="Happy hippo with gold chain" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Buy $POOPEE</h3>
            <p className="text-gray-300 mb-6">
              Trade your valuable tokens for our worthless ones. Modern alchemy!
            </p>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold">
              Coming Soon
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {manifestoItems.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 flex items-center space-x-4 hover:bg-gray-700 transition-all duration-300 border border-gray-700">
              <div className="text-4xl">{item.icon}</div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
