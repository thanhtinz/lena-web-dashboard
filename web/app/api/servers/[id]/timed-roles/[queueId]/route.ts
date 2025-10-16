import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { timedRoleQueue } from '@/lib/schema';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; queueId: string }> }
) {
  const { id, queueId } = await params;
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

  try {
    await db.delete(timedRoleQueue)
      .where(
        and(
          eq(timedRoleQueue.id, parseInt(queueId)),
          eq(timedRoleQueue.serverId, id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting timed role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete timed role' },
      { status: 500 }
    );
  }
}
