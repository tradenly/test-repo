import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, ShieldCheck, PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";

export const WhatYouGetSection = () => {
  const cardsData = [
    {
      title: "Deflationary Tokenomics",
      description: "Our token burns brighter than your future ex's mixtape. 🔥",
      icon: Rocket,
    },
    {
      title: "Secure & Audited",
      description: "We've got more audits than a tax season on Wall Street. 🛡️",
      icon: ShieldCheck,
    },
    {
      title: "Staking Rewards",
      description: "Stake your tokens and watch them multiply like rabbits on a romantic getaway. 💰",
      icon: PiggyBank,
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What You Get with POOPEE 💩
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join our ridiculous ecosystem where gaming meets defi, memes meet money, and chaos meets... more chaos!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cardsData.map((card, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <card.icon className="h-6 w-6" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold"
          >
            Complain With Us 😤
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold"
          >
            Read Our Lies 🤥
          </Button>
          <Button 
            asChild
            size="lg" 
            variant="outline" 
            className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white font-bold"
          >
            <Link to="/contact">
              Suffer Together 💬
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
