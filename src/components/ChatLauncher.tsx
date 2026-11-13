import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface ChatLauncherProps {
  onOpenChat: () => void;
  isOpen?: boolean;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({
  onOpenChat,
  isOpen = false,
}) => {
  const [teaserVisible, setTeaserVisible] = useState(true);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Gentle entrance for the teaser card
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasDismissed) setTeaserVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [hasDismissed]);

  const handleDismissTeaser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTeaserVisible(false);
    setHasDismissed(true);
  };

  // If chat drawer is already open, hide the launcher to avoid overlap
  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* 1. Teaser Toast Card (Simple, Friendly, Helpful English) */}
      {teaserVisible && (
        <div
          onClick={onOpenChat}
          className="pointer-events-auto mb-3 max-w-[280px] sm:max-w-[320px] p-4 rounded-2xl bg-[#0d1117]/92 hover:bg-[#131923]/95 border border-white/10 hover:border-white/20 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),0_0_1px_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group relative animate-in fade-in slide-in-from-bottom-2"
        >
          {/* Subtle Dismiss Button */}
          <button
            onClick={handleDismissTeaser}
            className="absolute top-2.5 right-2.5 p-1 text-neutral-400 hover:text-neutral-100 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss"
            aria-label="Dismiss note"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header Row: Title & Active Green Dot */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath shrink-0" />
            <h4 className="text-[13px] font-semibold text-neutral-100 font-sans tracking-tight">
              Have a question about your project?
            </h4>
          </div>

          {/* Descriptive Text in Clear, Welcoming English */}
          <p className="text-[12px] text-neutral-300 leading-relaxed font-sans pr-2">
            Ask us anything — get exact package prices, delivery times, or advice on what website or tool your business needs.
          </p>

          {/* Quiet Bottom Action */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
              Ask a question →
            </span>
            <span className="text-neutral-400 tracking-wider text-[10px] uppercase">
              Instant Reply
            </span>
          </div>

          {/* Japanese Washi Arrow Pointer */}
          <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-[#0d1117] border-r border-b border-white/10 transform rotate-45" />
        </div>
      )}

      {/* 2. Floating Pill Launcher ("Need Help? Ask Us") */}
      <button
        onClick={onOpenChat}
        className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d1117]/90 hover:bg-[#131923]/95 border border-white/12 hover:border-emerald-400/40 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),0_0_1px_1px_rgba(255,255,255,0.06)_inset] text-neutral-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-2xl"
        title="Need Help? Ask Us"
        aria-label="Need Help? Ask Us"
      >
        {/* Soft Jade Breathing Indicator */}
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />

        <HelpCircle className="w-3.5 h-3.5 text-emerald-400/90 group-hover:text-emerald-300 transition-colors shrink-0" />
        <span className="font-sans font-semibold text-xs tracking-tight text-neutral-100 group-hover:text-white transition-colors">
          Need Help? Ask Us
        </span>
      </button>
    </div>
  );
};
