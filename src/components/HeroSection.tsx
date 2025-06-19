
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const HeroSection = () => {
  const scrollToSneakPeek = () => {
    const sneakPeekSection = document.getElementById("sneak-peek");
    sneakPeekSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 bg-yellow-300 rounded-full opacity-20 animate-bounce" style={{ top: "10%", left: "10%", animationDelay: "0s" }}></div>
        <div className="absolute w-24 h-24 bg-green-300 rounded-full opacity-20 animate-bounce" style={{ top: "20%", right: "15%", animationDelay: "1s" }}></div>
        <div className="absolute w-40 h-40 bg-pink-300 rounded-full opacity-20 animate-bounce" style={{ bottom: "20%", left: "20%", animationDelay: "2s" }}></div>
      </div>

      {/* Main hero content */}
      <div className="z-10 space-y-8 max-w-4xl">
        <div className="animate-pulse">
          <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg mb-4">
            💩 POOPEE 🦛
          </h1>
          <p className="text-2xl md:text-3xl text-yellow-200 font-bold mb-2">
            The Hippo
          </p>
          <p className="text-lg md:text-xl text-pink-200 italic">
            "A Tropical Fatty's Joint"
          </p>
        </div>

        <div className="space-y-4 text-white text-lg md:text-xl max-w-2xl mx-auto">
          <p className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Minted in a gas station toilet. 🚽
          </p>
          <p className="animate-fade-in" style={{ animationDelay: "1s" }}>
            Birthed by the Tropical Fatty's community. 🌴
          </p>
          <p className="animate-fade-in" style={{ animationDelay: "1.5s" }}>
            Launching wherever blockchains allow it. ⛓️
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-3xl md:text-4xl font-bold text-yellow-300 animate-pulse">
            Expect nothing. Receive less.
          </p>
          
          <Button 
            onClick={scrollToSneakPeek}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Enter the Toiletverse 🚽
            <ChevronDown className="ml-2 animate-bounce" />
          </Button>
        </div>
      </div>
    </section>
  );
};
