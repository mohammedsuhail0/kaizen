import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Bot } from 'lucide-react';

interface AIConsultantFloatingTriggerProps {
  onOpenChat: () => void;
}

export const AIConsultantFloatingTrigger: React.FC<AIConsultantFloatingTriggerProps> = ({
  onOpenChat,
}) => {
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Auto-show speech bubble on load after a gentle delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasDismissed) setBubbleVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [hasDismissed]);

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBubbleVisible(false);
    setHasDismissed(true);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* 1. The Speech Bubble ("Message Type Thing" from the AI Consultant) */}
      {bubbleVisible && (
        <div
          onClick={onOpenChat}
          className="pointer-events-auto mb-3 max-w-[270px] sm:max-w-[310px] p-3.5 rounded-2xl rounded-br-sm bg-[#0a1224]/95 hover:bg-[#0e1a34] border border-cyan-400/40 hover:border-cyan-400/70 shadow-[0_16px_40px_-10px_rgba(0,180,255,0.4),0_0_1px_1px_rgba(255,255,255,0.15)_inset] backdrop-blur-2xl transition-[transform,opacity,border-color] duration-200 hover:-translate-y-0.5 cursor-pointer group relative animate-in fade-in slide-in-from-bottom-2"
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismissBubble}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss prompt"
            aria-label="Dismiss prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* AI Consultant Avatar & Status */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-[0_0_10px_rgba(0,245,255,0.4)]">
              <Bot className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xs text-white tracking-tight">
                AI Consultant
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Direct Speech Bubble Message */}
          <p className="text-xs text-slate-200 leading-snug font-sans">
            Have a question about pricing, turnarounds, or need a custom package?
          </p>

          {/* Call-to-Action Pill inside message */}
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10">
            <span className="font-mono text-[11px] font-bold text-cyan-300 uppercase tracking-wider group-hover:text-cyan-200 transition-colors">
              Tap to talk with me →
            </span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-400/15 border border-cyan-400/40 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              ASK ME
            </span>
          </div>

          {/* Speech Bubble Pointer / Arrow */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0a1224] border-r border-b border-cyan-400/40 transform rotate-45" />
        </div>
      )}

      {/* 2. The Main Floating Trigger Button ("ASK ME") */}
      <button
        onClick={onOpenChat}
        className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#091122]/95 via-[#0c1833]/95 to-[#091122]/95 hover:from-[#0d1a36] hover:to-[#0d1a36] border border-cyan-400/50 hover:border-cyan-300 shadow-[0_12px_32px_-6px_rgba(0,180,255,0.45),0_0_20px_rgba(0,245,255,0.2)] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 cursor-pointer group backdrop-blur-2xl"
        title="Ask AI Solutions Consultant"
        aria-label="Ask AI Solutions Consultant"
      >
        {/* Pulsing Radar Ring Indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
        </span>

        <Sparkles className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-12 transition-transform duration-200" />
        <span className="font-mono tracking-widest text-cyan-200 group-hover:text-white transition-colors">
          ASK ME
        </span>
        <MessageSquare className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
      </button>
    </div>
  );
};
