import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';
import { featureFlags } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifySession(sessionCookie.value);

  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  await db.update(featureFlags)
    .set({ 
      enabled: body.enabled,
      updatedAt: new Date()
    })
    .where(eq(featureFlags.id, params.id));

  return NextResponse.json({ success: true });
}
