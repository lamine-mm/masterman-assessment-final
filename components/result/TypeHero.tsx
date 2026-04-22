interface TypeHeroProps {
  typeCode: string; // e.g. "AGSC"
  typeName: string; // e.g. "The Anchored Shepherd"
}

export function TypeHero({ typeCode, typeName }: TypeHeroProps) {
  return (
    <div className="text-center px-1">
      <div
        className="font-display font-normal tracking-[0.18em] sm:tracking-[0.22em] text-primary"
        style={{ fontSize: "clamp(3.25rem, 16vw, 5.5rem)", lineHeight: 1.05 }}
        aria-label={`Your type: ${typeCode}`}
      >
        {typeCode.split("").join(" ")}
      </div>

      <p className="mt-3 font-display text-[28px] sm:text-[32px] font-medium text-foreground leading-[1.1] tracking-[-0.015em]">
        {typeName}
      </p>
    </div>
  );
}
