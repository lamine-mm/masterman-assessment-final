"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MastermanLogo } from "@/components/ui/MastermanLogo";
import type { CopyContent } from "@/lib/types";

const AGE_RANGES: { label: string; value: number }[] = [
  { label: "18–24", value: 18 },
  { label: "25–34", value: 25 },
  { label: "35–44", value: 35 },
  { label: "45–54", value: 45 },
  { label: "55+",   value: 55 },
];

const inputBase =
  "min-h-11 rounded-sm border border-ink-600 bg-ink-900 px-3.5 text-[15px] text-foreground placeholder:text-parchment-500 focus:outline-none focus:border-ink-500 focus:shadow-[inset_0_0_0_1px_#4A4438] transition-colors";

const inputClass = `w-full ${inputBase}`;

const selectClass =
  "w-full min-h-11 rounded-sm border border-ink-600 bg-ink-900 px-3.5 text-[15px] text-foreground focus:outline-none focus:border-ink-500 appearance-none transition-colors";

export function RegisterForm({
  copy,
  disclaimer,
}: {
  copy: CopyContent["register"];
  disclaimer: string;
}) {
  const router = useRouter();
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [callingCode, setCallingCode] = useState("+1");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [age, setAge]             = useState("");
  const [married, setMarried]     = useState<"yes" | "no" | "">("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedCode = callingCode.trim().startsWith("+")
      ? callingCode.trim()
      : `+${callingCode.trim()}`;
    const phone = `${normalizedCode}${phoneDigits.trim()}`;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        age: age ? parseInt(age, 10) : undefined,
        married: married === "yes" ? true : married === "no" ? false : undefined,
      }),
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

    // Go straight into the assessment — no /start detour
    router.push("/assessment");
  }

  const canSubmit = Boolean(
    name.trim() &&
    email.trim() &&
    age &&
    phoneDigits.trim() &&
    callingCode.trim() &&
    married
  );

  return (
    <main className="min-h-dvh flex flex-col justify-center py-10 sm:py-12">
      <Container className="max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <MastermanLogo size={88} />
        </div>

        <div className="text-center mb-8 space-y-2">
          <h1 className="font-display text-[32px] sm:text-[40px] font-medium text-foreground leading-[1.05] tracking-[-0.015em]">
            {copy.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {copy.body}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* First name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-label">First name</label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-label">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>

              {/* Age range */}
              <div className="space-y-2">
                <label htmlFor="age" className="text-label">Age range</label>
                <div className="relative">
                  <select
                    id="age"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select your age range</option>
                    {AGE_RANGES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
              </div>

              {/* Phone with country code */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-label block leading-snug">
                  Phone number
                  <span className="block normal-case font-normal tracking-normal text-muted-foreground mt-0.5">
                    so we can reach you
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="tel"
                    aria-label="Country calling code"
                    value={callingCode}
                    onChange={(e) => setCallingCode(e.target.value)}
                    placeholder="+1"
                    required
                    className={`${inputBase} w-20 flex-shrink-0 text-center`}
                  />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel-national"
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    placeholder="555 000 0000"
                    required
                    className={`${inputBase} flex-1 min-w-0`}
                  />
                </div>
              </div>

              {/* Married */}
              <div className="space-y-2">
                <p className="text-label">Are you currently married?</p>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMarried(opt)}
                      className={[
                        "flex-1 min-h-11 rounded-sm border text-sm font-semibold transition-colors",
                        married === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-ink-600 bg-ink-900 text-muted-foreground hover:border-ink-500 hover:text-foreground",
                      ].join(" ")}
                    >
                      {opt === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">{error}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-1"
                disabled={loading || !canSubmit}
              >
                {loading ? "One moment…" : copy.cta}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground leading-relaxed pt-1">
                By continuing, you consent to receiving SMS and emails from the Masterman team.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
            Disclaimer
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {disclaimer}
          </p>
        </div>
      </Container>
    </main>
  );
}
