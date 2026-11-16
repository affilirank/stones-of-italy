export default function StonesOfItalyLogo({ size = 52, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Stones of Italy, Inc. logo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/stones-logo.jpg"
        alt="Stones of Italy, Inc."
        width={size}
        height={size}
        className="h-full w-full object-contain block"
      />
    </div>
  );
}
