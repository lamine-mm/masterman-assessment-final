import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/lib/content";

export default function StartPage() {
  const copy = getCopy();

  return (
    <main className="min-h-dvh flex flex-col justify-center py-10 sm:py-12">
      <Container className="max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-[1.65rem] font-bold text-foreground leading-tight">
            {copy.intro.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {copy.intro.body}
          </p>
        </div>

        <div className="glass-subtle rounded-xl p-4 sm:p-5 border border-white/[0.08]">
          <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
            {copy.disclaimer.long}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              4 minutes
            </span>
          </div>
          <Link href="/assessment" className="block w-full">
            <Button size="lg" className="w-full">
              {copy.intro.cta}
            </Button>
          </Link>
        </div>
      </Container>
    </main>
  );
}
