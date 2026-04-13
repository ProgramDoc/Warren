import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail, logAudit } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";
import { verifyTotpCode } from "@/lib/auth/totp";
import { SignJWT } from "jose";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().length(6).optional(),
});

// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Short-lived token for the TOTP step (5 minutes)
function getTotpJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return new TextEncoder().encode(secret + "-totp-pending");
}

async function createPendingTotpToken(userId: string): Promise<string> {
  return new SignJWT({ userId, purpose: "totp_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getTotpJwtSecret());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, totpCode } = parsed.data;
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      await logAudit(user.id, "login_failed", "auth", undefined, ip);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.totp_enabled && user.totp_secret) {
      // If no TOTP code provided, return pending state with temp token
      if (!totpCode) {
        const pendingToken = await createPendingTotpToken(user.id);
        return NextResponse.json({
          requiresTotp: true,
          pendingToken,
        });
      }

      // Verify TOTP code
      const totpValid = verifyTotpCode(totpCode, user.totp_secret);
      if (!totpValid) {
        await logAudit(user.id, "totp_failed", "auth", undefined, ip);
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 401 }
        );
      }
    }

    // Create session (password verified + TOTP verified if enabled)
    await createUserSession(user.id);
    await logAudit(user.id, "login", "auth", undefined, ip);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
