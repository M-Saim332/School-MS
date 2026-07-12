import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { roleHome } from "@/lib/permissions";

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? roleHome(user.role) : "/sign-in");
}
