"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RegisterCopy = {
  title: string;
  body: string;
  cta: string;
};

export function RegisterForm({ copy }: { copy: RegisterCopy }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string"
          ? data.error
          : "Something went wrong. Please try again."
      );
      setLoading(false);
      return;
    }

    router.push("/start");
  }

  const canSubmit = Boolean(name.trim() && email.trim());

  return (
    <main className="min-h-dvh flex flex-col justify-center py-10 sm:py-12">
      <Container className="max-w-md">
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-2xl sm:text-[1.65rem] font-bold text-foreground leading-tight tracking-tight">
            {copy.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {copy.body}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="name" className="text-label">
                  First name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-label block leading-snug">
                  Phone number
                  <span className="block normal-case font-normal tracking-normal text-muted-foreground mt-0.5">
                    so we can reach you
                  </span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-1"
                disabled={loading || !canSubmit}
              >
                {loading ? "One moment…" : copy.cta}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
