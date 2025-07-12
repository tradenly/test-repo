
import { HeroSection } from "@/components/HeroSection";
import { SneakPeekSection } from "@/components/SneakPeekSection";
import { MintInfoSection } from "@/components/MintInfoSection";
import { InfoCardsSection } from "@/components/InfoCardsSection";
import { ManifestoSection } from "@/components/ManifestoSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Navigation />
      <HeroSection />
      <SneakPeekSection />
      <MintInfoSection />
      <InfoCardsSection />
      <ManifestoSection />
      <WhatYouGetSection />
      <Footer />
    </div>
  );
};

export default Index;
