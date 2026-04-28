import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { MastermanLogo } from "@/components/ui/MastermanLogo";
import { getCopy } from "@/lib/content";

export default function LandingPage() {
  const copy = getCopy();

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <Container className="py-14 sm:py-16 text-center flex flex-col items-center gap-8 sm:gap-10">

          {/* Logo */}
          <MastermanLogo size={120} />

          <div className="space-y-6 sm:space-y-7 max-w-lg mx-auto">
            {/* Scholar badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-ink-500 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
                Reviewed by Shaykh Abdullah Oduro
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="font-display text-[40px] sm:text-[56px] md:text-[64px] font-medium leading-[1.05] tracking-[-0.015em] text-foreground">
                {copy.landing.hero}
              </h1>
              <p className="text-[17px] text-muted-foreground leading-[1.55] max-w-md mx-auto">
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
          <div className="max-w-xl mx-auto text-center space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
              Disclaimer
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              {copy.disclaimer.long}
            </p>
          </div>
        </Container>
      </footer>
    </main>
  );
}
