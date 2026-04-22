"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TypeHero } from "@/components/result/TypeHero";
import { RadialChart } from "@/components/result/RadialChart";
import { MastermanLogo } from "@/components/ui/MastermanLogo";
import { AXIS_LABELS, AXIS_POLE_A, AXIS_POLE_B, type AxisKey } from "@/lib/types";

const AXES: AxisKey[] = ["A", "G", "S", "C"];

type Phase = "intro" | "hero" | "details";

const INTRO_MS = 1000;
const CHART_REVEAL_MS = 1050;

export function ResultReveal({
  typeCode,
  typeName,
  axisScores,
  children,
}: {
  typeCode: string;
  typeName: string;
  axisScores: Record<AxisKey, number>;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    if (reduced) {
      setPhase("details");
      return;
    }
    const toHero = setTimeout(() => setPhase("hero"), INTRO_MS);
    const toDetails = setTimeout(
      () => setPhase("details"),
      INTRO_MS + CHART_REVEAL_MS
    );
    return () => {
      clearTimeout(toHero);
      clearTimeout(toDetails);
    };
  }, [reduced]);

  const showHero = phase === "hero" || phase === "details";

  return (
    <>
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#0E0E0D]/92 backdrop-blur-md px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-center text-[32px] sm:text-[40px] font-medium tracking-[-0.015em] text-foreground"
            >
              Your results
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {showHero ? (
        <section
          className="shrink-0 overflow-visible pb-3 sm:pb-4"
          aria-labelledby="result-hero"
        >
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Logo — centered */}
            <div className="mb-3 flex justify-center">
              <MastermanLogo size={68} />
            </div>

            <div id="result-hero">
              <TypeHero typeCode={typeCode} typeName={typeName} />
            </div>

            {/* Radial chart */}
            <div className="mx-auto mt-1 w-full max-w-[min(94vw,440px)] overflow-visible px-0 sm:px-1">
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <RadialChart
                  axisScores={axisScores}
                  svgClassName="max-w-full sm:max-w-[420px]"
                />
              </motion.div>
            </div>

            {/* Chart explanation — directly below the diagram */}
            <div className="mt-4 px-2 sm:px-4">
              <p className="eyebrow text-center mb-2">
                How to read this diagram
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-sm mx-auto mb-3">
                Each point shows how strongly that trait shows in you. The further from the center, the more dominant the pole. Points near the middle signal tension — often where the most growth is.
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 max-w-xs mx-auto">
                {AXES.map((axis) => {
                  const score = axisScores[axis];
                  const isA = score > 0.5;
                  const pole = isA ? AXIS_POLE_A[axis] : AXIS_POLE_B[axis];
                  return (
                    <p key={axis} className="text-[11px] text-muted-foreground text-center">
                      <span className="text-primary font-semibold">{AXIS_LABELS[axis]}</span>
                      {" · "}
                      <span className="text-foreground/70">{pole}</span>
                    </p>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>
      ) : null}

      {phase === "details" ? (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-1 flex-col space-y-8 sm:mt-10 sm:space-y-10"
        >
          {children}
        </motion.div>
      ) : null}
    </>
  );
}
