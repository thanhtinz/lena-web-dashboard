import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { reactionRoleMessages } from '@/lib/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id, messageId } = await params;
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

  const message = await db.select().from(reactionRoleMessages)
    .where(
      and(
        eq(reactionRoleMessages.serverId, id),
        eq(reactionRoleMessages.messageId, messageId)
      )
    )
    .limit(1);

  if (message.length === 0) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  return NextResponse.json(message[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id, messageId } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  console.log('[PATCH /reaction-roles] Request:', { serverId: id, messageId });

  if (!sessionCookie) {
    console.log('[PATCH /reaction-roles] No session cookie');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifySession(sessionCookie.value);
  
  if (!user) {
    console.log('[PATCH /reaction-roles] Invalid session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = user.guilds?.some((g: any) => g.id === id);

  if (!hasAccess) {
    console.log('[PATCH /reaction-roles] No access to server');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { locked, maxRolesPerUser, tempDuration } = body;

    console.log('[PATCH /reaction-roles] Update data:', { locked, maxRolesPerUser, tempDuration });

    const updateData: any = {};
    if (typeof locked === 'boolean') updateData.locked = locked;
    if (maxRolesPerUser !== undefined) updateData.maxRolesPerUser = maxRolesPerUser;
    if (tempDuration !== undefined) {
      // Validate temp duration if provided
      if (tempDuration !== null && (typeof tempDuration !== 'number' || tempDuration <= 0)) {
        return NextResponse.json({ error: 'Invalid temp duration value' }, { status: 400 });
      }
      updateData.tempDurationMinutes = tempDuration;
    }

    const result = await db.update(reactionRoleMessages)
      .set(updateData)
      .where(
        and(
          eq(reactionRoleMessages.serverId, id),
          eq(reactionRoleMessages.messageId, messageId)
        )
      );

    console.log('[PATCH /reaction-roles] Update result:', result);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PATCH /reaction-roles] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update message' },
      { status: 500 }
    );
  }
}
