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
    <section className="py-20 px-4 bg-gradient-to-b from-teal-400 via-green-500 to-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-4">
          How to Join the Regret 😭
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-white mb-4">Mint Your Fatty</h3>
            <p className="text-gray-200 mb-6">
              Connect your wallet, pay the gas, and receive your digital disappointment.
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold">
              Get Rekt
            </Button>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-white mb-4">Buy $POOPEE</h3>
            <p className="text-gray-200 mb-6">
              Trade your valuable tokens for our worthless ones. Modern alchemy!
            </p>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold">
              Coming Soon
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {manifestoItems.map((item, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center space-x-4 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl">{item.icon}</div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-gray-200">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
