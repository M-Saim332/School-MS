import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAnnouncements } from "@/lib/services/announcements";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json([], { status: 401 });

  try {
    const data = await getAnnouncements(user);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
