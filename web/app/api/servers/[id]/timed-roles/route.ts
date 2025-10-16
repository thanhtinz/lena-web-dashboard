import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { timedRoleQueue } from '@/lib/schema';

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

  const queue = await db.select().from(timedRoleQueue)
    .where(eq(timedRoleQueue.serverId, id));

  return NextResponse.json(queue);
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

  try {
    const body = await request.json();
    const { userId, roleId, duration } = body;

    if (!userId || !roleId || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse duration (e.g., "1h", "30m", "2d")
    const durationRegex = /^(\d+)(m|h|d)$/;
    const match = duration.match(durationRegex);
    
    if (!match) {
      return NextResponse.json({ error: 'Invalid duration format' }, { status: 400 });
    }

    const value = parseInt(match[1]);
    const unit = match[2];
    
    let minutes = 0;
    if (unit === 'm') minutes = value;
    else if (unit === 'h') minutes = value * 60;
    else if (unit === 'd') minutes = value * 60 * 24;

    const scheduledFor = new Date(Date.now() + minutes * 60 * 1000);

    // Insert into queue
    await db.insert(timedRoleQueue).values({
      serverId: id,
      userId,
      roleId,
      timedRoleId: 0, // Web-created entries don't have config ID
      scheduledFor,
      status: 'pending',
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error creating timed role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create timed role' },
      { status: 500 }
    );
  }
}
