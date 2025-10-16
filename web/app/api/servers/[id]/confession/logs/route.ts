import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';
import { confessions, confessionConfigs, confessionReplies, serverConfigs } from '@/lib/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
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

    // Check if user has access to this server and has admin permissions
    const guild = user.guilds?.find((g: any) => g.id === serverId);
    if (!guild || !(guild.permissions & 0x8)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Premium check: Verify server has premium (Site admin + Server admin = auto premium)
    const premiumStatus = await isPremiumServer(serverId, guild.permissions, user.id);
    if (!premiumStatus) {
      return NextResponse.json(
        { error: 'Premium subscription required for confession logging' },
        { status: 403 }
      );
    }

    // Check if confession logging is enabled and logToWeb is true
    const config = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);
    
    if (config.length === 0 || !config[0].logConfessions || !config[0].logToWeb) {
      return NextResponse.json(
        { error: 'Confession web logging is not enabled' },
        { status: 403 }
      );
    }

    // Fetch confession logs (last 100)
    const confessionLogs = await db.select({
      id: confessions.id,
      userId: confessions.userId,
      username: confessions.username,
      threadUrl: confessions.threadUrl,
      content: confessions.content,
      createdAt: confessions.createdAt,
    })
      .from(confessions)
      .where(eq(confessions.serverId, serverId))
      .orderBy(desc(confessions.createdAt))
      .limit(100);

    // Fetch all replies for these confessions (optimized: single query)
    const confessionIds = confessionLogs.map(c => c.id);
    const replies = confessionIds.length > 0 
      ? await db.select({
          id: confessionReplies.id,
          confessionId: confessionReplies.confessionId,
          userId: confessionReplies.userId,
          content: confessionReplies.content,
          status: confessionReplies.status,
          isModerated: confessionReplies.isModerated,
          moderatedBy: confessionReplies.moderatedBy,
          createdAt: confessionReplies.createdAt,
        })
          .from(confessionReplies)
          .where(inArray(confessionReplies.confessionId, confessionIds))
          .orderBy(desc(confessionReplies.createdAt))
      : [];

    // Group replies by confessionId
    const repliesByConfession: Record<number, any[]> = {};
    replies.forEach(reply => {
      if (!repliesByConfession[reply.confessionId]) {
        repliesByConfession[reply.confessionId] = [];
      }
      repliesByConfession[reply.confessionId].push(reply);
    });

    // Attach replies to confessions
    const logsWithReplies = confessionLogs.map(confession => ({
      ...confession,
      replies: repliesByConfession[confession.id] || []
    }));

    return NextResponse.json(logsWithReplies);
  } catch (error) {
    console.error('Error fetching confession logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
