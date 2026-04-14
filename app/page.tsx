import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/lib/content";

export default function LandingPage() {
  const copy = getCopy();

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <Container className="py-14 sm:py-16 text-center flex flex-col items-center gap-8 sm:gap-10">
          <div className="space-y-6 sm:space-y-8 max-w-lg mx-auto">
            <p
              className="font-bold text-primary tracking-[0.28em] sm:tracking-[0.32em] text-3xl sm:text-4xl leading-none"
              aria-hidden="true"
            >
              ? ? ? ?
            </p>

            <div className="space-y-4">
              <h1 className="text-[1.65rem] sm:text-3xl md:text-4xl font-bold leading-[1.2] text-foreground">
                {copy.landing.hero}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                {copy.landing.subhero}
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <Link href="/register" className="block w-full">
              <Button size="lg" className="w-full">
                {copy.landing.cta}
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <footer className="mt-auto pb-8 pt-4">
        <Container>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed text-center max-w-xl mx-auto">
            {copy.disclaimer.long}
          </p>
        </Container>
      </footer>
    </main>
  );
}
