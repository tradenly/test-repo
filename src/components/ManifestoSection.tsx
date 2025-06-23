
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const ManifestoSection = () => {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();

  const handleGetRektClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleReferralClick = () => {
    navigate('/dashboard?section=social');
  };

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
        <h2 className="text-5xl font-bold text-white mb-4 text-center">
          Ready to Go Full Degen?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/1685e826-20ea-4727-8b05-018c7d548dc4.png" 
                alt="Gray hippo with cap" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Create Account, Play games</h3>
            <p className="text-gray-300 mb-6">
              Sign up to play Flappy Hippos, Falling Logs, and POOPEE Crush. Earn rewards in USDC. Stake tokens. Track the nonsense.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
              onClick={handleGetRektClick}
            >
              Get Rekt
            </Button>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/4c9f27b8-fa39-4c01-998a-eca0b6f095d3.png" 
                alt="Blue hippo sitting" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Refer & Corrupt Friends</h3>
            <p className="text-gray-300 mb-6">
              Get your unique referral link after signing in. Send it to someone you barely like. Earn credits when they mint, play, or stake.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
              onClick={handleReferralClick}
            >
              Grab Your Referral Link
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
