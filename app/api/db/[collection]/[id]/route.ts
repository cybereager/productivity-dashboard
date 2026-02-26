import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite-server';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const COLLECTION_MAP: Record<string, string> = {
  tasks: process.env.NEXT_PUBLIC_APPWRITE_TASKS_COLLECTION_ID || 'tasks',
  jobs: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID || 'jobs',
  projects: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID || 'projects',
  habits: process.env.NEXT_PUBLIC_APPWRITE_HABITS_COLLECTION_ID || 'habits',
  budget: process.env.NEXT_PUBLIC_APPWRITE_BUDGET_COLLECTION_ID || 'budget',
  chat: process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID || 'chat',
};

function getDb(req: NextRequest) {
  const cookieName = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  const session = req.cookies.get(cookieName)?.value;
  if (session) return createSessionClient(session).databases;
  return createAdminClient().databases;
}

// PATCH /api/db/[collection]/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  try {
    const { collection, id } = await params;
    const colId = COLLECTION_MAP[collection];
    if (!colId) return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });

    const body = await req.json();
    const db = getDb(req);
    const doc = await db.updateDocument(DB_ID, colId, id, body);
    return NextResponse.json(doc);
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/db/[collection]/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  try {
    const { collection, id } = await params;
    const colId = COLLECTION_MAP[collection];
    if (!colId) return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });

    const db = getDb(req);
    await db.deleteDocument(DB_ID, colId, id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
