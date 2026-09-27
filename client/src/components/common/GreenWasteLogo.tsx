import { useState } from 'react';

interface GreenWasteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  textColor?: string;
}

export default function GreenWasteLogo({
  className = '',
  size = 'md',
  showText = false,
  textColor = 'text-white'
}: GreenWasteLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    hero: 'w-24 h-24 sm:w-28 sm:h-28'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {!imgError ? (
        <div className={`${sizeMap[size]} shrink-0 rounded-full overflow-hidden bg-white/95 p-0.5 border-2 border-emerald-500/40 shadow-md flex items-center justify-center transition-transform duration-300 hover:scale-105`}>
          <img
            src="/green-waste-logo.png"
            alt="SwachhaEco Green Waste Logo"
            className="w-full h-full object-contain rounded-full"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg
          className={`${sizeMap[size]} shrink-0 transition-transform duration-300 hover:scale-105`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        {/* Outer Circular Glow / Halo */}
        <circle cx="50" cy="50" r="46" fill="#047857" fillOpacity="0.15" stroke="#10b981" strokeWidth="2.5" />
        
        {/* Inner Ring with Subtle Segments */}
        <circle cx="50" cy="50" r="38" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.7" />

        {/* Recycling Circular Arrow 1 (Top Right to Bottom) */}
        <path
          d="M50 16C68 16 82 30 82 48L87 43M82 48L77 43"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Recycling Circular Arrow 2 (Bottom to Top Left) */}
        <path
          d="M50 84C32 84 18 70 18 52L13 57M18 52L23 57"
          stroke="#059669"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Sprout Leaves Motif */}
        {/* Left Leaf */}
        <path
          d="M50 68C50 68 34 58 35 40C36 29 48 24 50 20C52 24 50 38 50 68Z"
          fill="url(#leafGrad1)"
        />

        {/* Right Flourishing Leaf */}
        <path
          d="M50 56C50 56 64 50 66 36C67 27 58 22 50 20C54 26 55 42 50 56Z"
          fill="url(#leafGrad2)"
        />

        {/* Central Stem */}
        <path
          d="M50 72C50 55 50 35 50 20"
          stroke="#047857"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Base Foundation Arc */}
        <path
          d="M36 74C40 76.5 45 78 50 78C55 78 60 76.5 64 74"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="leafGrad1" x1="35" y1="20" x2="50" y2="68" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="50" y1="20" x2="66" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6ee7b7" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      )}

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-[20px] font-bold tracking-tight ${textColor}`}>
              SwachhaEco
            </span>
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
          </div>
          <span className="text-[10px] tracking-wider uppercase text-emerald-400 font-medium">
            National Solid Waste Portal
          </span>
        </div>
      )}
    </div>
  );
}
