import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { markAllAnnouncementsRead } from "@/lib/services/announcements";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await markAllAnnouncementsRead(user);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
