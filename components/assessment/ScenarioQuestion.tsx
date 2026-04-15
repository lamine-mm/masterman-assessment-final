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
      <div className="scenario-surface rounded-xl p-4 sm:p-5 space-y-2">
        <span className="text-label">Scenario</span>
        <p
          id={labelId}
          className="text-base sm:text-[17px] leading-relaxed text-foreground"
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
              "w-full text-left px-4 py-3.5 rounded-xl border transition-colors duration-200 min-h-11 touch-manipulation",
              value === idx
                ? "border-primary bg-primary/[0.12] text-foreground shadow-[inset_0_0_0_1px_hsl(45_90%_58%/0.12)]"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/18 hover:bg-white/[0.06]"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  value === idx ? "border-primary" : "border-white/25"
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
