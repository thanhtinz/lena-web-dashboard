import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { autoRoleBlacklist } from '@/lib/schema';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blacklistId: string }> }
) {
  const { id, blacklistId } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifySession(sessionCookie.value);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = user.guilds?.some((g: any) => g.id === id);

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.delete(autoRoleBlacklist).where(eq(autoRoleBlacklist.id, parseInt(blacklistId)));

  return NextResponse.json({ success: true });
}
