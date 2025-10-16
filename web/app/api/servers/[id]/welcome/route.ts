import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { welcomeConfigs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';

export async function GET(
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

    const config = await db.select()
      .from(welcomeConfigs)
      .where(eq(welcomeConfigs.serverId, id))
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json({
        serverId: id,
        channelId: null,
        message: null,
        embedName: null,
        isActive: false
      });
    }

    return NextResponse.json(config[0]);
  } catch (error) {
    console.error('Error fetching welcome config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch welcome configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { channelId, message, embedName, isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid isActive value' }, { status: 400 });
    }

    if (channelId && typeof channelId !== 'string') {
      return NextResponse.json({ error: 'Invalid channelId' }, { status: 400 });
    }

    if (message && typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    if (embedName && typeof embedName !== 'string') {
      return NextResponse.json({ error: 'Invalid embedName' }, { status: 400 });
    }

    const existing = await db.select()
      .from(welcomeConfigs)
      .where(eq(welcomeConfigs.serverId, id))
      .limit(1);

    if (existing.length === 0) {
      const result = await db.insert(welcomeConfigs).values({
        serverId: id,
        channelId,
        message,
        embedName,
        isActive
      }).returning();
      
      return NextResponse.json(result[0]);
    } else {
      const result = await db.update(welcomeConfigs)
        .set({
          channelId,
          message,
          embedName,
          isActive,
          updatedAt: new Date()
        })
        .where(eq(welcomeConfigs.serverId, id))
        .returning();

      return NextResponse.json(result[0]);
    }
  } catch (error) {
    console.error('Error updating welcome config:', error);
    return NextResponse.json(
      { error: 'Failed to update welcome configuration' },
      { status: 500 }
    );
  }
}
