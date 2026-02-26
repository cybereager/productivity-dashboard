import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, ID } from '@/lib/appwrite-server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    }

    const { account } = createAdminClient();

    // Create user account
    await account.create(ID.unique(), email, password, name);

    // Create session
    const session = await account.createEmailPasswordSession(email, password);

    const res = NextResponse.json({
      success: true,
      userId: session.userId,
      name,
      email,
    });

    // Set session cookie
    res.cookies.set(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (e: unknown) {
    const err = e as { code?: number; message?: string };
    if (err.code === 409) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
