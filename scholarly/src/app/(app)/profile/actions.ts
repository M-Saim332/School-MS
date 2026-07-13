"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { updateProfileDetails } from "@/lib/services/profile";
import { throwFriendlyError } from "@/lib/errors";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile";

export async function updateProfileAction(values: ProfileFormValues) {
  try {
    const user = await requireUser();
    const parsed = profileFormSchema.parse(values);
    await updateProfileDetails(user, parsed);
    revalidatePath("/profile");
    revalidatePath("/staff");
    revalidatePath("/teachers");
    revalidatePath("/admin");
  } catch (error) {
    throwFriendlyError(error, "Profile could not be updated.");
  }
}
