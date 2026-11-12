import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { KaizenLogo } from './KaizenLogo';

interface VideoEngineProps {
  isPreloading: boolean;
  onFinishPreload: () => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
}

export const VideoEngine: React.FC<VideoEngineProps> = ({
  isPreloading,
  onFinishPreload,
}) => {
  const blueVideoRef = useRef<HTMLVideoElement | null>(null);
  const pinkVideoRef = useRef<HTMLVideoElement | null>(null);
  const [blueFading, setBlueFading] = useState(false);
  const [blueGone, setBlueGone] = useState(false);
  const [progress, setProgress] = useState(15);

  const handleSkip = useCallback(() => {
    if (isPreloading && !blueFading) {
      setBlueFading(true);
      onFinishPreload();
      setTimeout(() => {
        setBlueGone(true);
        if (blueVideoRef.current) blueVideoRef.current.pause();
      }, 750);
    }
  }, [isPreloading, blueFading, onFinishPreload]);

  useEffect(() => {
    const blueVid = blueVideoRef.current;
    const pinkVid = pinkVideoRef.current;

    if (blueVid) blueVid.play().catch(() => {});
    if (pinkVid) pinkVid.play().catch(() => {});

    // Smooth simulated progress from 15% to 100%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + Math.floor(Math.random() * 18 + 12));
      });
    }, 180);

    // Blue Tree Video + Kaizen Logo act as the preloader for ~2.2 seconds
    const preloaderTimer = setTimeout(() => {
      setProgress(100);
      setBlueFading(true);
      onFinishPreload();
    }, 2200);

    // After 750ms dissolve into the pink tree video, pause blue video & drop layer
    const cleanupTimer = setTimeout(() => {
      setBlueGone(true);
      if (blueVid) blueVid.pause();
    }, 3000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(preloaderTimer);
      clearTimeout(cleanupTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSkip, onFinishPreload]);

  return (
    <>
      {/* Background Video Engine: Blue Tree Preloader + Kaizen Logo crossfading into Pink Tree Website */}
      <div
        onClick={handleSkip}
        className={`fixed inset-0 z-0 overflow-hidden bg-[#080c14] select-none ${
          isPreloading ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Layer 1 (Base): Looping Pink Sakura Tree */}
        <video
          ref={pinkVideoRef}
          src="/kaizen-pink.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center transform-gpu will-change-transform opacity-95 brightness-100 md:opacity-90 scale-[1.01]"
        />

        {/* Layer 2 (Preloader Video): Electric Blue Tree Video */}
        {!blueGone && (
          <video
            ref={blueVideoRef}
            src="/kaizen-blue.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover object-center transform-gpu will-change-opacity transition-opacity duration-700 ease-out ${
              blueFading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Layer 3 (Preloader Logo & Progress): Centered High-Contrast Kaizen Logo over Blue Tree */}
        {!blueGone && (
          <div
            className={`absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ease-out px-4 ${
              blueFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* Glass Container for Hero Logo */}
            <div className="transform scale-90 sm:scale-100 md:scale-105 p-6 sm:p-10 rounded-3xl bg-[#080c14]/70 backdrop-blur-md border border-cyan-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(0,245,255,0.15)] flex flex-col items-center">
              <KaizenLogo size="hero" showTagline={true} theme="dark" />

              {/* Progress Bar & Telemetry */}
              <div className="w-52 sm:w-64 mt-6 pt-5 border-t border-white/10 flex flex-col items-center">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(0,245,255,0.8)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="w-full flex justify-between items-center mt-2.5 text-[10px] font-mono tracking-widest text-slate-400">
                  <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    INITIALIZING
                  </span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ambient Preloader Skip Pill */}
        {isPreloading && !blueFading && (
          <button
            onClick={handleSkip}
            className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-cyan-400/40 text-cyan-200 hover:text-white text-xs font-mono tracking-widest transition-all cursor-pointer pointer-events-auto active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(0,245,255,0.2)]"
            title="Skip Intro"
            aria-label="Skip Intro"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>TAP TO ENTER →</span>
          </button>
        )}

        {/* Desktop Scrim */}
        <div
          className={`hidden md:block absolute inset-0 backdrop-blur-[1px] bg-gradient-to-r from-[#080c14]/92 via-[#080c14]/75 45% via-[#080c14]/35 75% to-transparent transition-opacity duration-700 ease-out pointer-events-none ${
            isPreloading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Mobile Scrim */}
        <div
          className={`md:hidden absolute inset-0 backdrop-blur-[1.5px] bg-gradient-to-b from-[#080c14]/80 via-[#080c14]/60 to-[#080c14]/85 transition-opacity duration-700 ease-out pointer-events-none ${
            isPreloading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Top/Bottom Ambient Vignette */}
        <div
          className={`hidden md:block absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 transition-opacity duration-700 ease-out pointer-events-none ${
            isPreloading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Ambient Atmospheric Radial Accents */}
        <div
          className={`absolute -top-10 -left-10 w-96 h-96 rounded-full pointer-events-none transition-opacity duration-700 ease-out bg-[radial-gradient(circle,_rgba(0,245,255,0.18)_0%,_transparent_70%)] ${
            !blueFading ? 'opacity-100' : 'opacity-30'
          }`}
        />
        <div
          className={`absolute -top-10 -right-10 w-96 h-96 rounded-full pointer-events-none transition-opacity duration-700 ease-out bg-[radial-gradient(circle,_rgba(244,114,182,0.16)_0%,_transparent_70%)] ${
            !blueFading ? 'opacity-80' : 'opacity-30'
          }`}
        />
      </div>
    </>
  );
};
