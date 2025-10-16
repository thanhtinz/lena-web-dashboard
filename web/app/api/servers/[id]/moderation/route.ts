import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { moderationConfigs } from '@/lib/schema';

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

  const config = await db.select().from(moderationConfigs).where(eq(moderationConfigs.serverId, id)).limit(1);

  if (config.length === 0) {
    return NextResponse.json({
      enabled: true,
      dmOnKick: true,
      dmOnBan: true,
      dmOnMute: true,
      useDiscordTimeout: true,
      deleteModCommands: false,
      respondWithReason: true,
      preserveMessagesOnBan: true,
      logChannelId: null,
      logOptions: {
        logBans: true,
        logUnbans: true,
        logKicks: true,
        logMutes: true,
        logUnmutes: true,
        logWarns: true,
        logPurges: true,
        logLockdowns: true,
        logLocks: true,
        logUnlocks: true,
        logSlowmode: true,
        logRoleChanges: false,
        logChannelUpdates: false,
        logMemberJoin: false,
        logMemberLeave: false,
        logMessageDelete: false,
        logMessageEdit: false,
        logNicknameChange: false,
      },
      moderatorRoles: [],
      protectedRoles: [],
      lockdownChannels: [],
      customMessages: {
        banMessage: 'You have been banned from {server} for: {reason}',
        unbanMessage: 'You have been unbanned from {server}',
        softbanMessage: 'You have been softbanned from {server} for: {reason}',
        kickMessage: 'You have been kicked from {server} for: {reason}',
        muteMessage: 'You have been muted in {server} for: {reason}. Duration: {duration}',
        unmuteMessage: 'You have been unmuted in {server}',
      },
      commandsEnabled: {
        ban: true,
        unban: true,
        kick: true,
        mute: true,
        unmute: true,
        warn: true,
        unwarn: true,
        lock: true,
        unlock: true,
        slowmode: true,
        purge: true,
        nuke: true
      },
    });
  }

  return NextResponse.json({
    enabled: config[0].enabled ?? true,
    dmOnKick: config[0].dmOnKick ?? true,
    dmOnBan: config[0].dmOnBan ?? true,
    dmOnMute: config[0].dmOnMute ?? true,
    useDiscordTimeout: config[0].useDiscordTimeout ?? true,
    deleteModCommands: config[0].deleteModCommands ?? false,
    respondWithReason: config[0].respondWithReason ?? true,
    preserveMessagesOnBan: config[0].preserveMessagesOnBan ?? true,
    logChannelId: config[0].logChannelId,
    logOptions: {
      ...{
      logBans: true,
      logUnbans: true,
      logKicks: true,
      logMutes: true,
      logUnmutes: true,
      logWarns: true,
      logPurges: true,
      logLockdowns: true,
      logLocks: true,
      logUnlocks: true,
      logSlowmode: true,
      logRoleChanges: false,
      logChannelUpdates: false,
      logMemberJoin: false,
      logMemberLeave: false,
      logMessageDelete: false,
      logMessageEdit: false,
      logNicknameChange: false,
      },
      ...(config[0].logOptions || {})
    },
    moderatorRoles: config[0].moderatorRoles || [],
    protectedRoles: config[0].protectedRoles || [],
    lockdownChannels: config[0].lockdownChannels || [],
    customMessages: config[0].customMessages || {
      banMessage: 'You have been banned from {server} for: {reason}',
      unbanMessage: 'You have been unbanned from {server}',
      softbanMessage: 'You have been softbanned from {server} for: {reason}',
      kickMessage: 'You have been kicked from {server} for: {reason}',
      muteMessage: 'You have been muted in {server} for: {reason}. Duration: {duration}',
      unmuteMessage: 'You have been unmuted in {server}',
    },
    commandsEnabled: config[0].commandsEnabled || {
      ban: true,
      unban: true,
      kick: true,
      mute: true,
      unmute: true,
      warn: true,
      unwarn: true,
      lock: true,
      unlock: true,
      slowmode: true,
      purge: true,
      nuke: true
    },
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

  const existing = await db.select().from(moderationConfigs).where(eq(moderationConfigs.serverId, id)).limit(1);

  if (existing.length === 0) {
    await db.insert(moderationConfigs).values({
      serverId: id,
      enabled: body.enabled ?? true,
      dmOnKick: body.dmOnKick ?? true,
      dmOnBan: body.dmOnBan ?? true,
      dmOnMute: body.dmOnMute ?? true,
      useDiscordTimeout: body.useDiscordTimeout ?? true,
      deleteModCommands: body.deleteModCommands ?? false,
      respondWithReason: body.respondWithReason ?? true,
      preserveMessagesOnBan: body.preserveMessagesOnBan ?? true,
      logChannelId: body.logChannelId,
      logOptions: body.logOptions || {},
      moderatorRoles: body.moderatorRoles || [],
      protectedRoles: body.protectedRoles || [],
      lockdownChannels: body.lockdownChannels || [],
      customMessages: body.customMessages || {},
      commandsEnabled: body.commandsEnabled || {},
    });
  } else {
    await db.update(moderationConfigs)
      .set({
        enabled: body.enabled ?? true,
        dmOnKick: body.dmOnKick ?? true,
        dmOnBan: body.dmOnBan ?? true,
        dmOnMute: body.dmOnMute ?? true,
        useDiscordTimeout: body.useDiscordTimeout ?? true,
        deleteModCommands: body.deleteModCommands ?? false,
        respondWithReason: body.respondWithReason ?? true,
        preserveMessagesOnBan: body.preserveMessagesOnBan ?? true,
        logChannelId: body.logChannelId,
        logOptions: body.logOptions || {},
        moderatorRoles: body.moderatorRoles || [],
        protectedRoles: body.protectedRoles || [],
        lockdownChannels: body.lockdownChannels || [],
        customMessages: body.customMessages || {},
        commandsEnabled: body.commandsEnabled || {},
        updatedAt: new Date(),
      })
      .where(eq(moderationConfigs.serverId, id));
  }

  return NextResponse.json({ success: true });
}
