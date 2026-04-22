"use client";

import { cn } from "@/lib/utils";
import type { ScenarioOption } from "@/lib/types";

interface ScenarioQuestionProps {
  id: string;
  text: string;
  options: ScenarioOption[];
  value: number | null; // 0–3 (option index), null = unanswered
  onChange: (index: number) => void;
  married?: boolean; // when false, use labelHypothetical if present
}

export function ScenarioQuestion({
  id,
  text,
  options,
  value,
  onChange,
  married = true,
}: ScenarioQuestionProps) {
  const labelId = `${id}-scenario`;
  return (
    <div className="space-y-4">
      <div className="scenario-surface rounded-md p-4 sm:p-5 space-y-2 border-t border-t-primary/70">
        <span className="eyebrow">Scenario</span>
        <p
          id={labelId}
          className="font-display text-[20px] sm:text-[22px] leading-[1.3] text-foreground"
        >
          {text}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex flex-col gap-2.5"
      >
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={value === idx}
            onClick={() => onChange(idx)}
            className={cn(
              "w-full text-left px-4 py-3.5 rounded-sm border transition-colors duration-200 min-h-11 touch-manipulation",
              value === idx
                ? "border-primary bg-primary/[0.08] text-foreground"
                : "border-ink-600 bg-ink-900 text-muted-foreground hover:border-ink-500 hover:bg-ink-800 hover:text-foreground"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  value === idx ? "border-primary" : "border-ink-500"
                )}
              >
                {value === idx && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </span>
              <span className="text-sm sm:text-[15px] leading-relaxed text-foreground/95">
                {(!married && opt.labelHypothetical) ? opt.labelHypothetical : opt.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
