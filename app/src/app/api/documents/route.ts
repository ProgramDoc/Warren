import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createDocument, getDocuments, logAudit } from "@/lib/db";
import { uploadToR2 } from "@/lib/storage/r2";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/heic",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// POST: Upload a document
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "other";
    const conversationId = formData.get("conversationId") as string | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}. Allowed: PDF, PNG, JPG, HEIC, XLSX, CSV` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB` },
        { status: 400 }
      );
    }

    const validCategories = ["receipt", "tax", "report", "statement", "other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Tax docs are owner-only; everything else is visible to household
    const accessLevel = category === "tax" ? "owner" : "household";

    // Generate a document ID and sanitize filename
    const docId = randomUUID();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const r2Key = await uploadToR2(
      session.user_id,
      docId,
      sanitizedFilename,
      buffer,
      file.type
    );

    // Create DB record
    const document = await createDocument(
      session.user_id,
      sanitizedFilename,
      file.name,
      file.type,
      file.size,
      r2Key,
      category,
      accessLevel,
      conversationId,
      description
    );

    await logAudit(
      session.user_id,
      "document_upload",
      "document",
      `${document.id}: ${file.name} (${category})`,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET: List documents
export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = req.nextUrl.searchParams.get("category") || undefined;
  const conversationId = req.nextUrl.searchParams.get("conversationId") || undefined;
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);

  const documents = await getDocuments(session.user_id, session.role, {
    category,
    conversationId,
    limit,
  });

  return NextResponse.json({ documents });
}
