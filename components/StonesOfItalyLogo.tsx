export default function StonesOfItalyLogo({ size = 52, className = '' }: { size?: number; className?: string }) {
  const id = `soi-${size}`;
  return (
    <div className={className} style={{ width: size, height: size }} aria-label="Stones of Italy, Inc. logo">
      <svg viewBox="0 0 200 200" width={size} height={size} role="img">
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EED599" />
            <stop offset="45%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#9A7730" />
          </linearGradient>
          <pattern id={`${id}-carrara`} patternUnits="userSpaceOnUse" width="80" height="80">
            <rect width="80" height="80" fill="#F7F4EF" />
            <path d="M0 18 C 20 10, 30 28, 55 20 S 75 35, 80 30" stroke="#CFC7BE" strokeWidth="2.2" fill="none" opacity="0.8" />
            <path d="M-5 45 C 15 38, 35 55, 50 48 S 70 60, 85 52" stroke="#D9D2C8" strokeWidth="1.6" fill="none" opacity="0.9" />
            <path d="M5 65 C 25 58, 40 72, 58 66 S 78 74, 82 70" stroke="#B8B0A6" strokeWidth="1.2" fill="none" opacity="0.55" />
            <path d="M10 30 C 28 26, 42 34, 60 28" stroke="#C5A059" strokeWidth="0.9" fill="none" opacity="0.35" />
            <path d="M18 58 C 34 54, 48 62, 66 56" stroke="#C5A059" strokeWidth="0.7" fill="none" opacity="0.25" />
          </pattern>
          <path id={`${id}-topArc`} d="M 28,100 A 72,72 0 0,1 172,100" />
          <path id={`${id}-botArc`} d="M 172,108 A 72,72 0 0,1 28,108" />
        </defs>

        <circle cx="100" cy="100" r="96" fill="#121212" stroke={`url(#${id}-gold)`} strokeWidth="2.5" />
        <circle cx="100" cy="100" r="86" fill="none" stroke="#C5A059" strokeWidth="0.8" opacity="0.9" />
        <circle cx="100" cy="100" r="69" fill="#161616" stroke={`url(#${id}-gold)`} strokeWidth="1.2" />

        <text fontFamily='"Cormorant Garamond", "Playfair Display", serif' fontSize="12.5" fontWeight="600" fill="#F8F7F4" letterSpacing="2.6">
          <textPath href={`#${id}-topArc`} startOffset="50%" textAnchor="middle">STONES OF ITALY, INC.</textPath>
        </text>
        <text fontFamily='"Cormorant Garamond", "Playfair Display", serif' fontSize="10.2" fontWeight="600" fill="#C5A059" letterSpacing="2.1">
          <textPath href={`#${id}-botArc`} startOffset="50%" textAnchor="middle">VERO BEACH • EST. 2001</textPath>
        </text>

        {/* Diamond stars */}
        <path d="M 20 104 L 24 100 L 28 104 L 24 108 Z" fill="#C5A059" />
        <path d="M 172 104 L 176 100 L 180 104 L 176 108 Z" fill="#C5A059" />

        {/* Italy silhouette (incl. Sicily & Sardinia) */}
        <g transform="translate(63,36) scale(0.74)">
          <path
            d="M52 8 C58 6 64 10 66 18 C70 28 76 34 80 44 C84 54 92 60 96 70 C100 80 104 88 98 96 C92 104 84 102 78 110 C72 118 80 126 88 132 C96 138 104 130 108 138 C112 146 104 152 94 154 C84 156 74 152 64 146 C56 140 52 130 48 120 C44 110 38 104 34 94 C30 84 24 78 20 66 C16 54 22 42 30 30 C38 18 44 12 52 8 Z"
            fill={`url(#${id}-carrara)`}
            stroke="#C5A059"
            strokeWidth="1.5"
          />
          {/* Sardinia */}
          <path d="M10 74 C14 66 22 66 26 74 C30 82 24 90 16 92 C8 90 6 82 10 74 Z" fill={`url(#${id}-carrara)`} stroke="#C5A059" strokeWidth="1.3" />
          {/* Sicily */}
          <path d="M74 150 C84 144 96 146 102 154 C108 162 102 170 92 172 C82 170 70 160 74 150 Z" fill={`url(#${id}-carrara)`} stroke="#C5A059" strokeWidth="1.3" />
          {/* subtle vein accents */}
          <path d="M40 40 C55 50 70 55 85 78" stroke="#C5A059" strokeWidth="0.8" fill="none" opacity="0.35" />
          <path d="M30 70 C42 85 54 95 66 120" stroke="#BEB6AB" strokeWidth="1" fill="none" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
