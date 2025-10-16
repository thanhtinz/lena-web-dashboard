import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';
import { confessionReplies, confessions, confessionConfigs } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

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

    // Check if user has admin access to this server
    const guild = user.guilds?.find((g: any) => g.id === serverId);
    if (!guild || !(guild.permissions & 0x8)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Check if reply approval is enabled
    const config = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);

    if (!config.length || !config[0].requireReplyApproval) {
      return NextResponse.json({ pendingReplies: [] });
    }

    // Get all confessions for this server
    const serverConfessions = await db.select({ id: confessions.id })
      .from(confessions)
      .where(eq(confessions.serverId, serverId));

    const confessionIds = serverConfessions.map(c => c.id);

    if (confessionIds.length === 0) {
      return NextResponse.json({ pendingReplies: [] });
    }

    // Fetch pending replies with confession details
    const pendingReplies = [];
    for (const confessionId of confessionIds) {
      const replies = await db.select({
        replyId: confessionReplies.id,
        confessionId: confessionReplies.confessionId,
        userId: confessionReplies.userId,
        content: confessionReplies.content,
        status: confessionReplies.status,
        createdAt: confessionReplies.createdAt,
      })
        .from(confessionReplies)
        .where(and(
          eq(confessionReplies.confessionId, confessionId),
          eq(confessionReplies.status, 'pending')
        ))
        .orderBy(desc(confessionReplies.createdAt));

      if (replies.length > 0) {
        // Get confession details
        const confession = await db.select({
          id: confessions.id,
          content: confessions.content,
          threadUrl: confessions.threadUrl,
          threadId: confessions.threadId,
        })
          .from(confessions)
          .where(eq(confessions.id, confessionId))
          .limit(1);

        replies.forEach(reply => {
          pendingReplies.push({
            ...reply,
            confession: confession[0] || null
          });
        });
      }
    }

    return NextResponse.json({ pendingReplies });
  } catch (error) {
    console.error('Error fetching pending replies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
