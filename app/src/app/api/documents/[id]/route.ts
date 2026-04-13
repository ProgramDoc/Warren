import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getDocument, softDeleteDocument, logAudit } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage/r2";

// GET: Get download URL for a document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await getDocument(id, session.user_id, session.role);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const url = await getDownloadUrl(doc.r2_key);

  return NextResponse.json({
    url,
    filename: doc.original_filename,
    mime_type: doc.mime_type,
    size_bytes: doc.size_bytes,
  });
}

// DELETE: Soft delete a document
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await softDeleteDocument(id, session.user_id);

  if (!deleted) {
    return NextResponse.json({ error: "Document not found or already deleted" }, { status: 404 });
  }

  await logAudit(
    session.user_id,
    "document_delete",
    "document",
    `${id}`,
    req.headers.get("x-forwarded-for") || undefined
  );

  return NextResponse.json({ success: true });
}
