import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import HilightSection from "./components/HilightSection";
import PromotionSection from "./components/PromotionSection";
import VideoSection from "./components/VideoSection";
import ImplementedBySection from "./components/ImplementedBySection";
import BloomingPartnersSection from "./components/BloomingPartnersSection";
import GallerySection from "./components/GallerySection";

export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <AboutSection />
      <HilightSection />
      <PromotionSection />
      <VideoSection />
      <ImplementedBySection />
      <BloomingPartnersSection />
      <GallerySection />
    </main>
  );
}
