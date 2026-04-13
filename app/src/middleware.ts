import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/session",
  "/api/init",
  "/login",
  "/setup",
  "/_next",
  "/favicon.ico",
];

// Paths restricted to owner role only
const OWNER_ONLY_PATHS = [
  "/api/dashboard", // Dashboard returns filtered data, but endpoint itself needs auth
  "/tax",
  "/income",
  "/api/vault/03-Tax",
  "/api/vault/05-Income",
  "/api/vault/07-Tax-Documents",
  "/api/vault/08-Reports",
];

// Paths accessible by household role
const HOUSEHOLD_PATHS = [
  "/",
  "/budget",
  "/expenses",
  "/bills",
  "/api/expenses",
  "/api/vault/04-Budget",
  "/api/vault/06-Cash-Flow",
];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session
  const token = request.cookies.get("warren_session")?.value;
  if (!token) {
    // Redirect to login for page requests, 401 for API
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId as string);

    return response;
  } catch {
    // Invalid token
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
