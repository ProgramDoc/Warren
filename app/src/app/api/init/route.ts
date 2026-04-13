import { NextRequest, NextResponse } from "next/server";
import { initDb, getUserCount } from "@/lib/db";

// POST: Initialize database schema
// Protected by a secret key — only run once during setup
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const initSecret = process.env.INIT_SECRET || "warren-init-2026";

  if (authHeader !== `Bearer ${initSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();
    const userCount = await getUserCount();

    return NextResponse.json({
      success: true,
      message: "Database schema initialized",
      userCount,
    });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json(
      { error: "Initialization failed", details: String(error) },
      { status: 500 }
    );
  }
}
