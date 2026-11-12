import React, { useId } from 'react';

interface KaizenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export const KaizenLogo: React.FC<KaizenLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  theme = 'dark',
}) => {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const gradientId = `kaizenBlueGrad_${safeId}`;

  const isHero = size === 'hero';
  const isLg = size === 'lg';
  const isSm = size === 'sm';
  const isLight = theme === 'light';

  const iconSize = isHero ? 'w-24 h-24 md:w-32 md:h-32' : isLg ? 'w-16 h-16' : isSm ? 'w-9 h-9' : 'w-12 h-12';
  const titleSize = isHero
    ? 'text-4xl sm:text-6xl md:text-7xl tracking-[0.18em]'
    : isLg
    ? 'text-3xl md:text-4xl tracking-[0.16em]'
    : isSm
    ? 'text-lg md:text-xl tracking-[0.14em]'
    : 'text-2xl md:text-3xl tracking-[0.16em]';

  const subSize = isHero
    ? 'text-xs sm:text-sm md:text-base tracking-[0.45em]'
    : isLg
    ? 'text-[11px] md:text-xs tracking-[0.35em]'
    : isSm
    ? 'text-[8px] tracking-[0.25em]'
    : 'text-[10px] md:text-xs tracking-[0.35em]';

  const taglineSize = isHero
    ? 'text-xs sm:text-sm tracking-[0.3em]'
    : 'text-[10px] sm:text-xs tracking-[0.25em]';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Upper Logo Mark & Wordmark Row */}
      <div className={`flex items-center justify-center ${isSm ? 'gap-2.5' : 'gap-4 sm:gap-6 md:gap-8'}`}>
        {/* K Geometric Icon */}
        <div className={`relative flex items-center justify-center shrink-0 ${iconSize}`}>
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                {isLight ? (
                  <>
                    <stop offset="0%" stopColor="#0077ff" />
                    <stop offset="50%" stopColor="#0099ff" />
                    <stop offset="100%" stopColor="#0055dd" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#00f5ff" />
                    <stop offset="50%" stopColor="#00c8ff" />
                    <stop offset="100%" stopColor="#0077ff" />
                  </>
                )}
              </linearGradient>
            </defs>

            {/* Left Vertical Pillar of K */}
            <path
              d="M 22 15 L 42 15 L 42 105 L 22 105 Z"
              fill="currentColor"
              className={isLight ? 'text-slate-950 drop-shadow-sm' : 'text-white drop-shadow-md'}
            />

            {/* Cyan Diagonal Slash Cutting Across (Upper Arm of K) */}
            <path
              d="M 22 56 L 88 15 L 105 15 L 38 67 Z"
              fill={`url(#${gradientId})`}
              className="drop-shadow-[0_0_8px_rgba(0,245,255,0.85)]"
            />

            {/* Lower Leg of K */}
            <path
              d="M 42 66 L 98 105 L 76 105 L 32 73 Z"
              fill="currentColor"
              className={isLight ? 'text-slate-950 drop-shadow-sm' : 'text-white drop-shadow-md'}
            />
          </svg>
        </div>

        {/* Vertical Divider Line */}
        <div
          className={`w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent shrink-0 ${
            isHero ? 'h-24 md:h-32' : isLg ? 'h-16' : isSm ? 'h-9' : 'h-12'
          }`}
        />

        {/* Wordmark */}
        <div className="flex flex-col justify-center text-left">
          <div className={`font-display font-extrabold flex items-center leading-none ${isLight ? 'text-slate-950' : 'text-white'} ${titleSize}`}>
            <span>K</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 drop-shadow-[0_0_15px_rgba(0,229,255,0.7)] px-[0.04em]">
              Λ
            </span>
            <span>IZEN</span>
          </div>
          <div className={`font-display font-bold uppercase mt-1 md:mt-2 ${isLight ? 'text-slate-800' : 'text-slate-300'} ${subSize}`}>
            SOFTWARE AGENCY
          </div>
        </div>
      </div>

      {/* Decorative Glowing Accent Bar */}
      {!isSm && (
        <div className={`w-32 sm:w-44 md:w-56 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-3 sm:my-4 shadow-[0_0_12px_#00e5ff]`} />
      )}

      {/* Tagline */}
      {showTagline && (
        <div className={`font-display uppercase font-bold text-center tracking-[0.28em] ${isLight ? 'text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]' : 'text-slate-300/80'} ${taglineSize}`}>
          IDEAS TODAY, A BETTER TOMORROW.
        </div>
      )}
    </div>
  );
};
