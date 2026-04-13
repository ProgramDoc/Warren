import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getConversations,
  getConversation,
  getMessages,
  deleteConversation,
  updateConversationTitle,
  shareConversation,
  moveConversationToProject,
} from "@/lib/db";

// GET: List conversations or get single conversation with messages
export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");

  if (id) {
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

  const conversations = await getConversations(session.user_id);
  return NextResponse.json({ conversations });
}

// PATCH: Rename or share a conversation
export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, title, shareWith } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Verify the user owns or has access to this conversation
  const conv = await getConversation(id, session.user_id);
  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // Rename
  if (title !== undefined) {
    await updateConversationTitle(id, title);
  }

  // Share/unshare (only the owner can share)
  if (shareWith !== undefined && conv.user_id === session.user_id) {
    await shareConversation(id, session.user_id, shareWith);
  }

  // Move to project (only the owner can move)
  if (body.projectId !== undefined && conv.user_id === session.user_id) {
    await moveConversationToProject(id, session.user_id, body.projectId);
  }

  return NextResponse.json({ success: true });
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
