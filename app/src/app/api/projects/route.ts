import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getProjects,
  createProject,
  updateProjectName,
  deleteProject,
} from "@/lib/db";

// GET: List all projects for the current user
export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getProjects(session.user_id);
  return NextResponse.json({ projects });
}

// POST: Create a new project
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const project = await createProject(session.user_id, name.trim());
  return NextResponse.json({ project });
}

// PATCH: Rename a project
export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name } = await req.json();
  if (!id || !name?.trim()) {
    return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
  }

  await updateProjectName(id, session.user_id, name.trim());
  return NextResponse.json({ success: true });
}

// DELETE: Delete a project (conversations become unfiled)
export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteProject(id, session.user_id);
  return NextResponse.json({ success: true });
}
