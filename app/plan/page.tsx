import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/button-link";
import { getCopy } from "@/lib/content";
import { getVslEmbedUrl, getBookingUrl } from "@/lib/vsl";

export const metadata: Metadata = {
  title: "Your Path Forward — Masterman",
  robots: { index: false },
};

/**
 * VSL page. Reached from the result page and from cold email clicks, so the
 * stage comes from the URL (?stage=1..4) — no session state required.
 */
export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage: rawStage } = await searchParams;
  const copy = getCopy();

  const parsed = Number.parseInt(rawStage ?? "", 10);
  const stage = copy.plan.stages[String(parsed)] ? parsed : 1;
  const stageCopy = copy.plan.stages[String(stage)];

  return (
    <main className="min-h-dvh flex flex-col">
      <Container className="max-w-xl lg:max-w-2xl flex-1 flex flex-col pt-6 sm:pt-10 pb-8">
        <div className="space-y-5">
          <div className="text-center space-y-3">
            <p className="eyebrow">{copy.plan.eyebrow}</p>
            <h1 className="font-display text-[24px] sm:text-[28px] leading-[1.3] tracking-[-0.015em] text-foreground">
              {stageCopy.headline}
            </h1>
          </div>

          <div className="rounded-md overflow-hidden border border-ink-600">
            <div className="relative w-full aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={getVslEmbedUrl()}
                title="Your path forward"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {copy.plan.videoCaption}
          </p>

          <div className="text-center space-y-4 pt-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stageCopy.bridge}
            </p>
            <ButtonLink external href={getBookingUrl(stage)} size="lg" className="w-full">
              {copy.plan.ctaButton}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </main>
  );
}
