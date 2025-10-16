import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';
import { confessionReplies, confessions } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> }
) {
  try {
    const { id: serverId, replyId } = await params;
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

    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the reply
    const reply = await db.select()
      .from(confessionReplies)
      .where(eq(confessionReplies.id, parseInt(replyId)))
      .limit(1);

    if (!reply.length) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Get the confession to verify server ownership
    const confession = await db.select()
      .from(confessions)
      .where(eq(confessions.id, reply[0].confessionId))
      .limit(1);

    if (!confession.length || confession[0].serverId !== serverId) {
      return NextResponse.json({ error: 'Reply not found in this server' }, { status: 404 });
    }

    // Update reply status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await db.update(confessionReplies)
      .set({
        status: newStatus,
        isModerated: true,
        moderatedBy: user.id,
        moderatedAt: new Date()
      })
      .where(eq(confessionReplies.id, parseInt(replyId)));

    return NextResponse.json({
      success: true,
      action,
      replyId,
      confessionId: reply[0].confessionId,
      threadId: confession[0].threadId,
      threadUrl: confession[0].threadUrl,
      replyContent: reply[0].content
    });
  } catch (error) {
    console.error('Error moderating reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
