import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserCount, createUser, getUserByEmail, logAudit } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";

const RegisterSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  password: z.string().min(12),
  role: z.enum(["owner", "household"]).default("household"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, displayName, password, role } = parsed.data;

    // Validate password strength
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { error: "Weak password", details: strength.errors },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const userCount = await getUserCount();

    // First user is always owner
    const actualRole = userCount === 0 ? "owner" : role;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(email, displayName, passwordHash, actualRole);

    // Create session
    await createUserSession(user.id);

    // Audit
    await logAudit(
      user.id,
      "register",
      "auth",
      `role: ${actualRole}`,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({
      success: true,
      role: actualRole,
      email,
      displayName,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
