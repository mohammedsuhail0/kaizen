import { useState, useEffect } from 'react';
import { VideoEngine } from './components/VideoEngine';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { BundlesSection } from './components/BundlesSection';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { EstimatorSection } from './components/EstimatorSection';
import { BrandSection } from './components/BrandSection';
import { MobileView } from './components/mobile/MobileView';
import { ChatDrawer } from './components/ChatDrawer';
import { ChatLauncher } from './components/ChatLauncher';

export function App() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['hero', 'services', 'bundles', 'demos', 'quotation', 'brand'].includes(hash)) {
      return hash;
    }
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section')?.toLowerCase();
    if (sec && ['hero', 'services', 'bundles', 'demos', 'quotation', 'brand'].includes(sec)) {
      return sec;
    }
    return 'hero';
  });

  const navigateTo = (section: string) => {
    setActiveSection(section);
    window.location.hash = section;
  };

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['hero', 'services', 'bundles', 'demos', 'quotation', 'brand'].includes(hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard navigation between sections (1-6) for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1') navigateTo('hero');
      if (e.key === '2') navigateTo('services');
      if (e.key === '3') navigateTo('bundles');
      if (e.key === '4') navigateTo('demos');
      if (e.key === '5') navigateTo('quotation');
      if (e.key === '6') navigateTo('brand');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen md:h-screen md:max-h-screen overflow-x-clip md:overflow-hidden text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-400 selection:text-slate-950 flex flex-col justify-between relative bg-transparent">
      {/* 1. Cinematic Video Engine (The Blue Tree Video IS the Preloader, then smoothly dissolves into Pink Tree) */}
      <VideoEngine
        isPreloading={isPreloading}
        onFinishPreload={() => setIsPreloading(false)}
      />

      {/* 2. DEDICATED MOBILE PHONE LAYOUT (< 768px viewports) */}
      <div
        className={`md:hidden min-h-[100dvh] w-full relative z-20 transition-opacity duration-700 ease-out ${
          isPreloading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MobileView
          initialSection={activeSection}
          onNavigate={(sec) => navigateTo(sec)}
          onOpenChat={() => setIsChatOpen(true)}
        />
      </div>

      {/* 3. DEDICATED DESKTOP / LAPTOP LAYOUT (>= 768px viewports: Capped at max-w-7xl, Zero horizontal overflow) */}
      <div
        className={`hidden md:flex h-full w-full flex-col justify-between transition-opacity duration-700 ease-out relative z-20 ${
          isPreloading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Top Navbar with Showcase Menu & Direct WhatsApp/Email Redirects */}
        <Navbar
          activeSection={activeSection}
          onNavigate={(id) => navigateTo(id)}
          onOpenEstimator={() => navigateTo('quotation')}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* Central View Stage (Strict max-w-7xl, breathing gutters, clean header clearance) */}
        <main className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto pt-16 sm:pt-20 pb-4 overflow-hidden">
          <div className="w-full">
            {activeSection === 'hero' && (
              <HeroSection
                onExploreServices={() => navigateTo('services')}
                onOpenQuotation={() => navigateTo('quotation')}
                onExploreDemos={() => navigateTo('demos')}
              />
            )}

            {(activeSection === 'services' || activeSection === 'solutions' || activeSection === 'skills') && (
              <ServicesSection
                onOpenQuotation={() => navigateTo('quotation')}
              />
            )}

            {(activeSection === 'bundles' || activeSection === 'process') && (
              <BundlesSection
                onOpenQuotation={() => navigateTo('quotation')}
              />
            )}

            {(activeSection === 'demos' || activeSection === 'proof' || activeSection === 'projects') && (
              <PortfolioShowcase />
            )}

            {(activeSection === 'quotation' || activeSection === 'estimator' || activeSection === 'contact') && (
              <EstimatorSection />
            )}

            {activeSection === 'brand' && (
              <BrandSection />
            )}
          </div>
        </main>

        {/* Floating Zen Studio Concierge Pill Launcher & Teaser Note */}
        <ChatLauncher
          onOpenChat={() => setIsChatOpen(true)}
          isOpen={isChatOpen}
        />
      </div>

      {/* 4. Global Kaizen Solutions Architect Drawer (Zen Twilight Ink Theme) */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

export default App;
