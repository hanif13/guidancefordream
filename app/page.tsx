import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import HilightSection from "./components/HilightSection";
import PromotionSection from "./components/PromotionSection";
import ImplementedBySection from "./components/ImplementedBySection";
import BloomingPartnersSection from "./components/BloomingPartnersSection";
import GallerySection from "./components/GallerySection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <HilightSection />
      <PromotionSection />
      <ImplementedBySection />
      <BloomingPartnersSection />
      <GallerySection />
      <Footer />
    </main>
  );
}
