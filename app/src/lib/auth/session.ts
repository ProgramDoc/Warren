import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createSession, getSession, deleteSession } from "../db";

const SESSION_DURATION_HOURS = 24;
const COOKIE_NAME = "warren_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createUserSession(userId: string): Promise<string> {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000
  );

  // Store in DB
  const session = await createSession(userId, expiresAt);

  // Create JWT
  const token = await new SignJWT({ sessionId: session.id, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getJwtSecret());

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return session.id;
}

export async function getCurrentSession(): Promise<{
  id: string;
  user_id: string;
  role: string;
  email: string;
  display_name: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const sessionId = payload.sessionId as string;
    if (!sessionId) return null;

    const session = await getSession(sessionId);
    return session;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const sessionId = payload.sessionId as string;
    if (sessionId) {
      await deleteSession(sessionId);
    }
  } catch {
    // Token invalid, just clear cookie
  }

  cookieStore.delete(COOKIE_NAME);
}
