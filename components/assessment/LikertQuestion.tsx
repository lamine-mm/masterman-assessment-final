"use client";

import { cn } from "@/lib/utils";

interface LikertQuestionProps {
  id: string;
  text: string;
  value: number | null; // 1–5, null = unanswered
  onChange: (value: number) => void;
}

const OPTIONS = [
  { value: 1, label: "No" },
  { value: 2, label: "Not really" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Usually" },
  { value: 5, label: "Yes" },
];

export function LikertQuestion({ id, text, value, onChange }: LikertQuestionProps) {
  const labelId = `${id}-label`;
  return (
    <div className="space-y-5">
      <p
        id={labelId}
        className="font-display text-[20px] sm:text-[22px] leading-[1.3] text-foreground"
      >
        {text}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex gap-1 sm:gap-1.5 justify-between"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-1 min-w-0 flex-col items-center justify-center gap-2 rounded-sm border py-2.5 px-0.5 sm:px-1 transition-colors duration-200 min-h-11 touch-manipulation",
              value === opt.value
                ? "border-primary bg-primary/[0.1] text-primary"
                : "border-ink-600 bg-ink-900 text-muted-foreground hover:border-ink-500 hover:bg-ink-800 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                value === opt.value ? "border-primary" : "border-ink-500"
              )}
            >
              {value === opt.value && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-center leading-tight px-0.5">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
