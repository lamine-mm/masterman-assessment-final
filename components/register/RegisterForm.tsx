"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MastermanLogo } from "@/components/ui/MastermanLogo";
import type { CopyContent } from "@/lib/types";

// Most common calling codes for Muslim professional diaspora + key markets
const CALLING_CODES = [
  { code: "+1",   label: "🇺🇸🇨🇦 +1  (USA / Canada)" },
  { code: "+44",  label: "🇬🇧 +44 (UK)" },
  { code: "+33",  label: "🇫🇷 +33 (France)" },
  { code: "+49",  label: "🇩🇪 +49 (Germany)" },
  { code: "+31",  label: "🇳🇱 +31 (Netherlands)" },
  { code: "+32",  label: "🇧🇪 +32 (Belgium)" },
  { code: "+46",  label: "🇸🇪 +46 (Sweden)" },
  { code: "+47",  label: "🇳🇴 +47 (Norway)" },
  { code: "+45",  label: "🇩🇰 +45 (Denmark)" },
  { code: "+61",  label: "🇦🇺 +61 (Australia)" },
  { code: "+971", label: "🇦🇪 +971 (UAE)" },
  { code: "+966", label: "🇸🇦 +966 (Saudi Arabia)" },
  { code: "+974", label: "🇶🇦 +974 (Qatar)" },
  { code: "+965", label: "🇰🇼 +965 (Kuwait)" },
  { code: "+973", label: "🇧🇭 +973 (Bahrain)" },
  { code: "+968", label: "🇴🇲 +968 (Oman)" },
  { code: "+962", label: "🇯🇴 +962 (Jordan)" },
  { code: "+20",  label: "🇪🇬 +20  (Egypt)" },
  { code: "+92",  label: "🇵🇰 +92  (Pakistan)" },
  { code: "+880", label: "🇧🇩 +880 (Bangladesh)" },
  { code: "+91",  label: "🇮🇳 +91  (India)" },
  { code: "+60",  label: "🇲🇾 +60  (Malaysia)" },
  { code: "+62",  label: "🇮🇩 +62  (Indonesia)" },
  { code: "+234", label: "🇳🇬 +234 (Nigeria)" },
  { code: "+233", label: "🇬🇭 +233 (Ghana)" },
  { code: "+212", label: "🇲🇦 +212 (Morocco)" },
  { code: "+213", label: "🇩🇿 +213 (Algeria)" },
  { code: "+216", label: "🇹🇳 +216 (Tunisia)" },
  { code: "+90",  label: "🇹🇷 +90  (Turkey)" },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "France", "Germany", "Netherlands", "Belgium", "Sweden", "Norway", "Denmark",
  "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "Jordan",
  "Egypt", "Pakistan", "Bangladesh", "India", "Malaysia", "Indonesia",
  "Nigeria", "Ghana", "Morocco", "Algeria", "Tunisia", "Turkey",
  "Other",
];

const inputClass =
  "w-full min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

const selectClass =
  "w-full min-h-11 rounded-xl border border-white/10 bg-[#141410] px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none";

export function RegisterForm({ copy }: { copy: CopyContent["register"] }) {
  const router = useRouter();
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [country, setCountry]     = useState("");
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

    const phone = phoneDigits.trim()
      ? `${callingCode}${phoneDigits.trim()}`
      : undefined;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        country: country || undefined,
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

  const canSubmit = Boolean(name.trim() && email.trim() && married);

  return (
    <main className="min-h-dvh flex flex-col justify-center py-10 sm:py-12">
      <Container className="max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <MastermanLogo size={52} />
        </div>

        <div className="text-center mb-8 space-y-2">
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

              {/* Country */}
              <div className="space-y-2">
                <label htmlFor="country" className="text-label">Country</label>
                <div className="relative">
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label htmlFor="age" className="text-label">Age</label>
                <input
                  id="age"
                  type="number"
                  min={18}
                  max={80}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  className={inputClass}
                />
              </div>

              {/* Phone with country code */}
              <div className="space-y-2">
                <label className="text-label block leading-snug">
                  Phone number
                  <span className="block normal-case font-normal tracking-normal text-muted-foreground mt-0.5">
                    so we can reach you
                  </span>
                </label>
                <div className="flex gap-2">
                  <div className="relative w-[7.5rem] flex-shrink-0">
                    <select
                      value={callingCode}
                      onChange={(e) => setCallingCode(e.target.value)}
                      aria-label="Country calling code"
                      className={selectClass + " pr-7 text-xs"}
                    >
                      {CALLING_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                  </div>
                  <input
                    type="tel"
                    autoComplete="tel-national"
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    placeholder="555 000 0000"
                    className={inputClass + " flex-1"}
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
                        "flex-1 min-h-11 rounded-xl border text-sm font-medium transition-colors",
                        married === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20",
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
      </Container>
    </main>
  );
}
