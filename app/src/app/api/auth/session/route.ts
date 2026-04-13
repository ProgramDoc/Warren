import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserCount, getUserById } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  const userCount = await getUserCount();

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      needsSetup: userCount === 0,
    });
  }

  const user = await getUserById(session.user_id);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user_id,
      email: session.email,
      displayName: session.display_name,
      role: session.role,
      totpEnabled: user?.totp_enabled || false,
    },
  });
}
