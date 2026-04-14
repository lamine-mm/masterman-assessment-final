"use client";

import { cn } from "@/lib/utils";

interface MarriageToggleProps {
  married: boolean;
  onChange: (married: boolean) => void;
}

export function MarriageToggle({ married, onChange }: MarriageToggleProps) {
  return (
    <div className="glass-subtle rounded-xl p-4 sm:p-5 space-y-3 border border-white/[0.08]">
      <p className="text-sm text-foreground font-medium leading-snug">
        Are you currently married?
      </p>
      <div className="flex gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 min-h-11 rounded-full border text-sm font-medium transition-colors touch-manipulation px-4",
            married
              ? "border-primary bg-primary/15 text-primary"
              : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/18"
          )}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 min-h-11 rounded-full border text-sm font-medium transition-colors touch-manipulation px-4",
            !married
              ? "border-primary bg-primary/15 text-primary"
              : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/18"
          )}
        >
          Not yet
        </button>
      </div>
      {!married && (
        <p className="text-xs leading-relaxed text-amber-200/55">
          Answer based on the husband and father you intend to become, in shaa
          Allah.
        </p>
      )}
    </div>
  );
}
