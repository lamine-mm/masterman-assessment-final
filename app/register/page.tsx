import { RegisterForm } from "@/components/register/RegisterForm";
import { getCopy } from "@/lib/content";

export default function RegisterPage() {
  const copy = getCopy();
  return <RegisterForm copy={copy.register} disclaimer={copy.disclaimer.long} />;
}
