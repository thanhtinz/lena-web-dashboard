import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stickyMessages } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serverId } = await params;

    const messages = await db
      .select()
      .from(stickyMessages)
      .where(eq(stickyMessages.serverId, serverId))
      .orderBy(stickyMessages.createdAt);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching sticky messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sticky messages' },
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

    // Parse time interval to seconds
    let intervalSeconds = null;
    if (mode === 'time' && timeInterval) {
      const match = timeInterval.match(/^(\d+)([mhd])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'm') intervalSeconds = value * 60;
        else if (unit === 'h') intervalSeconds = value * 3600;
        else if (unit === 'd') intervalSeconds = value * 86400;
      }
    }

    const [newSticky] = await db
      .insert(stickyMessages)
      .values({
        serverId,
        channelId,
        messageContent: messageContent || null,
        embedConfig: embedConfig || null,
        mode: mode || 'message',
        messageCount: mode === 'message' ? messageCount : 1,
        timeInterval: intervalSeconds,
        isPremium: isPremium || false,
        webhookConfig: webhookConfig || null,
        slowMode: slowMode || false,
        isActive: true,
        createdBy: 'web',
      })
      .returning();

    return NextResponse.json(newSticky);
  } catch (error) {
    console.error('Error creating sticky message:', error);
    return NextResponse.json(
      { error: 'Failed to create sticky message' },
      { status: 500 }
    );
  }
}
