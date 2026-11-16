'use client';

import { useState } from 'react';

export default function StonesOfItalyLogo({ size = 52, className = '' }: { size?: number; className?: string }) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden border-2 border-gold/60 bg-[#15151a] shadow-lg shadow-gold/10 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="Stones of Italy, Inc. logo"
    >
      {!errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/stones-logo.jpg"
          alt="Stones of Italy, Inc."
          width={size}
          height={size}
          className="h-full w-full object-cover block"
          onError={() => setErrored(true)}
        />
      ) : (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Stones of Italy, Inc.">
          <circle cx="50" cy="50" r="46" fill="#120f0c" stroke="#c5a059" strokeWidth="3" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#c5a059" strokeWidth="1" opacity="0.6" />
          <text x="50" y="46" textAnchor="middle" fontFamily="Georgia, 'Cormorant Garamond', serif" fontSize="18" fill="#c5a059" fontWeight="700" letterSpacing="2">SOI</text>
          <text x="50" y="64" textAnchor="middle" fontFamily="Georgia, 'Cormorant Garamond', serif" fontSize="6.5" fill="#e9e2d5" letterSpacing="1">STONES OF ITALY</text>
        </svg>
      )}
    </div>
  );
}
