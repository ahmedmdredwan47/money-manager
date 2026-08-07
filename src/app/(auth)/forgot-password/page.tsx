import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password | WealthWise Money Manager",
  description: "Reset your WealthWise account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
