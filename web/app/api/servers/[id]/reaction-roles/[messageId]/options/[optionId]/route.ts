import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { reactionRoleOptions, reactionRoleMessages } from '@/lib/schema';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string; optionId: string }> }
) {
  const { id, messageId, optionId } = await params;
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
    // Get option details
    const option = await db.select().from(reactionRoleOptions)
      .where(eq(reactionRoleOptions.id, parseInt(optionId)))
      .limit(1);

    if (option.length === 0) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    // Get message details
    const message = await db.select().from(reactionRoleMessages)
      .where(eq(reactionRoleMessages.id, option[0].messageConfigId))
      .limit(1);

    if (message.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Remove reaction from Discord message
    await fetch(
      `https://discord.com/api/v10/channels/${message[0].channelId}/messages/${messageId}/reactions/${encodeURIComponent(option[0].emoji)}/@me`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    // Delete from database
    await db.delete(reactionRoleOptions)
      .where(
        and(
          eq(reactionRoleOptions.id, parseInt(optionId)),
          eq(reactionRoleOptions.serverId, id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting option:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete option' },
      { status: 500 }
    );
  }
}
