import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';
import { supportTickets } from '@/lib/schema';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifySession(sessionCookie.value);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  try {
    await db.insert(supportTickets).values({
      userId: user.id,
      username: user.username,
      subject: body.subject,
      category: body.category,
      priority: body.priority,
      message: body.message,
      status: 'open',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create support ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
