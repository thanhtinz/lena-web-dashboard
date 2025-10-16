import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { scheduledMessages } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { checkServerPremium } from '@/lib/premiumChecker';

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

  const guild = user.guilds?.find((g: any) => g.id === id);

  if (!guild || !(guild.permissions & 0x8)) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  // Check premium status (super admin bypasses)
  const { isPremium } = await checkServerPremium(id, user.id);
  if (!isPremium) {
    return NextResponse.json({ error: 'Premium feature - Upgrade required', isPremium: false }, { status: 403 });
  }

  const messages = await db.select().from(scheduledMessages).where(eq(scheduledMessages.serverId, id));

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const guild = user.guilds?.find((g: any) => g.id === id);

    if (!guild || !(guild.permissions & 0x8)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Check premium status (super admin bypasses)
    const { isPremium } = await checkServerPremium(id, user.id);
    if (!isPremium) {
      return NextResponse.json({ error: 'Premium feature - Upgrade required', isPremium: false }, { status: 403 });
    }

    const body = await request.json();
    const { channelId, message, embedName, cronExpression, enabled } = body;

    if (!channelId || !cronExpression) {
      return NextResponse.json(
        { error: 'Channel ID and cron expression are required' },
        { status: 400 }
      );
    }

    if (!message && !embedName) {
      return NextResponse.json(
        { error: 'Either message or embed name is required' },
        { status: 400 }
      );
    }

    const newMessage = await db.insert(scheduledMessages).values({
      serverId: id,
      channelId,
      message: message || null,
      embedName: embedName || null,
      cronExpression,
      enabled: enabled !== undefined ? enabled : true,
      createdBy: user.id
    }).returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('Error creating scheduled message:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  const guild = user.guilds?.find((g: any) => g.id === id);

  if (!guild || !(guild.permissions & 0x8)) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  const body = await request.json();

  await db.delete(scheduledMessages).where(and(
    eq(scheduledMessages.serverId, id),
    eq(scheduledMessages.id, body.id)
  ));

  return NextResponse.json({ success: true });
}

export async function PATCH(
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

  const guild = user.guilds?.find((g: any) => g.id === id);

  if (!guild || !(guild.permissions & 0x8)) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  const body = await request.json();

  await db.update(scheduledMessages)
    .set({ 
      enabled: body.enabled,
      channelId: body.channelId,
      message: body.message,
      embedName: body.embedName,
      cronExpression: body.cronExpression,
      updatedAt: new Date() 
    })
    .where(and(
      eq(scheduledMessages.serverId, id),
      eq(scheduledMessages.id, body.id)
    ));

  return NextResponse.json({ success: true });
}
