"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { throwFriendlyError } from "@/lib/errors";

const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export async function changePasswordAction(values: ChangePasswordValues) {
  try {
    const parsed = changePasswordSchema.parse(values);
    const supabase = await createClient();

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) throw new Error("Please sign in again before changing your password.");

    const { error: passwordError } = await supabase.auth.updateUser({ password: parsed.password });
    if (passwordError) throw new Error(passwordError.message);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user.id);

    if (profileError) throw new Error(profileError.message);
  } catch (error) {
    throwFriendlyError(error, "Password could not be changed.");
  }
}
