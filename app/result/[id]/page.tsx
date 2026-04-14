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
import type { AxisKey } from "@/lib/types";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, copy] = await Promise.all([
    getResultById(id),
    Promise.resolve(getCopy()),
  ]);

  if (!result) notFound();

  const typeContent = getTypeContent(result.type);
  const stageContent = getStageContent(result.stage);
  const resultUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/result/${id}`;

  return (
    <main className="min-h-dvh flex flex-col">
      <Container className="max-w-xl flex-1 flex flex-col pt-3 sm:pt-4 pb-6">
        <ResultReveal
          typeCode={result.type}
          typeName={typeContent?.name ?? result.type}
          axisScores={result.axisScores as Record<AxisKey, number>}
        >
          {typeContent ? (
            <>
              <p className="font-serif text-[22px] leading-snug text-center text-foreground px-1">
                &ldquo;{typeContent.identity}&rdquo;
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card variant="subtle">
                  <CardContent className="pt-5 pb-5 px-5">
                    <p className="text-label mb-2">Your Strength</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {typeContent.strength}
                    </p>
                  </CardContent>
                </Card>
                <Card variant="subtle">
                  <CardContent className="pt-5 pb-5 px-5">
                    <p className="text-label mb-2">Your Blind Spot</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {typeContent.blindSpot}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="px-1">
                <div
                  className="h-px max-w-xs mx-auto bg-primary/45"
                  aria-hidden="true"
                />
                <p className="mt-5 mb-5 text-base sm:text-[17px] text-foreground/95 leading-relaxed text-center italic px-2">
                  &ldquo;{typeContent.quranAnchor}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground text-right pr-1 sm:pr-2">
                  {typeContent.anchorSource}
                </p>
                <div
                  className="h-px max-w-xs mx-auto mt-5 bg-primary/45"
                  aria-hidden="true"
                />
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
                <p className="text-sm font-medium text-foreground">
                  Some of your scores are close to the middle.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Want a sharper read on{" "}
                  {(result.midpointFlags as string[]).join(" and ")}? Answer
                  those questions again — it takes under a minute.
                </p>
                <Link href="/assessment" className="inline-block pt-1">
                  <Button variant="outline" size="sm">
                    Retake
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <div>
            <p className="text-sm font-medium text-foreground text-center mb-3">
              Share your result
            </p>
            <ShareBlock
              typeCode={result.type}
              typeName={typeContent?.name ?? result.type}
              resultUrl={resultUrl}
              whatsappTemplate={copy.share.whatsappMessage}
            />
          </div>

          <Card>
            <CardContent className="pt-6 pb-6 px-5 sm:px-6 text-center space-y-3">
              <p className="text-base font-semibold text-foreground">
                Ready for the next step?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {typeContent?.nextStep ??
                  "See what the Max Program covers and book a call when you are ready."}
              </p>
              <Link href={`/thank-you?id=${id}`} className="block pt-1">
                <Button size="lg" className="w-full sm:w-auto min-w-[12rem]">
                  {copy.thankYou.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <DisclaimerPS text={copy.disclaimer.short} />
        </ResultReveal>
      </Container>
    </main>
  );
}
