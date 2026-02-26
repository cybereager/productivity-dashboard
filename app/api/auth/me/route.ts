import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite-server';

export async function GET(req: NextRequest) {
  try {
    const cookieName = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    const sessionSecret = req.cookies.get(cookieName)?.value;

    if (!sessionSecret) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { account } = createSessionClient(sessionSecret);
    const user = await account.get();

    return NextResponse.json({
      user: {
        $id: user.$id,
        name: user.name,
        email: user.email,
        labels: user.labels,
        $createdAt: user.$createdAt,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
