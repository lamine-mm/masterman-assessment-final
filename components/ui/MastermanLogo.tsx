interface MastermanLogoProps {
  size?: number;
  className?: string;
}

/**
 * Masterman crown-M logo — pure SVG, no external assets required.
 * Matches the gold crown-over-M mark with the white star accent.
 */
export function MastermanLogo({ size = 48, className }: MastermanLogoProps) {
  const h = Math.round(size * 1.22);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 100 122"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Masterman"
    >
      {/* ── Crown (light gold) ─────────────────────────────────────────── */}
      {/* Three upward spikes from a shared base */}
      <path
        d="
          M10 52
          L10 36 L28 8  L42 36
          L50 20 L58 36
          L72 8  L90 36 L90 52
          Z
        "
        fill="#C9A87E"
      />

      {/* ── M body (darker gold) ───────────────────────────────────────── */}
      <path
        d="M10 60 L28 104 L50 76 L72 104 L90 60 Z"
        fill="#8B6B14"
      />

      {/* ── White 4-point star at the crown / M junction ───────────────── */}
      <path
        d="M50 52 L55 60 L50 68 L45 60 Z"
        fill="white"
      />
    </svg>
  );
}
