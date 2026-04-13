import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getConversations,
  getConversation,
  getMessages,
  deleteConversation,
} from "@/lib/db";

// GET: List conversations or get single conversation with messages
export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    // Get single conversation with messages
    const conv = await getConversation(id, session.user_id);
    if (!conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    const messages = await getMessages(id);
    return NextResponse.json({ conversation: conv, messages });
  }

  // List all conversations
  const conversations = await getConversations(session.user_id);
  return NextResponse.json({ conversations });
}

// DELETE: Delete a conversation
export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteConversation(id, session.user_id);
  return NextResponse.json({ success: true });
}
