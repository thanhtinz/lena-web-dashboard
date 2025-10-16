import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stickyMessages } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stickyId: string }> }
) {
  try {
    const { id: serverId, stickyId } = await params;
    const body = await request.json();
    const { 
      channelId, 
      messageContent, 
      embedConfig,
      mode, 
      messageCount, 
      timeInterval,
      isPremium,
      webhookConfig,
      slowMode
    } = body;

    // Validation: require either message content or embed
    if (!messageContent && !embedConfig) {
      return NextResponse.json(
        { error: 'Either message content or embed configuration is required' },
        { status: 400 }
      );
    }

    const parseTimeInterval = (interval: string): number => {
      const value = parseInt(interval);
      const unit = interval.slice(-1);
      if (unit === 'h') return value * 3600;
      return value * 60;
    };

    const [updated] = await db
      .update(stickyMessages)
      .set({
        channelId,
        messageContent: messageContent || null,
        embedConfig: embedConfig || null,
        mode,
        messageCount: mode === 'message' ? messageCount : 1,
        timeInterval: mode === 'time' ? parseTimeInterval(timeInterval) : null,
        isPremium: isPremium || false,
        webhookConfig: webhookConfig || null,
        slowMode: slowMode || false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(stickyMessages.id, parseInt(stickyId)),
          eq(stickyMessages.serverId, serverId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Sticky message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating sticky message:', error);
    return NextResponse.json(
      { error: 'Failed to update sticky message' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stickyId: string }> }
) {
  try {
    const { id: serverId, stickyId } = await params;
    const body = await request.json();
    const { isActive } = body;

    const [updated] = await db
      .update(stickyMessages)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(stickyMessages.id, parseInt(stickyId)),
          eq(stickyMessages.serverId, serverId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Sticky message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating sticky message:', error);
    return NextResponse.json(
      { error: 'Failed to update sticky message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stickyId: string }> }
) {
  try {
    const { id: serverId, stickyId } = await params;

    const [deleted] = await db
      .delete(stickyMessages)
      .where(
        and(
          eq(stickyMessages.id, parseInt(stickyId)),
          eq(stickyMessages.serverId, serverId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Sticky message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sticky message:', error);
    return NextResponse.json(
      { error: 'Failed to delete sticky message' },
      { status: 500 }
    );
  }
}
