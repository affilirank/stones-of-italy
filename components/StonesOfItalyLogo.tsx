export default function StonesOfItalyLogo({ size = 52, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }} aria-label="Stones of Italy, Inc. logo">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EED599" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#8C6621" />
          </linearGradient>
          <pattern id="marblePattern" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 20 Q 30 10 60 40 T 100 80" stroke="rgba(197,160,89,0.3)" strokeWidth="1" fill="none" />
            <path d="M20 100 Q 50 60 80 90 T 120 10" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
          </pattern>
          <path id="textPathTop" d="M 25, 100 A 75,75 0 1,1 175,100" fill="none" />
          <path id="textPathBottom" d="M 175, 100 A 75,75 0 0,1 25,100" fill="none" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="#121212" stroke="url(#goldGrad)" strokeWidth="3" />
        <circle cx="100" cy="100" r="90" fill="none" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="2,2" />
        <circle cx="100" cy="100" r="68" fill="#1A1A1A" stroke="url(#goldGrad)" strokeWidth="1.5" />
        <g transform="translate(68, 48) scale(0.65)">
          <path d="M38 12 C40 10 45 15 48 20 C52 28 58 35 62 42 C65 48 72 55 75 62 C78 70 85 75 80 82 C75 88 68 85 62 92 C58 96 65 105 72 108 C78 110 85 102 90 108 C93 112 88 118 80 120 C72 122 62 120 52 115 C45 110 40 102 38 95 C36 88 32 82 28 75 C25 68 20 62 18 52 C15 42 22 30 28 22 Z" fill="url(#marblePattern)" stroke="url(#goldGrad)" strokeWidth="2" />
          <circle cx="85" cy="115" r="3" fill="#C5A059" />
          <circle cx="22" cy="70" r="2.5" fill="#C5A059" />
        </g>
        <text fontFamily="'Cormorant Garamond', serif" fontSize="11.5" fontWeight="700" fill="#F8F7F4" letterSpacing="2.5">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">STONES OF ITALY, INC.</textPath>
        </text>
        <text fontFamily="'Cormorant Garamond', serif" fontSize="9.5" fontWeight="600" fill="#C5A059" letterSpacing="1.8">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">VERO BEACH • EST. 2001</textPath>
        </text>
        <path d="M 22 100 L 25 97 L 28 100 L 25 103 Z" fill="#C5A059" />
        <path d="M 172 100 L 175 97 L 178 100 L 175 103 Z" fill="#C5A059" />
      </svg>
    </div>
  );
}
