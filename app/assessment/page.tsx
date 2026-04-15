import { cookies } from "next/headers";
import { AssessmentClient } from "@/components/assessment/AssessmentClient";
import { getQuestions, getCopy } from "@/lib/content";

export default async function AssessmentPage() {
  const questions = getQuestions();
  const copy = getCopy();

  // Pre-fill married status from the cookie set at /api/register.
  // Defaults to true if not set (most respondents are married).
  const cookieStore = await cookies();
  const marriedCookie = cookieStore.get("married")?.value;
  const initialMarried = marriedCookie === "0" ? false : true;

  return (
    <AssessmentClient
      questions={questions}
      scoringMessage={copy.loading.scoringMessage}
      initialMarried={initialMarried}
    />
  );
}
