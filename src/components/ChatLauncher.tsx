import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

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

  // Gentle delayed entrance for the teaser card
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasDismissed) setTeaserVisible(true);
    }, 1400);
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
      {/* 1. Teaser Toast Card (Zen Frosted Editorial Note) */}
      {teaserVisible && (
        <div
          onClick={onOpenChat}
          className="pointer-events-auto mb-3 max-w-[280px] sm:max-w-[310px] p-4 rounded-2xl bg-[#0d1117]/90 hover:bg-[#131923]/95 border border-white/10 hover:border-white/20 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.65),0_0_1px_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group relative animate-in fade-in slide-in-from-bottom-2"
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

          {/* Header Row: Title & Studio Dot */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath shrink-0" />
            <h4 className="text-[13px] font-medium text-neutral-200 font-sans tracking-tight">
              Senior Solutions Architect
            </h4>
          </div>

          {/* Descriptive Text */}
          <p className="text-[12px] text-neutral-400 leading-relaxed font-sans pr-4">
            Explore custom packages, turnarounds, and turnkey engineering.
          </p>

          {/* Quiet Bottom Action */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-medium group-hover:text-emerald-300 transition-colors">
              Begin consultation →
            </span>
            <span className="text-neutral-300 tracking-wider text-[10px] uppercase">
              Online
            </span>
          </div>

          {/* Japanese Washi Arrow Pointer */}
          <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-[#0d1117] border-r border-b border-white/10 transform rotate-45" />
        </div>
      )}

      {/* 2. Floating Pill Launcher ("Kaizen Concierge") */}
      <button
        onClick={onOpenChat}
        className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0d1117]/85 hover:bg-[#131923]/95 border border-white/10 hover:border-white/20 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.55),0_0_1px_1px_rgba(255,255,255,0.06)_inset] text-neutral-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-2xl"
        title="Open Kaizen Concierge"
        aria-label="Open Kaizen Concierge"
      >
        {/* Soft Jade Breathing Indicator */}
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />

        <Sparkles className="w-3.5 h-3.5 text-neutral-300 group-hover:text-emerald-400 transition-colors duration-200" />
        <span className="font-sans font-medium text-xs tracking-tight text-neutral-200 group-hover:text-white transition-colors">
          Kaizen Concierge
        </span>
      </button>
    </div>
  );
};
