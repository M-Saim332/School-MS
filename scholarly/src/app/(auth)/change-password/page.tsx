import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { getCurrentUser } from "@/lib/auth/session";
import { roleHome } from "@/lib/permissions";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.mustChangePassword) redirect(roleHome(user.role));

  return <ChangePasswordForm />;
}
