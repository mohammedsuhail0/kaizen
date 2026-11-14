import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import {
  Sparkles,
  Layers,
  Package,
  Smartphone,
  Calculator,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Code2,
  Check,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { KaizenLogo } from '../KaizenLogo';
import {
  BUNDLES,
  ALL_SERVICES,
  PROJECTS,
  AGENCY_CONFIG,
  getWhatsAppUrl,
  handleWhatsAppInstantClick,
  formatINR,
  calculateAdvance,
  calculateBalance,
  calculateCombinedTimeline,
} from '../../data/agencyData';
import type { BundleItem, ServiceItem, ProjectItem } from '../../data/agencyData';
import { TrustSection } from '../TrustSection';

interface MobileViewProps {
  initialSection?: string;
  onNavigate?: (section: string) => void;
  onOpenChat?: () => void;
}

const TABS: ('home' | 'services' | 'bundles' | 'demos' | 'quote')[] = [
  'home',
  'services',
  'bundles',
  'demos',
  'quote',
];

export const MobileView: React.FC<MobileViewProps> = ({ initialSection = 'hero', onNavigate }) => {
  const mapSectionToTab = (sec: string): 'home' | 'services' | 'bundles' | 'demos' | 'quote' => {
    if (sec === 'quotation' || sec === 'quote') return 'quote';
    if (sec === 'demos' || sec === 'projects') return 'demos';
    if (sec === 'bundles') return 'bundles';
    if (sec === 'services') return 'services';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'bundles' | 'demos' | 'quote'>(() =>
    mapSectionToTab(initialSection)
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedServiceCat, setSelectedServiceCat] = useState('all');
  const [selectedProjectsType, setSelectedProjectsType] = useState<'ALL' | 'WEBSITE' | 'MOBILE WEBAPP'>('ALL');
  const [selectedServices, setSelectedServices] = useState<string[]>(['bundle-shop']);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIndex = TABS.indexOf(activeTab);
      if (deltaX < 0 && currentIndex < TABS.length - 1) {
        switchTab(TABS[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        switchTab(TABS[currentIndex - 1]);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const lastSectionRef = useRef(initialSection);
  useEffect(() => {
    if (lastSectionRef.current !== initialSection) {
      lastSectionRef.current = initialSection;
      const targetTab = mapSectionToTab(initialSection);
      setActiveTab((curr) => (curr !== targetTab ? targetTab : curr));
    }
  }, [initialSection]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = tabContentRef.current?.querySelectorAll('.stagger-mobile');
    if (!elements || elements.length === 0) return;

    animate(elements, {
      translateY: [14, 0],
      opacity: [0, 1],
      delay: stagger(45, { start: 40 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 500,
    });
  }, [activeTab]);

  const switchTab = (tab: 'home' | 'services' | 'bundles' | 'demos' | 'quote') => {
    setActiveTab(tab);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (onNavigate) {
      const sectionName = tab === 'home' ? 'hero' : tab === 'quote' ? 'quotation' : tab;
      onNavigate(sectionName);
    }
  };

  // Build unified services list for Mobile from single canonical source
  const mobileServicesList = [
    ...BUNDLES.map((b: BundleItem) => ({
      id: b.id,
      name: b.name,
      price: b.numericPrice,
      regularPrice: b.regularPrice,
      category: 'bundles',
      desc: b.tagline,
      turnaround: b.timeline,
      popular: b.popular,
    })),
    ...ALL_SERVICES.map((s: ServiceItem) => ({
      id: s.id,
      name: s.name,
      price: s.numericPrice,
      regularPrice: s.regularPrice,
      category: s.category === 'monthly-plans' ? 'monthly' : s.category === 'websites' ? 'websites' : 'tools',
      desc: s.description,
      turnaround: s.turnaround,
      popular: s.popular,
    })),
  ];

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      if (id.startsWith('bundle-')) {
        const withoutBundles = prev.filter((item) => !item.startsWith('bundle-'));
        return prev.includes(id) ? withoutBundles : [...withoutBundles, id];
      }
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, id) => {
      const item = mobileServicesList.find((s) => s.id === id);
      return sum + (item ? item.price : 0);
    }, 0);
  };

  const total = calculateTotal();
  // Exact advance calculation formula: Math.round(price * 0.3 / 10) * 10
  const advance = calculateAdvance(total);
  const balance = calculateBalance(total);

  // Selected items combined timeline
  const selectedItemsObjects = selectedServices
    .map((id) => mobileServicesList.find((s) => s.id === id))
    .filter(Boolean) as { name: string; price: number; turnaround: string }[];
  const timelineText = calculateCombinedTimeline(selectedItemsObjects);

  const getWaQuoteMessage = () => {
    const itemsSummary = selectedItemsObjects
      .map((i) => `• ${i.name} (${formatINR(i.price)})`)
      .join('\n');

    return [
      `Hi! I was checking out the pricing on your website.`,
      ``,
      `I'm interested in getting this set up for my business:`,
      itemsSummary,
      ``,
      `Estimated Total: ${formatINR(total)}`,
      `Pay 30% to start: ${formatINR(advance)}`,
      `70% when you're happy: ${formatINR(balance)}`,
      `Estimated Delivery: ~${timelineText}`,
      ``,
      `Could you let me know how we can get started and what you'd need from my end? Thanks!`,
    ].join('\n');
  };

  const getWaQuoteUrl = () => {
    return getWhatsAppUrl(getWaQuoteMessage());
  };

  // Stack bundle cards with "Most Popular" first on mobile
  const mobileBundles = [...BUNDLES].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="md:hidden min-h-[100dvh] w-full text-slate-100 font-sans selection:bg-emerald-400 selection:text-slate-950 relative z-20 flex flex-col justify-between bg-transparent overflow-x-clip"
    >
      {/* 1. Mobile Header with Working Hamburger Nav (Single Help prompt rule: removed header help button) */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#080c14]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between select-none border-b border-white/10">
        <button
          onClick={() => switchTab('home')}
          className="touch-target flex items-center text-left focus-visible:outline-emerald-400 cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          aria-label="Home"
        >
          <KaizenLogo size="sm" showTagline={false} />
        </button>

        {/* Working Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="touch-target p-2 text-white hover:text-emerald-400 focus-visible:outline-emerald-400 transition-colors cursor-pointer"
          aria-label={menuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          {menuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-[53px] z-50 bg-[#080c14]/95 backdrop-blur-2xl p-6 flex flex-col justify-between border-b border-white/15 animate-in fade-in duration-200">
          <nav className="space-y-4 pt-2 font-mono text-sm" aria-label="Mobile Drawer Navigation">
            {[
              { id: 'home', label: '01. Home', sub: 'Overview & Guarantees' },
              { id: 'services', label: '02. Services', sub: 'Websites, booking & tools' },
              { id: 'bundles', label: '03. Turnkey Bundles', sub: 'Fixed price packages' },
              { id: 'demos', label: '04. Live Demos', sub: 'Real client projects' },
              { id: 'quote', label: '05. Quote Builder', sub: 'Custom investment calculator' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => switchTab(item.id as any)}
                className={`w-full text-left py-3 px-3 rounded-xl flex items-center justify-between transition-colors ${
                  activeTab === item.id
                    ? 'bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 font-bold'
                    : 'text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-slate-400 font-sans mt-0.5">{item.sub}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 text-xs font-sans text-slate-300">
            <div className="font-semibold text-white mb-1">Kaizen Software Agency</div>
            <p className="text-slate-400">Hyderabad, India · {AGENCY_CONFIG.displayPhone}</p>
            <p className="text-emerald-400 font-mono mt-1">Pay 30% to start, 70% when you're happy</p>
          </div>
        </div>
      )}

      {/* 2. Main Stage with Bottom Safe-Area Spacing */}
      <main
        ref={tabContentRef}
        className="flex-1 px-4 pt-3 pb-36 w-full max-w-full"
      >
        {/* ================= TAB 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 text-left">
            {/* Hero H1 */}
            <h1 className="stagger-mobile type-hero text-white leading-[1.14]">
              Websites, booking &amp; QR menus that bring more customers to your business.
            </h1>

            {/* Hero Sub */}
            <div className="stagger-mobile border-l-2 border-cyan-400/80 pl-3.5 py-1">
              <p className="type-body text-slate-200 font-sans text-base leading-relaxed">
                Fixed-price websites and simple systems for cafes, clinics, salons, gyms and shops. Built for you, delivered in days, and you own everything.
              </p>
            </div>

            {/* Commercial Guarantees */}
            <div className="stagger-mobile border-t border-b border-white/15 py-2 divide-y divide-white/10 type-meta font-sans">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-300 font-medium">Starter Packages</span>
                <span className="text-emerald-400 font-bold text-sm tracking-wide font-mono">
                  ₹4,999
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-300 font-medium">How payment works</span>
                <span className="text-emerald-300 font-medium">
                  Pay 30% to start, 70% when you're happy
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-300 font-medium">Ownership</span>
                <span className="text-white font-medium">You own everything. No monthly lock-in.</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-300 font-medium">Free support</span>
                <span className="text-cyan-300 font-medium font-mono">15 Days Included</span>
              </div>
            </div>

            {/* Action Triggers */}
            <div className="stagger-mobile space-y-3 pt-1">
              <button
                onClick={() => switchTab('quote')}
                className="btn-primary w-full"
                aria-label="Calculate Instant Quote"
              >
                <span>Get Instant Quotation</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-3 pt-1 type-meta font-mono">
                <button
                  onClick={() => switchTab('demos')}
                  className="touch-target py-2 border-b border-white/20 text-slate-200 hover:text-white uppercase flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>All {PROJECTS.length} Demos</span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                </button>

                <a
                  href={getWhatsAppUrl("Hi! I was checking out your website and I'm interested in building a website/system for my business.")}
                  onClick={(e) => handleWhatsAppInstantClick(e, "Hi! I was checking out your website and I'm interested in building a website/system for my business.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target py-2 border-b border-emerald-400/40 text-emerald-400 hover:text-emerald-300 uppercase flex items-center justify-between transition-colors"
                >
                  <span>WhatsApp Chat</span>
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>

            {/* Trust Ledger */}
            <div className="stagger-mobile space-y-2 pt-2">
              <div className="border-t border-b border-white/15 divide-y divide-white/10">
                <div className="py-3.5 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">Fixed prices</h4>
                    <p className="type-body text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                      Pay 30% to start, 70% when you're happy. Clear upfront costs with zero hidden charges.
                    </p>
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3">
                  <Code2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">You own your code</h4>
                    <p className="type-body text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                      You own everything. No monthly lock-in. Full ownership of code, domain, and assets.
                    </p>
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">Free support after delivery</h4>
                    <p className="type-body text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                      15 to 30 days of free support, 2 rounds of changes, and direct engineer access on WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Trust Section for Mobile Home */}
            <TrustSection onNavigate={(sec) => switchTab(mapSectionToTab(sec))} />
          </div>
        )}

        {/* ================= TAB 2: SERVICES ================= */}
        {activeTab === 'services' && (
          <div className="space-y-5 text-left">
            <div className="stagger-mobile">
              <h2 className="type-h2 text-white">
                What we build for you.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1 font-sans">
                Pick what your business needs. Pay 30% to start, 70% when you're happy.
              </p>
            </div>

            {/* Category Navigation */}
            <div className="stagger-mobile flex items-center gap-3 overflow-x-auto border-b border-white/15 pb-2 px-0.5 type-meta uppercase no-scrollbar font-mono">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'websites', label: 'Websites' },
                { id: 'tools', label: 'Custom Tools' },
                { id: 'bundles', label: 'Bundles' },
                { id: 'monthly', label: 'Monthly Care' },
              ].map((cat) => {
                const isSelected = selectedServiceCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedServiceCat(cat.id)}
                    className={`touch-target py-2 px-3 whitespace-nowrap shrink-0 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
                      isSelected
                        ? 'border-emerald-400 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Services Catalogue */}
            <div className="stagger-mobile border-t border-b border-white/15 divide-y divide-white/10">
              {mobileServicesList
                .filter((s) => selectedServiceCat === 'all' || s.category === selectedServiceCat)
                .map((s) => {
                  const isAdded = selectedServices.includes(s.id);
                  return (
                    <div key={s.id} className="py-4 space-y-2 text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 font-mono text-[9px] uppercase">
                              Introductory
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white font-sans leading-snug">{s.name}</h3>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {formatINR(s.price)}{s.category === 'monthly' ? '/mo' : ''}
                            </span>
                            {s.regularPrice && (
                              <span className="line-through text-slate-500 font-mono text-[11px]">
                                {formatINR(s.regularPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleService(s.id)}
                          className={`touch-target shrink-0 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border transition-[background-color,border-color,transform] duration-150 cursor-pointer active:scale-95 ${
                            isAdded
                              ? 'border-emerald-400 bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                              : 'border-white/25 bg-white/5 text-white hover:border-emerald-400'
                          }`}
                          aria-label={isAdded ? `Remove ${s.name} from quote` : `Add ${s.name} to quote`}
                        >
                          {isAdded ? '✓ Added' : '+ Add'}
                        </button>
                      </div>

                      <p className="type-body text-xs text-slate-300 leading-relaxed font-sans">
                        {s.desc}
                      </p>

                      <div className="pt-1 flex items-center justify-between type-meta font-mono">
                        <a
                          href={getWhatsAppUrl(`Hi! I saw the "${s.name}" service on your website and I'd like to get it for my business. Can you share the next steps?`)}
                          onClick={(e) => handleWhatsAppInstantClick(e, `Hi! I saw the "${s.name}" service on your website and I'd like to get it for my business. Can you share the next steps?`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-300 font-bold flex items-center gap-1 border-b border-cyan-400/30 pb-0.5"
                        >
                          <span>Order on WhatsApp</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>

                        <span className="text-slate-300">
                          ⏱ {s.turnaround}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BUNDLES (Most Popular First) ================= */}
        {activeTab === 'bundles' && (
          <div className="space-y-5 text-left relative">
            <div className="stagger-mobile">
              <h2 className="type-h2 text-white">
                Predictable Investment.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1 font-sans">
                Pay 30% to start, 70% when you're happy. Fixed prices, you own everything.
              </p>
            </div>

            {/* Individual Cards Stacked with Most Popular First */}
            <div className="stagger-mobile space-y-4">
              {mobileBundles.map((b: BundleItem) => {
                const isShop = b.popular;
                const deliveryBalance = b.numericPrice - b.numericAdvance;

                return (
                  <div
                    key={b.id}
                    className={`rounded-3xl p-5 space-y-3.5 transition-all duration-200 relative ${
                      isShop
                        ? 'bg-gradient-to-b from-[#0c1833]/90 via-[#0a1226]/90 to-[#070b16]/95 border-2 border-cyan-400/60 shadow-[0_15px_40px_-10px_rgba(0,140,255,0.3)] ring-1 ring-cyan-400/30'
                        : 'bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-white/[0.015] backdrop-blur-2xl border border-white/10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.6)]'
                    }`}
                  >
                    {/* Featured / Introductory Badges */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-300 font-mono text-[9px] font-bold tracking-wider uppercase">
                        Introductory pricing
                      </span>
                      {isShop && (
                        <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-mono text-[9px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,245,255,0.6)] flex items-center gap-1">
                          <span>★</span>
                          <span>MOST POPULAR</span>
                        </span>
                      )}
                    </div>

                    {/* Top Row: Plan name and timeline */}
                    <div className="flex items-center justify-between type-meta pt-0.5 font-mono">
                      <span className="text-xs font-mono font-medium tracking-wider uppercase text-slate-200">
                        {b.name.replace(' Bundle', '')}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-200">
                        ⏱ {b.timeline}
                      </span>
                    </div>

                    {/* Price Block with Optional Strikethrough */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                          {b.price}
                        </span>
                        {b.regularPrice && (
                          <span className="line-through text-slate-500 font-mono text-xs">
                            {formatINR(b.regularPrice)}
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">/ package</span>
                      </div>

                      {/* Two clean lines for payment breakdown */}
                      <div className="mt-2 space-y-0.5 text-xs font-sans border-l-2 border-emerald-400/60 pl-2">
                        <div className="text-emerald-400 font-medium">
                          Pay {formatINR(b.numericAdvance)} to start
                        </div>
                        <div className="text-slate-300">
                          {formatINR(deliveryBalance)} on delivery
                        </div>
                      </div>
                    </div>

                    <p className="type-body text-xs text-slate-200 leading-relaxed font-sans">
                      {b.tagline}
                    </p>

                    <div className="w-full h-[1px] bg-white/10" />

                    {/* Features list with circular checks */}
                    <div className="space-y-2 font-sans text-xs text-slate-200">
                      {b.included.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isShop
                                ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                : 'bg-white/[0.08] text-emerald-400 border border-white/20'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{inc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href={getWhatsAppUrl(`Hi! I'm interested in the "${b.name}" (${b.price}) package I saw on your website. Could you let me know what you'd need from my side to get started?`)}
                        onClick={(e) =>
                          handleWhatsAppInstantClick(
                            e,
                            `Hi! I'm interested in the "${b.name}" (${b.price}) package I saw on your website. Could you let me know what you'd need from my side to get started?`
                          )
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-3 px-5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                          isShop
                            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                        aria-label={`Choose ${b.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Choose Plan ↗</span>
                      </a>

                      <button
                        onClick={() => {
                          setSelectedServices([b.id]);
                          switchTab('quote');
                        }}
                        className="text-xs font-mono text-slate-300 hover:text-cyan-300 py-1 text-center cursor-pointer"
                        aria-label={`Customize ${b.name} in quote calculator`}
                      >
                        Customize in Quote Calculator →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: DEMOS / PROJECTS ================= */}
        {activeTab === 'demos' && (
          <div className="space-y-5 text-left">
            <div className="stagger-mobile">
              <h2 className="type-h2 text-white">
                Live Working Projects.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1 font-sans">
                Real client work running live in production.
              </p>
            </div>

            {/* Type Filter */}
            <div className="stagger-mobile flex items-center gap-5 border-b border-white/15 pb-2 type-meta uppercase font-mono">
              {(['ALL', 'WEBSITE', 'MOBILE WEBAPP'] as const).map((t) => {
                const isSelected = selectedProjectsType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedProjectsType(t)}
                    className={`touch-target py-2 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
                      isSelected
                        ? 'border-cyan-400 text-white font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'ALL' ? `All (${PROJECTS.length})` : t === 'WEBSITE' ? 'Websites' : 'Mobile Apps'}
                  </button>
                );
              })}
            </div>

            {/* Projects Feed */}
            <div className="stagger-mobile border-t border-b border-white/15 divide-y divide-white/10">
              {PROJECTS
                .filter((p: ProjectItem) => selectedProjectsType === 'ALL' || p.type === selectedProjectsType)
                .map((p: ProjectItem) => (
                  <div key={p.index} className="py-5 space-y-3 text-left">
                    <div className="flex items-center justify-between type-meta font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{p.type}</span>
                        {p.tag && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[9px]">
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span>ONLINE</span>
                      </span>
                    </div>

                    {/* Thumbnail Slot / Neutral Browser Frame Placeholder */}
                    <div className="rounded-xl overflow-hidden border border-white/15 bg-black/60">
                      <div className="px-3 py-1.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500/70" />
                          <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                        </div>
                        <span className="truncate max-w-[180px]">{p.liveUrl.replace('https://', '')}</span>
                      </div>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full aspect-[16/9] object-cover" loading="lazy" />
                      ) : (
                        <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#0c1322] to-[#070b14] flex flex-col items-center justify-center p-4 text-center">
                          <Globe className="w-6 h-6 text-emerald-400 mb-1" />
                          <span className="text-xs font-sans font-semibold text-white">{p.name}</span>
                          <span className="text-[11px] font-mono text-slate-400 mt-0.5">{p.category}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="type-h3 text-white">
                      {p.name}
                    </h3>
                    
                    <p className="type-body text-xs text-slate-200 leading-relaxed font-sans">
                      {p.summary}
                    </p>

                    {/* Simple Outcome Features */}
                    <div className="space-y-1 font-sans text-xs text-slate-200">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Direct Launch Actions */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1"
                        aria-label={`Open ${p.name} live demo`}
                      >
                        <span>Open Live Demo</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <a
                        href={getWhatsAppUrl(`Hi! I tested your live demo for "${p.name}" on the website and really like it. I'm looking for something similar for my business—can we discuss details?`)}
                        onClick={(e) => handleWhatsAppInstantClick(e, `Hi! I tested your live demo for "${p.name}" on the website and really like it. I'm looking for something similar for my business—can we discuss details?`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-target p-2.5 border border-white/20 text-emerald-400 hover:text-white"
                        title="Inquire on WhatsApp"
                        aria-label="Inquire on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: QUOTE / ESTIMATOR ================= */}
        {activeTab === 'quote' && (
          <div className="space-y-5 text-left">
            <div className="stagger-mobile">
              <h2 className="type-h2 text-white">
                Your quote.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1 font-sans">
                Tap services to build your customized proposal in real time.
              </p>
            </div>

            {/* Quick 1-Tap Presets */}
            <div className="stagger-mobile space-y-2">
              <span className="type-meta text-slate-300 font-semibold block font-mono">
                BUSINESS PRESETS:
              </span>
              <div className="grid grid-cols-2 gap-2 type-meta font-mono">
                <button
                  onClick={() => setSelectedServices(['bundle-shop'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🏪 Cafe / Retail
                </button>
                <button
                  onClick={() => setSelectedServices(['clinic-scheduling', 'whatsapp-bot', 'google-review-qr'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🩺 Clinic / Salon
                </button>
                <button
                  onClick={() => setSelectedServices(['membership-system', 'website-1page', 'whatsapp-bot'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🏋️ Gym / Fitness
                </button>
                <button
                  onClick={() => setSelectedServices(['bundle-starter'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🚀 Starter Promo
                </button>
              </div>
            </div>

            {/* Service Toggle Checklist */}
            <div className="stagger-mobile space-y-2 pt-2">
              <span className="type-meta text-slate-200 font-semibold block font-mono">
                CUSTOMIZE SERVICES ({selectedServices.length} SELECTED):
              </span>

              <div className="border-t border-b border-white/15 divide-y divide-white/10">
                {mobileServicesList.map((s) => {
                  const isSelected = selectedServices.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`py-3 px-2 flex items-start justify-between gap-3 cursor-pointer transition-[background-color,border-color] duration-150 ${
                        isSelected
                          ? 'border-l-2 border-emerald-400 bg-white/[0.05] text-white pl-2.5'
                          : 'border-l-2 border-transparent text-slate-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div
                          className={`w-4 h-4 border flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                            isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-500 bg-white/5'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-sans font-bold leading-snug">{s.name}</div>
                          <div className="type-meta text-slate-300 mt-0.5 font-mono">
                            ⏱ {s.turnaround}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 text-right mt-0.5">
                        {formatINR(s.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What's Included Card */}
            <div className="border-l-2 border-emerald-400 pl-3 py-2 bg-white/[0.02] border border-white/10 rounded-r-xl text-xs font-sans text-slate-200">
              <span className="font-bold text-emerald-400 block font-mono mb-1">What's included:</span>
              <p>2 rounds of changes, free support after delivery, and you own everything with no monthly lock-in.</p>
            </div>
          </div>
        )}

      </main>

      {/* STICKY BOTTOM BAR FOR QUOTE BUILDER (Requirement 7: Total + Confirm & send on WhatsApp) */}
      {activeTab === 'quote' && (
        <div className="fixed bottom-[calc(3.8rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-[#0a101d]/95 backdrop-blur-xl border-t border-emerald-500/30 px-4 py-2.5 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Investment</div>
              <div className="text-lg font-mono font-extrabold text-white leading-tight">
                {formatINR(total)}
              </div>
              <div className="text-[10px] font-sans text-emerald-400">
                Pay {formatINR(advance)} to start
              </div>
            </div>

            <a
              href={getWaQuoteUrl()}
              onClick={(e) => handleWhatsAppInstantClick(e, getWaQuoteMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-2.5 px-4 text-xs font-bold shrink-0"
              aria-label="Confirm and send quote on WhatsApp"
            >
              <span>Confirm &amp; Send on WhatsApp</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* 3. PERMANENTLY FIXED BOTTOM NAVIGATION DOCK */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080c14]/95 backdrop-blur-[20px] saturate-[190%] border-t border-white/15 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around select-none shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => switchTab('home')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'home' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Home"
        >
          <Sparkles className="w-5 h-5" />
          <span className="type-meta text-[10px]">Home</span>
        </button>

        <button
          onClick={() => switchTab('services')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'services' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Services"
        >
          <Layers className="w-5 h-5" />
          <span className="type-meta text-[10px]">Services</span>
        </button>

        <button
          onClick={() => switchTab('bundles')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'bundles' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Bundles"
        >
          <Package className="w-5 h-5" />
          <span className="type-meta text-[10px]">Bundles</span>
        </button>

        <button
          onClick={() => switchTab('demos')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'demos' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Demos"
        >
          <Smartphone className="w-5 h-5" />
          <span className="type-meta text-[10px]">Demos</span>
        </button>

        <button
          onClick={() => switchTab('quote')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'quote' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Quote"
        >
          <Calculator className="w-5 h-5" />
          <span className="type-meta text-[10px]">Quote</span>
        </button>
      </nav>
    </div>
  );
};
