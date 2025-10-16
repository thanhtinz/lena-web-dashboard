import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { reactionRoleUserBlacklist, reactionRoleMessages } from '@/lib/schema';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string; blacklistId: string }> }
) {
  const { id, messageId, blacklistId } = await params;
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
    // Get message config ID to verify ownership
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

    // Delete only if entry belongs to this message
    await db.delete(reactionRoleUserBlacklist)
      .where(
        and(
          eq(reactionRoleUserBlacklist.id, parseInt(blacklistId)),
          eq(reactionRoleUserBlacklist.serverId, id),
          eq(reactionRoleUserBlacklist.messageConfigId, message[0].id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing from user blacklist:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove from user blacklist' },
      { status: 500 }
    );
  }
}
