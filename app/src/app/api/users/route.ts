import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getAllUsers } from "@/lib/db";

// GET: List all users (for share picker)
export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getAllUsers();
  // Filter out the current user — you don't share with yourself
  const otherUsers = users.filter((u) => u.id !== session.user_id);
  return NextResponse.json({ users: otherUsers });
}
