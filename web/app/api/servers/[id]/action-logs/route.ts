import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';

// Define actionLogsConfig schema (import from root not working in Next.js)
import { pgTable, serial, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

const actionLogsConfig = pgTable('action_logs_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  logChannelId: text('log_channel_id'),
  
  // Display Settings
  showAvatar: boolean('show_avatar').default(true),
  showAccountAge: boolean('show_account_age').default(true),
  
  // Ignore Settings
  ignoredChannels: jsonb('ignored_channels').default([]),
  ignoredRoles: jsonb('ignored_roles').default([]),
  
  // Message Events (6)
  enableMessageDelete: boolean('enable_message_delete').default(true),
  enableMessageEdit: boolean('enable_message_edit').default(true),
  enableImageDelete: boolean('enable_image_delete').default(true),
  enableBulkDelete: boolean('enable_bulk_delete').default(true),
  enableInviteLog: boolean('enable_invite_log').default(false),
  enableModeratorCommands: boolean('enable_moderator_commands').default(false),
  
  // Member Events (9)
  enableMemberJoin: boolean('enable_member_join').default(true),
  enableMemberLeave: boolean('enable_member_leave').default(true),
  enableMemberRoleAdd: boolean('enable_member_role_add').default(false),
  enableMemberRoleRemove: boolean('enable_member_role_remove').default(false),
  enableMemberTimeout: boolean('enable_member_timeout').default(true),
  enableNicknameChange: boolean('enable_nickname_change').default(false),
  enableMemberBan: boolean('enable_member_ban').default(true),
  enableMemberUnban: boolean('enable_member_unban').default(true),
  enableMemberKick: boolean('enable_member_kick').default(true),
  
  // Role Events (3)
  enableRoleCreate: boolean('enable_role_create').default(false),
  enableRoleDelete: boolean('enable_role_delete').default(false),
  enableRoleUpdate: boolean('enable_role_update').default(false),
  
  // Channel Events (3)
  enableChannelCreate: boolean('enable_channel_create').default(false),
  enableChannelUpdate: boolean('enable_channel_update').default(false),
  enableChannelDelete: boolean('enable_channel_delete').default(false),
  
  // Emoji Events (3)
  enableEmojiCreate: boolean('enable_emoji_create').default(false),
  enableEmojiUpdate: boolean('enable_emoji_update').default(false),
  enableEmojiDelete: boolean('enable_emoji_delete').default(false),
  
  // Voice Events (3)
  enableVoiceJoin: boolean('enable_voice_join').default(false),
  enableVoiceLeave: boolean('enable_voice_leave').default(false),
  enableVoiceMove: boolean('enable_voice_move').default(false),
  
  // Server Events (1)
  enableServerUpdate: boolean('enable_server_update').default(true),
  
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

  const config = await db.select().from(actionLogsConfig).where(eq(actionLogsConfig.serverId, id)).limit(1);

  if (config.length === 0) {
    return NextResponse.json({
      logChannelId: '',
      showAvatar: true,
      showAccountAge: true,
      ignoredChannels: [],
      ignoredRoles: [],
      enableMessageDelete: true,
      enableMessageEdit: true,
      enableImageDelete: true,
      enableBulkDelete: true,
      enableInviteLog: false,
      enableModeratorCommands: false,
      enableMemberJoin: true,
      enableMemberLeave: true,
      enableMemberRoleAdd: false,
      enableMemberRoleRemove: false,
      enableMemberTimeout: true,
      enableNicknameChange: false,
      enableMemberBan: true,
      enableMemberUnban: true,
      enableMemberKick: true,
      enableMemberUpdate: false,
      enableRoleCreate: false,
      enableRoleDelete: false,
      enableRoleUpdate: false,
      enableChannelCreate: false,
      enableChannelUpdate: false,
      enableChannelDelete: false,
      enableEmojiCreate: false,
      enableEmojiUpdate: false,
      enableEmojiDelete: false,
      enableVoiceJoin: false,
      enableVoiceLeave: false,
      enableVoiceMove: false,
      enableServerUpdate: true
    });
  }

  return NextResponse.json({
    logChannelId: config[0].logChannelId || '',
    showAvatar: config[0].showAvatar ?? true,
    showAccountAge: config[0].showAccountAge ?? true,
    ignoredChannels: config[0].ignoredChannels || [],
    ignoredRoles: config[0].ignoredRoles || [],
    enableMessageDelete: config[0].enableMessageDelete ?? true,
    enableMessageEdit: config[0].enableMessageEdit ?? true,
    enableImageDelete: config[0].enableImageDelete ?? true,
    enableBulkDelete: config[0].enableBulkDelete ?? true,
    enableInviteLog: config[0].enableInviteLog ?? false,
    enableModeratorCommands: config[0].enableModeratorCommands ?? false,
    enableMemberJoin: config[0].enableMemberJoin ?? true,
    enableMemberLeave: config[0].enableMemberLeave ?? true,
    enableMemberRoleAdd: config[0].enableMemberRoleAdd ?? false,
    enableMemberRoleRemove: config[0].enableMemberRoleRemove ?? false,
    enableMemberTimeout: config[0].enableMemberTimeout ?? true,
    enableNicknameChange: config[0].enableNicknameChange ?? false,
    enableMemberBan: config[0].enableMemberBan ?? true,
    enableMemberUnban: config[0].enableMemberUnban ?? true,
    enableMemberKick: config[0].enableMemberKick ?? true,
    enableMemberUpdate: config[0].enableMemberUpdate ?? false,
    enableRoleCreate: config[0].enableRoleCreate ?? false,
    enableRoleDelete: config[0].enableRoleDelete ?? false,
    enableRoleUpdate: config[0].enableRoleUpdate ?? false,
    enableChannelCreate: config[0].enableChannelCreate ?? false,
    enableChannelUpdate: config[0].enableChannelUpdate ?? false,
    enableChannelDelete: config[0].enableChannelDelete ?? false,
    enableEmojiCreate: config[0].enableEmojiCreate ?? false,
    enableEmojiUpdate: config[0].enableEmojiUpdate ?? false,
    enableEmojiDelete: config[0].enableEmojiDelete ?? false,
    enableVoiceJoin: config[0].enableVoiceJoin ?? false,
    enableVoiceLeave: config[0].enableVoiceLeave ?? false,
    enableVoiceMove: config[0].enableVoiceMove ?? false,
    enableServerUpdate: config[0].enableServerUpdate ?? true
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

  const existing = await db.select().from(actionLogsConfig).where(eq(actionLogsConfig.serverId, id)).limit(1);

  if (existing.length === 0) {
    await db.insert(actionLogsConfig).values({
      serverId: id,
      logChannelId: body.logChannelId || '',
      showAvatar: body.showAvatar ?? true,
      showAccountAge: body.showAccountAge ?? true,
      ignoredChannels: body.ignoredChannels || [],
      ignoredRoles: body.ignoredRoles || [],
      enableMessageDelete: body.enableMessageDelete ?? true,
      enableMessageEdit: body.enableMessageEdit ?? true,
      enableImageDelete: body.enableImageDelete ?? true,
      enableBulkDelete: body.enableBulkDelete ?? true,
      enableInviteLog: body.enableInviteLog ?? false,
      enableModeratorCommands: body.enableModeratorCommands ?? false,
      enableMemberJoin: body.enableMemberJoin ?? true,
      enableMemberLeave: body.enableMemberLeave ?? true,
      enableMemberRoleAdd: body.enableMemberRoleAdd ?? false,
      enableMemberRoleRemove: body.enableMemberRoleRemove ?? false,
      enableMemberTimeout: body.enableMemberTimeout ?? true,
      enableNicknameChange: body.enableNicknameChange ?? false,
      enableMemberBan: body.enableMemberBan ?? true,
      enableMemberUnban: body.enableMemberUnban ?? true,
      enableMemberKick: body.enableMemberKick ?? true,
      enableMemberUpdate: body.enableMemberUpdate ?? false,
      enableRoleCreate: body.enableRoleCreate ?? false,
      enableRoleDelete: body.enableRoleDelete ?? false,
      enableRoleUpdate: body.enableRoleUpdate ?? false,
      enableChannelCreate: body.enableChannelCreate ?? false,
      enableChannelUpdate: body.enableChannelUpdate ?? false,
      enableChannelDelete: body.enableChannelDelete ?? false,
      enableEmojiCreate: body.enableEmojiCreate ?? false,
      enableEmojiUpdate: body.enableEmojiUpdate ?? false,
      enableEmojiDelete: body.enableEmojiDelete ?? false,
      enableVoiceJoin: body.enableVoiceJoin ?? false,
      enableVoiceLeave: body.enableVoiceLeave ?? false,
      enableVoiceMove: body.enableVoiceMove ?? false,
      enableServerUpdate: body.enableServerUpdate ?? true
    });
  } else {
    await db.update(actionLogsConfig)
      .set({
        logChannelId: body.logChannelId || '',
        showAvatar: body.showAvatar ?? true,
        showAccountAge: body.showAccountAge ?? true,
        ignoredChannels: body.ignoredChannels || [],
        ignoredRoles: body.ignoredRoles || [],
        enableMessageDelete: body.enableMessageDelete ?? true,
        enableMessageEdit: body.enableMessageEdit ?? true,
        enableImageDelete: body.enableImageDelete ?? true,
        enableBulkDelete: body.enableBulkDelete ?? true,
        enableInviteLog: body.enableInviteLog ?? false,
        enableModeratorCommands: body.enableModeratorCommands ?? false,
        enableMemberJoin: body.enableMemberJoin ?? true,
        enableMemberLeave: body.enableMemberLeave ?? true,
        enableMemberRoleAdd: body.enableMemberRoleAdd ?? false,
        enableMemberRoleRemove: body.enableMemberRoleRemove ?? false,
        enableMemberTimeout: body.enableMemberTimeout ?? true,
        enableNicknameChange: body.enableNicknameChange ?? false,
        enableMemberBan: body.enableMemberBan ?? true,
        enableMemberUnban: body.enableMemberUnban ?? true,
        enableMemberKick: body.enableMemberKick ?? true,
        enableMemberUpdate: body.enableMemberUpdate ?? false,
        enableRoleCreate: body.enableRoleCreate ?? false,
        enableRoleDelete: body.enableRoleDelete ?? false,
        enableRoleUpdate: body.enableRoleUpdate ?? false,
        enableChannelCreate: body.enableChannelCreate ?? false,
        enableChannelUpdate: body.enableChannelUpdate ?? false,
        enableChannelDelete: body.enableChannelDelete ?? false,
        enableEmojiCreate: body.enableEmojiCreate ?? false,
        enableEmojiUpdate: body.enableEmojiUpdate ?? false,
        enableEmojiDelete: body.enableEmojiDelete ?? false,
        enableVoiceJoin: body.enableVoiceJoin ?? false,
        enableVoiceLeave: body.enableVoiceLeave ?? false,
        enableVoiceMove: body.enableVoiceMove ?? false,
        enableServerUpdate: body.enableServerUpdate ?? true,
        updatedAt: new Date(),
      })
      .where(eq(actionLogsConfig.serverId, id));
  }

  return NextResponse.json({ success: true });
}
