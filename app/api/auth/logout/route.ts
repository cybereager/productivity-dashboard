import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite-server';

export async function POST(req: NextRequest) {
  try {
    const cookieName = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    const sessionSecret = req.cookies.get(cookieName)?.value;

    if (sessionSecret) {
      try {
        const { account } = createSessionClient(sessionSecret);
        await account.deleteSession('current');
      } catch {
        // Session may already be invalid, continue
      }
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(cookieName, '', { maxAge: 0, path: '/' });
    return res;
  } catch (e) {
    console.error('Logout error:', e);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
