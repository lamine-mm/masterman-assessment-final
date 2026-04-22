"use client";

interface ProgressBarProps {
  currentPage: number; // 1-based
  totalPages: number;
  moduleLabel?: string;
}

export function ProgressBar({
  currentPage,
  totalPages,
  moduleLabel,
}: ProgressBarProps) {
  const percent = Math.round((currentPage / totalPages) * 100);

  return (
    <div className="w-full py-2.5 sm:py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        {moduleLabel ? (
          <span className="text-label truncate">{moduleLabel}</span>
        ) : (
          <span />
        )}
        <span className="text-label flex-shrink-0 tabular-nums">{percent}%</span>
      </div>
      <div className="h-[2px] w-full bg-ink-700 overflow-hidden">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
