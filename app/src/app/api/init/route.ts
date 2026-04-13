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

    // Run migrations for columns added after initial schema
    const migrations = [
      `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS shared_with UUID REFERENCES users(id) ON DELETE SET NULL`,
      // Phase 2: Projects for organizing conversations
      `CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL`,
      `CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id)`,
      // Phase 2.5: Document storage
      `CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        r2_key TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('receipt', 'tax', 'report', 'statement', 'other')),
        access_level TEXT NOT NULL DEFAULT 'owner' CHECK(access_level IN ('owner', 'household')),
        conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
        description TEXT,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category)`,
      `CREATE INDEX IF NOT EXISTS idx_documents_conversation ON documents(conversation_id)`,
    ];
    for (const sql of migrations) {
      try { await query(sql); } catch (e) { console.log("Migration skipped:", e); }
    }

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
