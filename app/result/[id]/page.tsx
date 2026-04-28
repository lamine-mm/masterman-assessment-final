import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ResultReveal } from "@/components/result/ResultReveal";
import { StageBadge } from "@/components/result/StageBadge";
import { ShareBlock } from "@/components/result/ShareBlock";
import { DisclaimerPS } from "@/components/result/DisclaimerPS";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getResultById } from "@/lib/db";
import { getTypeContent, getStageContent, getCopy } from "@/lib/content";
import { AXIS_LABELS, AXIS_POLE_A, AXIS_POLE_B, type AxisKey } from "@/lib/types";
import { buildApplyUrl } from "@/lib/utils";

// AXES used for the type code legend only


const AXES: AxisKey[] = ["A", "G", "S", "C"];

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResultById(id);
  const copy = getCopy();

  if (!result) notFound();

  const typeContent = getTypeContent(result.type);
  const stageContent = getStageContent(result.stage);
  const resultUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/result/${id}`;
  const applyUrl = buildApplyUrl(`stage-${result.stage}`);

  return (
    <main className="min-h-dvh flex flex-col">
      <Container className="max-w-xl lg:max-w-2xl flex-1 flex flex-col pt-3 sm:pt-4 pb-6">
        <ResultReveal
          typeCode={result.type}
          typeName={typeContent?.name ?? result.type}
          axisScores={result.axisScores as Record<AxisKey, number>}
        >
          {/* ── Type code legend ────────────────────────────────────────── */}
          <Card variant="subtle">
            <CardContent className="pt-5 pb-5 px-5">
              <p className="eyebrow mb-3">What your code means</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {AXES.map((axis) => {
                  const score = result.axisScores[axis as AxisKey];
                  const isA = score > 0.5;
                  const pole = isA
                    ? AXIS_POLE_A[axis as AxisKey]
                    : AXIS_POLE_B[axis as AxisKey];
                  const letter = result.type[AXES.indexOf(axis)];
                  return (
                    <div key={axis} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 w-6 h-6 rounded-sm border border-primary/40 bg-primary/10 flex items-center justify-center font-display text-[13px] text-primary">
                        {letter}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">{pole}</p>
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{AXIS_LABELS[axis as AxisKey]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {typeContent ? (
            <>
              <p className="font-display italic text-[24px] sm:text-[28px] leading-[1.35] text-center text-foreground px-1">
                &ldquo;{typeContent.identity}&rdquo;
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                <Card variant="subtle">
                  <CardContent className="pt-5 pb-6 px-5 space-y-2">
                    <p className="eyebrow mb-2">Your Strength</p>
                    <p className="font-display text-[18px] text-foreground leading-snug">
                      {typeContent.strength}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {typeContent.strengthDetail}
                    </p>
                  </CardContent>
                </Card>
                <Card variant="subtle">
                  <CardContent className="pt-5 pb-6 px-5 space-y-2">
                    <p className="eyebrow mb-2">Your Blind Spot</p>
                    <p className="font-display text-[18px] text-foreground leading-snug">
                      {typeContent.blindSpot}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {typeContent.blindSpotDetail}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="px-1">
                <div className="h-px max-w-xs mx-auto bg-primary/60" aria-hidden="true" />
                <p className="mt-5 mb-3 font-display italic text-[20px] sm:text-[22px] text-foreground leading-[1.4] text-center px-2">
                  &ldquo;{typeContent.quranAnchor}&rdquo;
                </p>
                <p className="text-[12px] italic text-muted-foreground text-right pr-1 sm:pr-2">
                  {typeContent.anchorSource}
                </p>
                <div className="h-px max-w-xs mx-auto mt-5 bg-primary/60" aria-hidden="true" />
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 text-center px-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your full write-up is being prepared — check your email.
                </p>
              </CardContent>
            </Card>
          )}

          {stageContent ? (
            <StageBadge
              stage={result.stage}
              name={stageContent.name}
              meaning={stageContent.meaning}
            />
          ) : null}

          {result.midpointFlags.length > 0 ? (
            <Card variant="subtle">
              <CardContent className="pt-5 pb-5 px-5 space-y-2">
                <p className="font-display text-[18px] text-foreground leading-snug">
                  Some of your scores are close to the middle.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Want a sharper read on{" "}
                  {(result.midpointFlags as string[]).join(" and ")}? Answer
                  those questions again — it takes under a minute.
                </p>
                <Link href="/assessment" className="inline-block pt-1">
                  <Button variant="outline" size="sm">Retake</Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {/* ── Email notice ────────────────────────────────────────────── */}
          <div className="flex items-start gap-3 rounded-md border border-primary/30 bg-primary/[0.05] px-4 py-3.5">
            <span className="text-primary text-lg leading-none mt-0.5">&#9993;</span>
            <div className="space-y-1">
              <p className="font-display text-[17px] text-foreground leading-snug">
                Your personalized roadmap is on its way.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Check your inbox in the next few minutes. If you do not see it, check your spam or promotions folder.
              </p>
            </div>
          </div>

          {/* ── Share ────────────────────────────────────────────────────── */}
          <div>
            <p className="eyebrow text-center mb-3">
              Share your result
            </p>
            <ShareBlock
              typeCode={result.type}
              typeName={typeContent?.name ?? result.type}
              resultUrl={resultUrl}
              whatsappTemplate={copy.share.whatsappMessage}
            />
          </div>

          {/* ── CTA ─────────────────────────────────────────────────────── */}
          <Card variant="anchor">
            <CardContent className="pt-6 pb-6 px-5 sm:px-6 text-center space-y-3">
              <p className="font-display text-[22px] sm:text-[24px] text-foreground leading-snug tracking-[-0.015em]">
                Ready to understand what this means for your life?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Apply to the Masterman program. We review your result together and talk about what is actually holding you back.
              </p>
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block pt-1"
              >
                <Button size="lg" className="w-full sm:w-auto min-w-[12rem]">
                  Apply
                </Button>
              </a>
            </CardContent>
          </Card>

          <DisclaimerPS text={copy.disclaimer.short} />
        </ResultReveal>
      </Container>
    </main>
  );
}
