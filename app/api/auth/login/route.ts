import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    // Get user details
    const sessionClient = (await import('@/lib/appwrite-server')).createSessionClient(session.secret);
    const user = await sessionClient.account.get();

    const res = NextResponse.json({
      success: true,
      user: {
        $id: user.$id,
        name: user.name,
        email: user.email,
        labels: user.labels,
        $createdAt: user.$createdAt,
      },
    });

    res.cookies.set(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e: unknown) {
    const err = e as { code?: number; message?: string };
    if (err.code === 401 || err.code === 400) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
