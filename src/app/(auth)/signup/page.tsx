import { SignUpForm } from "@/features/auth/components/signup-form";

export const metadata = {
  title: "Create Account | WealthWise Money Manager",
  description: "Create a new WealthWise personal money manager account.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
