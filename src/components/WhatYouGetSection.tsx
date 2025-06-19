
import { Button } from "@/components/ui/button";

export const WhatYouGetSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-purple-600 via-pink-500 to-red-500">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-16">
          The Blubber Paper 📜
        </h2>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-12 mb-16">
          <div className="text-8xl mb-6">📋</div>
          <h3 className="text-3xl font-bold text-white mb-8">
            Our Revolutionary Non-Roadmap
          </h3>
          
          <div className="space-y-6 text-xl text-gray-200">
            <p>No staking.</p>
            <p>No DAO.</p>
            <p>No alpha.</p>
            <p className="text-2xl font-bold text-yellow-300">
              Just hippos, vibes, and maybe some toilet paper.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-4xl font-bold text-white">
            Join the Tropical Fattys 🌴
          </h3>
          
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Become one of the finest most prized communities in crypto. Or just join our Discord channel to complain about being rug-pulled.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg"
              onClick={() => window.open('https://x.com/OGpoopee', '_blank')}
            >
              Follow on Twitter 🐦
            </Button>
            
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg"
              onClick={() => window.open('https://medium.com/@poopee', '_blank')}
            >
              Read Medium 📖
            </Button>
            
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg"
            >
              Join Discord 💬
            </Button>
          </div>
          
          <p className="text-sm text-yellow-300 font-bold">
            Subscribe for epic updates. Or don't. Whatever.
          </p>
        </div>
      </div>
    </section>
  );
};
