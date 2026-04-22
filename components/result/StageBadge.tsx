interface StageBadgeProps {
  stage: 1 | 2 | 3 | 4;
  name: string;
  meaning: string;
}

export function StageBadge({ stage, name, meaning }: StageBadgeProps) {
  return (
    <div className="surface rounded-md px-4 sm:px-5 py-4 flex items-start gap-3 sm:gap-4 border-t border-t-primary">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full border border-primary flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="font-display text-primary text-lg tabular-nums">
          {stage}
        </span>
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="eyebrow mb-1.5">Your Stage</p>
        <p className="font-display text-[20px] font-medium text-foreground leading-snug tracking-[-0.015em]">
          Stage {stage} — {name}
        </p>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {meaning}
        </p>
      </div>
    </div>
  );
}
