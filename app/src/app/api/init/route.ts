import { NextRequest, NextResponse } from "next/server";
import { initDb, getUserCount, getUserByEmail, createUser, query } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import fs from "fs";
import path from "path";

// POST: Initialize database schema + create user accounts
// Protected by a secret key — only run once during setup
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const initSecret = process.env.INIT_SECRET || "warren-init-2026";

  if (authHeader !== `Bearer ${initSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();

    const usersCreated: string[] = [];

    // Create owner account from env vars
    const ownerEmail = process.env.OWNER_EMAIL;
    const ownerPassword = process.env.OWNER_PASSWORD;
    if (ownerEmail && ownerPassword) {
      const existing = await getUserByEmail(ownerEmail);
      if (!existing) {
        const hash = await hashPassword(ownerPassword);
        await createUser(ownerEmail, "Tom", hash, "owner");
        usersCreated.push(ownerEmail);
      }
    }

    // Create household account from env vars
    const householdEmail = process.env.HOUSEHOLD_EMAIL;
    const householdPassword = process.env.HOUSEHOLD_PASSWORD;
    if (householdEmail && householdPassword) {
      const existing = await getUserByEmail(householdEmail);
      if (!existing) {
        const hash = await hashPassword(householdPassword);
        await createUser(householdEmail, "SL", hash, "household");
        usersCreated.push(householdEmail);
      }
    }

    // Run seed data
    let seeded = false;
    try {
      const seedPath = path.join(process.cwd(), "src", "lib", "db", "seed.sql");
      const seedSql = fs.readFileSync(seedPath, "utf-8");
      // Split by semicolons and run each statement
      const statements = seedSql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));
      for (const stmt of statements) {
        await query(stmt + ";");
      }
      seeded = true;
    } catch (e) {
      console.error("Seed error (non-fatal):", e);
    }

    const userCount = await getUserCount();

    return NextResponse.json({
      success: true,
      message: "Database initialized and seeded",
      userCount,
      usersCreated,
      seeded,
    });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json(
      { error: "Initialization failed", details: String(error) },
      { status: 500 }
    );
  }
}
