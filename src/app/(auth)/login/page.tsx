import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign In | WealthWise Money Manager",
  description: "Sign in to your WealthWise personal money manager account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
