import { AssessmentClient } from "@/components/assessment/AssessmentClient";
import { getQuestions, getCopy } from "@/lib/content";

export default function AssessmentPage() {
  const questions = getQuestions();
  const copy = getCopy();
  return (
    <AssessmentClient
      questions={questions}
      scoringMessage={copy.loading.scoringMessage}
    />
  );
}
