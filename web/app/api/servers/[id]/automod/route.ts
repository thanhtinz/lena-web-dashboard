import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';

// Define autoModConfig schema
import { pgTable, serial, text, boolean, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

const autoModConfig = pgTable('auto_mod_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  enabled: boolean('enabled').default(false),
  antiSpam: boolean('anti_spam').default(true),
  spamThreshold: integer('spam_threshold').default(5),
  spamTimeWindow: integer('spam_time_window').default(5),
  antiLinks: boolean('anti_links').default(false),
  whitelistedDomains: jsonb('whitelisted_domains').$type<string[]>().default([]),
  antiInvites: boolean('anti_invites').default(false),
  antiCaps: boolean('anti_caps').default(false),
  capsPercentage: integer('caps_percentage').default(70),
  antiMentionSpam: boolean('anti_mention_spam').default(true),
  mentionThreshold: integer('mention_threshold').default(5),
  bannedWords: jsonb('banned_words').$type<string[]>().default([]),
  actionType: text('action_type').default('warn'),
  ignoredChannels: jsonb('ignored_channels').$type<string[]>().default([]),
  ignoredRoles: jsonb('ignored_roles').$type<string[]>().default([]),
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

  const config = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, id)).limit(1);

  if (config.length === 0) {
    return NextResponse.json({
      enabled: false,
      antiSpam: true,
      spamThreshold: 5,
      spamTimeWindow: 5,
      antiLinks: false,
      whitelistedDomains: [],
      antiInvites: false,
      antiCaps: false,
      capsPercentage: 70,
      antiMentionSpam: true,
      mentionThreshold: 5,
      bannedWords: [],
      actionType: 'warn',
      ignoredChannels: [],
      ignoredRoles: []
    });
  }

  return NextResponse.json({
    enabled: config[0].enabled ?? false,
    antiSpam: config[0].antiSpam ?? true,
    spamThreshold: config[0].spamThreshold ?? 5,
    spamTimeWindow: config[0].spamTimeWindow ?? 5,
    antiLinks: config[0].antiLinks ?? false,
    whitelistedDomains: config[0].whitelistedDomains || [],
    antiInvites: config[0].antiInvites ?? false,
    antiCaps: config[0].antiCaps ?? false,
    capsPercentage: config[0].capsPercentage ?? 70,
    antiMentionSpam: config[0].antiMentionSpam ?? true,
    mentionThreshold: config[0].mentionThreshold ?? 5,
    bannedWords: config[0].bannedWords || [],
    actionType: config[0].actionType || 'warn',
    ignoredChannels: config[0].ignoredChannels || [],
    ignoredRoles: config[0].ignoredRoles || []
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

  const existing = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, id)).limit(1);

  if (existing.length === 0) {
    await db.insert(autoModConfig).values({
      serverId: id,
      enabled: body.enabled ?? false,
      antiSpam: body.antiSpam ?? true,
      spamThreshold: body.spamThreshold ?? 5,
      spamTimeWindow: body.spamTimeWindow ?? 5,
      antiLinks: body.antiLinks ?? false,
      whitelistedDomains: body.whitelistedDomains || [],
      antiInvites: body.antiInvites ?? false,
      antiCaps: body.antiCaps ?? false,
      capsPercentage: body.capsPercentage ?? 70,
      antiMentionSpam: body.antiMentionSpam ?? true,
      mentionThreshold: body.mentionThreshold ?? 5,
      bannedWords: body.bannedWords || [],
      actionType: body.actionType || 'warn',
      ignoredChannels: body.ignoredChannels || [],
      ignoredRoles: body.ignoredRoles || []
    });
  } else {
    await db.update(autoModConfig)
      .set({
        enabled: body.enabled ?? false,
        antiSpam: body.antiSpam ?? true,
        spamThreshold: body.spamThreshold ?? 5,
        spamTimeWindow: body.spamTimeWindow ?? 5,
        antiLinks: body.antiLinks ?? false,
        whitelistedDomains: body.whitelistedDomains || [],
        antiInvites: body.antiInvites ?? false,
        antiCaps: body.antiCaps ?? false,
        capsPercentage: body.capsPercentage ?? 70,
        antiMentionSpam: body.antiMentionSpam ?? true,
        mentionThreshold: body.mentionThreshold ?? 5,
        bannedWords: body.bannedWords || [],
        actionType: body.actionType || 'warn',
        ignoredChannels: body.ignoredChannels || [],
        ignoredRoles: body.ignoredRoles || [],
        updatedAt: new Date(),
      })
      .where(eq(autoModConfig.serverId, id));
  }

  return NextResponse.json({ success: true });
}
