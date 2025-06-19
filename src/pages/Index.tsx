
import { HeroSection } from "@/components/HeroSection";
import { SneakPeekSection } from "@/components/SneakPeekSection";
import { MintInfoSection } from "@/components/MintInfoSection";
import { ManifestoSection } from "@/components/ManifestoSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <HeroSection />
      <SneakPeekSection />
      <MintInfoSection />
      <ManifestoSection />
      <WhatYouGetSection />
      <Footer />
    </div>
  );
};

export default Index;
