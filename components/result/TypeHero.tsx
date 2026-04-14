interface TypeHeroProps {
  typeCode: string; // e.g. "AGSC"
  typeName: string; // e.g. "The Anchored Shepherd"
}

export function TypeHero({ typeCode, typeName }: TypeHeroProps) {
  return (
    <div className="text-center px-1">
      <div
        className="font-sans font-bold tracking-[0.22em] sm:tracking-[0.25em] text-primary"
        style={{ fontSize: "clamp(3.25rem, 16vw, 5.5rem)", lineHeight: 1.05 }}
        aria-label={`Your type: ${typeCode}`}
      >
        {typeCode.split("").join(" ")}
      </div>

      <p className="mt-2 sm:mt-2.5 text-2xl font-medium text-foreground leading-tight">
        {typeName}
      </p>
    </div>
  );
}
