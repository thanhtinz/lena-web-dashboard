import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { reactionRoleMessages, reactionRoleOptions } from '@/lib/schema';

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

  // Get message config ID
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

  const options = await db.select().from(reactionRoleOptions)
    .where(eq(reactionRoleOptions.messageConfigId, message[0].id));

  return NextResponse.json(options);
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
    const { emoji, roleId, description } = body;

    if (!emoji || !roleId) {
      return NextResponse.json({ error: 'Emoji and role are required' }, { status: 400 });
    }

    // Get message config ID
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

    // Check if emoji already exists for this message
    const existingOption = await db.select().from(reactionRoleOptions)
      .where(
        and(
          eq(reactionRoleOptions.messageConfigId, message[0].id),
          eq(reactionRoleOptions.emoji, emoji)
        )
      )
      .limit(1);

    if (existingOption.length > 0) {
      return NextResponse.json({ error: 'This emoji is already used for this message. Please choose a different emoji.' }, { status: 400 });
    }

    // Add reaction to Discord message
    const discordResponse = await fetch(
      `https://discord.com/api/v10/channels/${message[0].channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!discordResponse.ok) {
      const error = await discordResponse.json();
      console.error('Discord API error:', error);
      return NextResponse.json(
        { error: 'Failed to add reaction to Discord message' },
        { status: discordResponse.status }
      );
    }

    // Save to database
    await db.insert(reactionRoleOptions).values({
      messageConfigId: message[0].id,
      serverId: id,
      emoji,
      roleId,
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error adding option:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add option' },
      { status: 500 }
    );
  }
}
