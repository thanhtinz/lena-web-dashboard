import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { pgTable, serial, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

const autoDeleteConfig = pgTable('auto_delete_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  enabled: boolean('enabled').default(false),
  channelIds: jsonb('channel_ids'),
  deleteAfterSeconds: serial('delete_after_seconds'),
  whitelistRoleIds: jsonb('whitelist_role_ids'),
  whitelistUserIds: jsonb('whitelist_user_ids'),
  deleteCommands: boolean('delete_commands').default(false),
  deleteBotReplies: boolean('delete_bot_replies').default(false),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const config = await db.select().from(autoDeleteConfig).where(eq(autoDeleteConfig.serverId, id)).limit(1);

  if (config.length === 0) {
    return NextResponse.json({
      enabled: false,
      channels: []
    });
  }

  return NextResponse.json({
    enabled: config[0].enabled ?? false,
    channels: config[0].channels || []
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const body = await request.json();

  const existing = await db.select().from(autoDeleteConfig).where(eq(autoDeleteConfig.serverId, id)).limit(1);

  if (existing.length === 0) {
    await db.insert(autoDeleteConfig).values({
      serverId: id,
      enabled: body.enabled ?? false,
      channels: body.channels || []
    });
  } else {
    await db.update(autoDeleteConfig)
      .set({
        enabled: body.enabled ?? false,
        channels: body.channels || [],
        updatedAt: new Date(),
      })
      .where(eq(autoDeleteConfig.serverId, id));
  }

  return NextResponse.json({ success: true });
}
