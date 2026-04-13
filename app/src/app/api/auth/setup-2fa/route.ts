import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { generateTotpSetup, verifyTotpCode, encryptTotpSecret } from "@/lib/auth/totp";
import { getUserById, setTotpSecret, enableTotp, disableTotp, logAudit } from "@/lib/db";

const VerifySchema = z.object({
  code: z.string().length(6),
  secret: z.string().min(1),
});

// GET: Generate a new TOTP secret + QR code
export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserById(session.user_id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const setup = await generateTotpSetup(user.email);

    return NextResponse.json({
      qrCodeUrl: setup.qrCodeUrl,
      secret: setup.secret,       // raw secret — user stores this temporarily to verify
      otpauthUri: setup.otpauthUri,
      totpEnabled: user.totp_enabled,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA setup" },
      { status: 500 }
    );
  }
}

// POST: Verify a TOTP code and enable 2FA
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { code, secret } = parsed.data;

    // Encrypt the secret first, then verify against it
    const encrypted = encryptTotpSecret(secret);
    const valid = verifyTotpCode(code, encrypted);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid code. Make sure your authenticator app is synced and try again." },
        { status: 400 }
      );
    }

    // Store encrypted secret and enable 2FA
    await setTotpSecret(session.user_id, encrypted);
    await enableTotp(session.user_id);

    await logAudit(
      session.user_id,
      "enable_2fa",
      "auth",
      undefined,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ success: true, message: "2FA enabled" });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    );
  }
}

// DELETE: Disable 2FA
export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await disableTotp(session.user_id);

    await logAudit(
      session.user_id,
      "disable_2fa",
      "auth",
      undefined,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ success: true, message: "2FA disabled" });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}
