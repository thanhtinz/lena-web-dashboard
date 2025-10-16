import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { reactionRoleMessages, reactionRoleUserBlacklist } from '@/lib/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id, messageId } = await params;
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

  const message = await db.select().from(reactionRoleMessages)
    .where(
      and(
        eq(reactionRoleMessages.serverId, id),
        eq(reactionRoleMessages.messageId, messageId)
      )
    )
    .limit(1);

  if (message.length === 0) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  const blacklist = await db.select().from(reactionRoleUserBlacklist)
    .where(eq(reactionRoleUserBlacklist.messageConfigId, message[0].id));

  return NextResponse.json(blacklist);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id, messageId } = await params;
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
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const message = await db.select().from(reactionRoleMessages)
      .where(
        and(
          eq(reactionRoleMessages.serverId, id),
          eq(reactionRoleMessages.messageId, messageId)
        )
      )
      .limit(1);

    if (message.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await db.insert(reactionRoleUserBlacklist).values({
      messageConfigId: message[0].id,
      serverId: id,
      userId
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error adding to user blacklist:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add to user blacklist' },
      { status: 500 }
    );
  }
}
