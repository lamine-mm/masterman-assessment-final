interface StageBadgeProps {
  stage: 1 | 2 | 3 | 4;
  name: string;
  meaning: string;
}

export function StageBadge({ stage, name, meaning }: StageBadgeProps) {
  return (
    <div className="glass-subtle rounded-xl px-4 sm:px-5 py-4 flex items-start gap-3 sm:gap-4 border border-white/[0.08]">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-primary/5"
        aria-hidden="true"
      >
        <span className="text-primary font-bold text-sm tabular-nums">
          {stage}
        </span>
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-label mb-1">Your Stage</p>
        <p className="font-semibold text-foreground text-[15px] leading-snug">
          Stage {stage} — {name}
        </p>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {meaning}
        </p>
      </div>
    </div>
  );
}
