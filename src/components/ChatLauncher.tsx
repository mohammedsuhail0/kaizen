import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface ChatLauncherProps {
  onOpenChat: () => void;
  isOpen?: boolean;
  activeSection?: string;
}

const TEASER_SESSION_KEY = 'kaizen_help_teaser_dismissed';

export const ChatLauncher: React.FC<ChatLauncherProps> = ({
  onOpenChat,
  isOpen = false,
  activeSection = 'hero',
}) => {
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [isPricingInView, setIsPricingInView] = useState(false);

  // Check if pricing or quote sections are in view or active
  useEffect(() => {
    const isPricingSection =
      activeSection === 'bundles' ||
      activeSection === 'quotation' ||
      activeSection === 'estimator';
    setIsPricingInView(isPricingSection);
  }, [activeSection]);

  // Show the popup ONLY ONCE per session, after ~20 seconds, and not on screens under 768px
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if dismissed or already shown in this session
    const hasBeenDismissed = sessionStorage.getItem(TEASER_SESSION_KEY);
    if (hasBeenDismissed) return;

    // Do not show on screens under 768px
    if (window.innerWidth < 768) return;

    const timer = setTimeout(() => {
      // Re-check width and session storage before showing
      if (window.innerWidth >= 768 && !sessionStorage.getItem(TEASER_SESSION_KEY)) {
        setTeaserVisible(true);
        sessionStorage.setItem(TEASER_SESSION_KEY, 'shown');
      }
    }, 20000); // ~20s delay

    return () => clearTimeout(timer);
  }, []);

  const handleDismissTeaser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTeaserVisible(false);
    sessionStorage.setItem(TEASER_SESSION_KEY, 'dismissed');
  };

  // If chat drawer is open, hide floating launcher to prevent overlap
  if (isOpen) return null;

  // Never show popup while pricing or quotation sections are in view, or on screens under 768px
  const canShowPopup = teaserVisible && !isPricingInView;

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* 1. Teaser Toast Card: Hidden on screens under 768px, shown once after ~20s */}
      {canShowPopup && (
        <div
          onClick={onOpenChat}
          className="hidden md:block pointer-events-auto mb-3 max-w-[320px] p-4 rounded-2xl bg-[#0d1117]/95 hover:bg-[#131923] border border-white/15 hover:border-white/25 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_1px_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group relative animate-in fade-in slide-in-from-bottom-2"
        >
          {/* Subtle Dismiss Button */}
          <button
            onClick={handleDismissTeaser}
            className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss question note"
            aria-label="Dismiss question note"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header Row: Title & Active Green Dot */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath shrink-0" />
            <h4 className="text-[13px] font-semibold text-white font-sans tracking-tight">
              Have a question about your project?
            </h4>
          </div>

          {/* Descriptive Text in Clear, Welcoming English */}
          <p className="text-[12px] text-slate-200 leading-relaxed font-sans pr-2">
            Ask us anything — get exact package prices, delivery times, or advice on what website or tool your business needs.
          </p>

          {/* Action Link */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
              Ask a question →
            </span>
            <span className="text-slate-400 tracking-wider text-[10px] uppercase">
              Instant Reply
            </span>
          </div>

          {/* Pointer Tip */}
          <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-[#0d1117] border-r border-b border-white/15 transform rotate-45" />
        </div>
      )}

      {/* 2. Floating Pill Launcher: Single help prompt */}
      <button
        onClick={onOpenChat}
        className="pointer-events-auto flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#0d1117]/95 hover:bg-[#131923] border border-white/15 hover:border-emerald-400/50 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.7),0_0_1px_1px_rgba(255,255,255,0.08)_inset] text-neutral-100 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-2xl"
        title="Need Help? Ask Us"
        aria-label="Need Help? Ask Us"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0" />
        <HelpCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors shrink-0" />
        <span className="font-sans font-semibold text-xs tracking-tight text-white transition-colors">
          Need Help? Ask Us
        </span>
      </button>
    </div>
  );
};
