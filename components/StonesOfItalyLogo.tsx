export default function StonesOfItalyLogo({ size = 52, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden border-2 border-gold/60 bg-obsidian/40 shadow-lg shadow-gold/10 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Stones of Italy, Inc. logo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/stones-of-italy.png"
        alt="Stones of Italy, Inc."
        width={size}
        height={size}
        className="w-full h-full object-cover block"
      />
    </div>
  );
}
