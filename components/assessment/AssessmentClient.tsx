"use client";

import { useState, useCallback, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ProgressBar } from "@/components/assessment/ProgressBar";
import { LikertQuestion } from "@/components/assessment/LikertQuestion";
import { ScenarioQuestion } from "@/components/assessment/ScenarioQuestion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import type { Answer, Question } from "@/lib/types";

const MODULE_LABELS = ["Identity", "Nafs", "Marriage", "Brotherhood"];
const TOTAL_PAGES = 4;
const QUESTIONS_PER_PAGE = 5;

export interface AssessmentClientProps {
  questions: Question[];
  scoringMessage: string;
  initialMarried?: boolean;
}

export function AssessmentClient({
  questions,
  scoringMessage,
  initialMarried = true,
}: AssessmentClientProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const married = initialMarried;
  const [submitting, setSubmitting] = useState(false);
  const [scoringOverlay, setScoringOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstPagePaint = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  const pageStart = currentPage * QUESTIONS_PER_PAGE;
  const pageQuestions = questions.slice(
    pageStart,
    pageStart + QUESTIONS_PER_PAGE
  );

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const pageComplete = pageQuestions.every((q) => answers[q.id] !== undefined);
  const isLastPage = currentPage === TOTAL_PAGES - 1;
  const isMarriageModule = currentPage === 2; // used for hypothetical text on Likert questions

  // After each page change, scroll to top *after* the new questions are laid out.
  // Calling scrollTo in the same tick as setState races the old tall page and fails on mobile.
  useLayoutEffect(() => {
    if (isFirstPagePaint.current) {
      isFirstPagePaint.current = false;
      return;
    }
    const behavior: ScrollBehavior =
      prefersReducedMotion === true ? "auto" : "smooth";
    // After layout commit, scroll on the next frame so the new (shorter) page height is applied first.
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior });
    });
    return () => cancelAnimationFrame(id);
  }, [currentPage, prefersReducedMotion]);

  async function handleNext() {
    if (!pageComplete) return;

    if (!isLastPage) {
      setCurrentPage((p) => p + 1);
      return;
    }

    setSubmitting(true);
    setError(null);

    const answerArray: Answer[] = Object.entries(answers).map(
      ([questionId, value]) => ({ questionId, value })
    );

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerArray, married }),
    });

    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    const { resultId } = await res.json();
    setSubmitting(false);
    setScoringOverlay(true);

    await new Promise((r) => setTimeout(r, 1500));
    router.push(`/result/${resultId}`);
  }

  return (
    <div className="min-h-dvh flex flex-col pb-[5.25rem] sm:pb-24">
      <div className="sticky top-0 z-20 frost-band">
        <Container className="max-w-2xl">
          <ProgressBar
            currentPage={currentPage + 1}
            totalPages={TOTAL_PAGES}
            moduleLabel={MODULE_LABELS[currentPage]}
          />
        </Container>
      </div>

      <Container className="flex-1 max-w-2xl py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 sm:space-y-10"
          >
            {pageQuestions.map((question) => {
              const currentValue = answers[question.id] ?? null;

              if (question.type === "scenario") {
                return (
                  <ScenarioQuestion
                    key={question.id}
                    id={question.id}
                    text={question.text}
                    options={question.options}
                    value={currentValue}
                    onChange={(v) => handleAnswer(question.id, v)}
                    married={married}
                  />
                );
              }

              const text =
                isMarriageModule && !married && question.textHypothetical
                  ? question.textHypothetical
                  : question.text;

              return (
                <LikertQuestion
                  key={question.id}
                  id={question.id}
                  text={text}
                  value={currentValue}
                  onChange={(v) => handleAnswer(question.id, v)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="text-sm text-destructive text-center mt-6" role="alert">
            {error}
          </p>
        )}
      </Container>

      <div className="fixed bottom-0 inset-x-0 z-20 frost-band border-t border-border pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Container className="max-w-2xl py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3 items-stretch">
            {currentPage > 0 ? (
              <Button
                variant="outline"
                size="lg"
                className="flex-shrink-0 min-w-[5.5rem] sm:min-w-24"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Back
              </Button>
            ) : null}
            <Button
              size="lg"
              className="flex-1 min-w-0"
              disabled={!pageComplete || submitting || scoringOverlay}
              onClick={handleNext}
            >
              {submitting
                ? "Reading your answers…"
                : isLastPage
                  ? "See my result"
                  : "Next"}
            </Button>
          </div>
        </Container>
      </div>

      {scoringOverlay ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(60_3%_5%/0.94)] backdrop-blur-md px-6"
          role="status"
          aria-live="polite"
        >
          <div className="flex max-w-sm flex-col items-center gap-6 text-center">
            <div className="w-full space-y-4">
              <div className="scoring-shimmer-track" aria-hidden="true">
                <div className="scoring-shimmer-bar" />
              </div>
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                {scoringMessage}
              </p>
            </div>
            <div
              className="flex items-center justify-center gap-1.5"
              aria-hidden="true"
            >
              <span className="scoring-dot" />
              <span className="scoring-dot" />
              <span className="scoring-dot" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
