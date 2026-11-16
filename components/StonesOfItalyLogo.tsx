export default function StonesOfItalyLogo({ size = 52, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={className} style={{ width: size, height: size, flexShrink: 0 }} aria-label="Stones of Italy, Inc. logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/stones-of-italy.svg"
        alt="Stones of Italy, Inc."
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
