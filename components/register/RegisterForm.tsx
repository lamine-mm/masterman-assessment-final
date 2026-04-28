"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MastermanLogo } from "@/components/ui/MastermanLogo";
import type { CopyContent } from "@/lib/types";

const CALLING_CODES = [
  // North America
  { code: "+1",   label: "+1   USA / Canada" },
  { code: "+52",  label: "+52  Mexico" },
  // Western Europe
  { code: "+44",  label: "+44  UK" },
  { code: "+33",  label: "+33  France" },
  { code: "+49",  label: "+49  Germany" },
  { code: "+31",  label: "+31  Netherlands" },
  { code: "+32",  label: "+32  Belgium" },
  { code: "+41",  label: "+41  Switzerland" },
  { code: "+43",  label: "+43  Austria" },
  { code: "+46",  label: "+46  Sweden" },
  { code: "+47",  label: "+47  Norway" },
  { code: "+45",  label: "+45  Denmark" },
  { code: "+358", label: "+358 Finland" },
  { code: "+353", label: "+353 Ireland" },
  { code: "+351", label: "+351 Portugal" },
  { code: "+34",  label: "+34  Spain" },
  { code: "+39",  label: "+39  Italy" },
  { code: "+30",  label: "+30  Greece" },
  // Eastern Europe
  { code: "+48",  label: "+48  Poland" },
  { code: "+380", label: "+380 Ukraine" },
  { code: "+7",   label: "+7   Russia / Kazakhstan" },
  { code: "+90",  label: "+90  Turkey" },
  { code: "+40",  label: "+40  Romania" },
  { code: "+36",  label: "+36  Hungary" },
  { code: "+420", label: "+420 Czech Republic" },
  // Oceania
  { code: "+61",  label: "+61  Australia" },
  { code: "+64",  label: "+64  New Zealand" },
  // Gulf / Middle East
  { code: "+971", label: "+971 UAE" },
  { code: "+966", label: "+966 Saudi Arabia" },
  { code: "+974", label: "+974 Qatar" },
  { code: "+965", label: "+965 Kuwait" },
  { code: "+973", label: "+973 Bahrain" },
  { code: "+968", label: "+968 Oman" },
  { code: "+962", label: "+962 Jordan" },
  { code: "+961", label: "+961 Lebanon" },
  { code: "+972", label: "+972 Palestine / Israel" },
  { code: "+964", label: "+964 Iraq" },
  { code: "+963", label: "+963 Syria" },
  { code: "+967", label: "+967 Yemen" },
  { code: "+98",  label: "+98  Iran" },
  // Africa — North
  { code: "+20",  label: "+20  Egypt" },
  { code: "+212", label: "+212 Morocco" },
  { code: "+213", label: "+213 Algeria" },
  { code: "+216", label: "+216 Tunisia" },
  { code: "+218", label: "+218 Libya" },
  { code: "+249", label: "+249 Sudan" },
  // Africa — West
  { code: "+234", label: "+234 Nigeria" },
  { code: "+233", label: "+233 Ghana" },
  { code: "+221", label: "+221 Senegal" },
  { code: "+223", label: "+223 Mali" },
  { code: "+226", label: "+226 Burkina Faso" },
  { code: "+225", label: "+225 Côte d'Ivoire" },
  { code: "+224", label: "+224 Guinea" },
  { code: "+220", label: "+220 Gambia" },
  { code: "+227", label: "+227 Niger" },
  // Africa — East
  { code: "+254", label: "+254 Kenya" },
  { code: "+255", label: "+255 Tanzania" },
  { code: "+256", label: "+256 Uganda" },
  { code: "+251", label: "+251 Ethiopia" },
  { code: "+252", label: "+252 Somalia" },
  { code: "+253", label: "+253 Djibouti" },
  // Africa — South
  { code: "+27",  label: "+27  South Africa" },
  // South Asia
  { code: "+92",  label: "+92  Pakistan" },
  { code: "+880", label: "+880 Bangladesh" },
  { code: "+91",  label: "+91  India" },
  { code: "+94",  label: "+94  Sri Lanka" },
  { code: "+977", label: "+977 Nepal" },
  { code: "+93",  label: "+93  Afghanistan" },
  // Southeast Asia
  { code: "+60",  label: "+60  Malaysia" },
  { code: "+62",  label: "+62  Indonesia" },
  { code: "+63",  label: "+63  Philippines" },
  { code: "+65",  label: "+65  Singapore" },
  { code: "+66",  label: "+66  Thailand" },
  { code: "+84",  label: "+84  Vietnam" },
  { code: "+95",  label: "+95  Myanmar" },
  // East Asia
  { code: "+86",  label: "+86  China" },
  { code: "+81",  label: "+81  Japan" },
  { code: "+82",  label: "+82  South Korea" },
  { code: "+852", label: "+852 Hong Kong" },
  { code: "+886", label: "+886 Taiwan" },
  // Central Asia
  { code: "+7",   label: "+7   Kazakhstan" },
  { code: "+998", label: "+998 Uzbekistan" },
  { code: "+992", label: "+992 Tajikistan" },
  { code: "+996", label: "+996 Kyrgyzstan" },
  { code: "+993", label: "+993 Turkmenistan" },
  { code: "+994", label: "+994 Azerbaijan" },
];

const AGE_RANGES: { label: string; value: number }[] = [
  { label: "18–24", value: 18 },
  { label: "25–34", value: 25 },
  { label: "35–44", value: 35 },
  { label: "45–54", value: 45 },
  { label: "55+",   value: 55 },
];

const inputClass =
  "w-full min-h-11 rounded-sm border border-ink-600 bg-ink-900 px-3.5 text-[15px] text-foreground placeholder:text-parchment-500 focus:outline-none focus:border-ink-500 focus:shadow-[inset_0_0_0_1px_#4A4438] transition-colors";

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
