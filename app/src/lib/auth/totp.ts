import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { encrypt, decrypt } from "@/lib/crypto";

const ISSUER = "Warren";

// Generate a new TOTP secret and return it with a QR code data URL
export async function generateTotpSetup(email: string): Promise<{
  secret: string;         // raw base32 secret (encrypt before storing)
  qrCodeUrl: string;      // data:image/png;base64 QR code
  otpauthUri: string;     // otpauth:// URI for manual entry
}> {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });

  const uri = totp.toString();
  const qrCodeUrl = await QRCode.toDataURL(uri);

  return {
    secret: totp.secret.base32,
    qrCodeUrl,
    otpauthUri: uri,
  };
}

// Verify a TOTP code against an encrypted secret
export function verifyTotpCode(code: string, encryptedSecret: string): boolean {
  const secret = decrypt(encryptedSecret);

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // Allow 1 window of drift (30 seconds before/after)
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

// Encrypt a TOTP secret for database storage
export function encryptTotpSecret(secret: string): string {
  return encrypt(secret);
}
