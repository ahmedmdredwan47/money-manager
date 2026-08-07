import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Reset Password | WealthWise Money Manager",
  description: "Set a new password for your WealthWise account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
