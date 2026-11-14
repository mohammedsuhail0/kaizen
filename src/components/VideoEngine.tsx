import React, { useEffect, useRef, useState, useCallback } from 'react';
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

    // Blue Tree Video + Kaizen Logo act as the preloader for ~2.0 seconds
    const preloaderTimer = setTimeout(() => {
      setBlueFading(true);
      onFinishPreload();
    }, 2000);

    // After 750ms dissolve into the pink tree video, pause blue video & drop layer
    const cleanupTimer = setTimeout(() => {
      setBlueGone(true);
      if (blueVid) blueVid.pause();
    }, 2800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
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
          poster="/japanese-zen-bg.webp"
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
            poster="/japanese-zen-bg.webp"
            autoPlay
            muted
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover object-center transform-gpu will-change-opacity transition-opacity duration-700 ease-out ${
              blueFading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Layer 3 (Preloader Logo): Centered High-Contrast Kaizen Logo over Blue Tree Video */}
        {!blueGone && (
          <div
            className={`absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ease-out px-4 ${
              blueFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* Glass Container for Hero Logo */}
            <div className="transform scale-90 sm:scale-100 md:scale-105 p-6 sm:p-10 rounded-3xl bg-[#080c14]/70 backdrop-blur-md border border-cyan-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(0,245,255,0.15)] flex flex-col items-center">
              <KaizenLogo size="hero" showTagline={true} theme="dark" />
            </div>
          </div>
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
