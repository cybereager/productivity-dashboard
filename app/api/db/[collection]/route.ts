import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient, ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

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

// GET /api/db/[collection]?userId=xxx
export async function GET(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  try {
    const { collection } = await params;
    const colId = COLLECTION_MAP[collection];
    if (!colId) return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });

    const db = getDb(req);
    const userId = req.nextUrl.searchParams.get('userId');
    const queries = userId ? [Query.equal('userId', userId), Query.orderDesc('$createdAt')] : [Query.orderDesc('$createdAt')];

    const res = await db.listDocuments(DB_ID, colId, queries);
    return NextResponse.json({ documents: res.documents, total: res.total });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/db/[collection]
export async function POST(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  try {
    const { collection } = await params;
    const colId = COLLECTION_MAP[collection];
    if (!colId) return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });

    const body = await req.json();
    const db = getDb(req);
    const doc = await db.createDocument(DB_ID, colId, ID.unique(), body);
    return NextResponse.json(doc);
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
