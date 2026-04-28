import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCopy } from "@/lib/content";
import { buildApplyUrl } from "@/lib/utils";

interface ThankYouPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ThankYouPage({
  searchParams,
}: ThankYouPageProps) {
  const { id } = await searchParams;
  const copy = getCopy();
  const applyUrl = buildApplyUrl("thank-you");

  return (
    <main className="min-h-dvh flex flex-col justify-center py-10 sm:py-12">
      <Container className="max-w-lg space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="font-display text-[32px] sm:text-[40px] font-medium text-foreground leading-[1.05] tracking-[-0.015em]">
            {copy.thankYou.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {copy.thankYou.body}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Check your email — your result is on its way.
        </p>

        <Card>
          <CardContent className="pt-6 pb-6 px-5 sm:px-6 space-y-5 text-left">
            {copy.thankYou.callBullets.length > 0 ? (
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2 marker:text-primary/80">
                {copy.thankYou.callBullets.map((bullet, i) => (
                  <li key={i} className="leading-relaxed pl-1">
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-1"
            >
              <Button size="lg" className="w-full">
                Apply
              </Button>
            </a>
          </CardContent>
        </Card>

        {id ? (
          <Link
            href={`/result/${id}`}
            className="inline-block text-sm text-muted-foreground underline underline-offset-4 decoration-border hover:text-foreground hover:decoration-primary transition-colors"
          >
            Go back to your result
          </Link>
        ) : null}
      </Container>
    </main>
  );
}
