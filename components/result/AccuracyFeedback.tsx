"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CopyContent } from "@/lib/types";

interface AccuracyFeedbackProps {
  resultId: string;
  copy: NonNullable<CopyContent["postResult"]>["accuracyQuestion"];
}

const storageKey = (resultId: string) => `mm-result-feedback:${resultId}`;

type State = "idle" | "submitting" | "thanks" | "error";

export function AccuracyFeedback({ resultId, copy }: AccuracyFeedbackProps) {
  const [state, setState] = useState<State>("idle");
  const [rating, setRating] = useState<number | null>(null);
  const [hasResponded, setHasResponded] = useState(true); // hide until we check storage

  useEffect(() => {
    const already = typeof window !== "undefined" && localStorage.getItem(storageKey(resultId));
    setHasResponded(Boolean(already));
  }, [resultId]);

  if (hasResponded) return null;

  const scale: number[] = [];
  for (let i = copy.scaleMin; i <= copy.scaleMax; i++) scale.push(i);

  async function handleSubmit() {
    if (rating === null) return;
    setState("submitting");
    try {
      const res = await fetch("/api/result-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result_id: resultId, rating }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setState("error");
      return;
    }
    localStorage.setItem(storageKey(resultId), String(rating));
    setState("thanks");
  }

  function handleSkip() {
    localStorage.setItem(storageKey(resultId), "skipped");
    setHasResponded(true);
  }

  if (state === "thanks") {
    return (
      <Card variant="subtle">
        <CardContent className="pt-5 pb-5 px-5 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {copy.thanksMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="subtle">
      <CardContent className="pt-5 pb-5 px-5 space-y-4">
        <p className="font-display text-[18px] text-foreground leading-snug text-center">
          {copy.prompt}
        </p>

        <div className="flex justify-between items-center gap-2">
          {scale.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n}`}
              aria-pressed={rating === n}
              className={[
                "flex-1 min-h-11 rounded-sm border text-sm font-semibold transition-colors",
                rating === n
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-ink-600 bg-ink-900 text-muted-foreground hover:border-ink-500 hover:text-foreground",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex justify-between text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          <span>{copy.scaleMinLabel}</span>
          <span>{copy.scaleMaxLabel}</span>
        </div>

        {state === "error" ? (
          <p className="text-xs text-destructive text-center" role="alert">
            Could not save your feedback. Please try again.
          </p>
        ) : null}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleSkip}
            disabled={state === "submitting"}
          >
            {copy.skipButton}
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            onClick={handleSubmit}
            disabled={rating === null || state === "submitting"}
          >
            {state === "submitting" ? "…" : copy.submitButton}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
