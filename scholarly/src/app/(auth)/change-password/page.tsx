import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <ChangePasswordForm />;
}
