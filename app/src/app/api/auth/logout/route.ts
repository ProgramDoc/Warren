import { NextResponse } from "next/server";
import { destroySession, getCurrentSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/db";

export async function POST() {
  const session = await getCurrentSession();
  if (session) {
    await logAudit(session.user_id, "logout", "auth");
  }
  await destroySession();
  return NextResponse.json({ success: true });
}
