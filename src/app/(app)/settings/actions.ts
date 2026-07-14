"use server";

import { requireUser } from "@/lib/auth/session";
import { updateProfileDetails } from "@/lib/services/profile";
import {
  updateSchoolSettings,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  updateMemberRole,
  updateMemberStatus
} from "@/lib/services/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(values: any) {
  try {
    const user = await requireUser("settings:manage");
    await updateProfileDetails(user, values);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePasswordAction(password: string) {
  try {
    const user = await requireUser("settings:manage");
    const adminClient = createAdminClient();

    const { error } = await adminClient.auth.admin.updateUserById(user.id, {
      password
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateSchoolProfileAction(name: string, timezone: string, settings: any) {
  try {
    const user = await requireUser("settings:manage");
    await updateSchoolSettings(user, name, timezone, settings);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── Academic Years ────────────────────────────────────────────────────────────

export async function createAcademicYearAction(data: { name: string; starts_on: string; ends_on: string; is_active: boolean }) {
  try {
    const user = await requireUser("settings:manage");
    await createAcademicYear(user, data);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateAcademicYearAction(id: string, data: { name: string; starts_on: string; ends_on: string; is_active: boolean }) {
  try {
    const user = await requireUser("settings:manage");
    await updateAcademicYear(user, id, data);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteAcademicYearAction(id: string) {
  try {
    const user = await requireUser("settings:manage");
    await deleteAcademicYear(user, id);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── Roles & Status ────────────────────────────────────────────────────────────

export async function updateMemberRoleAction(memberId: string, newRole: string) {
  try {
    const user = await requireUser("users:manage");
    await updateMemberRole(user, memberId, newRole);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateMemberStatusAction(memberId: string, newStatus: string) {
  try {
    const user = await requireUser("users:manage");
    await updateMemberStatus(user, memberId, newStatus);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
