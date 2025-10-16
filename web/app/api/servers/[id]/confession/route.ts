import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';
import { confessionConfigs, serverConfigs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { isPremiumServer } from '@/lib/premium';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serverId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this server
    const guild = user.guilds?.find((g: any) => g.id === serverId);
    if (!guild) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch confession config
    const config = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);

    if (config.length === 0) {
      // Return default config
      return NextResponse.json({
        serverId,
        channelId: null,
        buttonLabel: '📝 Gửi Confession',
        replyButtonLabel: '💬 Trả lời',
        isActive: true,
        requireReplyApproval: false,
        logConfessions: false,
        logChannelId: null,
        logToWeb: true,
      });
    }

    return NextResponse.json(config[0]);
  } catch (error) {
    console.error('Error fetching confession config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serverId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this server and has admin permissions
    const guild = user.guilds?.find((g: any) => g.id === serverId);
    if (!guild || !(guild.permissions & 0x8)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      channelId,
      buttonLabel,
      replyButtonLabel,
      isActive,
      requireReplyApproval,
      logConfessions,
      logChannelId,
      logToWeb,
    } = body;

    // Premium check: If user tries to enable logging features, verify premium
    if (logConfessions) {
      const premiumStatus = await isPremiumServer(serverId, guild.permissions, user.id);
      if (!premiumStatus) {
        return NextResponse.json(
          { error: 'Premium subscription required for confession logging' },
          { status: 403 }
        );
      }
    }

    // Check if config exists
    const existing = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing config
      await db.update(confessionConfigs)
        .set({
          channelId,
          buttonLabel,
          replyButtonLabel,
          isActive,
          requireReplyApproval,
          logConfessions,
          logChannelId,
          logToWeb,
          updatedAt: new Date(),
        })
        .where(eq(confessionConfigs.serverId, serverId));
    } else {
      // Create new config
      await db.insert(confessionConfigs).values({
        serverId,
        channelId,
        buttonLabel,
        replyButtonLabel,
        isActive,
        requireReplyApproval,
        logConfessions,
        logChannelId,
        logToWeb,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving confession config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
