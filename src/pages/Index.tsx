
import { HeroSection } from "@/components/HeroSection";
import { SneakPeekSection } from "@/components/SneakPeekSection";
import { MintInfoSection } from "@/components/MintInfoSection";
import { ManifestoSection } from "@/components/ManifestoSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { Footer } from "@/components/Footer";
import { FloatingHippos } from "@/components/FloatingHippos";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-500 to-orange-400 relative overflow-hidden">
      <FloatingHippos />
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
