import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { tempRoles } from '@/lib/schema';

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

  const roles = await db.select().from(tempRoles).where(eq(tempRoles.serverId, id));

  return NextResponse.json(roles);
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

  const body = await request.json();
  
  const expiresAt = new Date();
  const duration = body.duration || '1h';
  let durationMinutes = 60;
  
  if (duration.endsWith('m')) {
    durationMinutes = parseInt(duration);
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);
  } else if (duration.endsWith('h')) {
    durationMinutes = parseInt(duration) * 60;
    expiresAt.setHours(expiresAt.getHours() + parseInt(duration));
  } else if (duration.endsWith('d')) {
    durationMinutes = parseInt(duration) * 24 * 60;
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
  } else if (duration.endsWith('w')) {
    durationMinutes = parseInt(duration) * 7 * 24 * 60;
    expiresAt.setDate(expiresAt.getDate() + (parseInt(duration) * 7));
  }

  await db.insert(tempRoles).values({
    serverId: id,
    userId: body.userId,
    roleId: body.roleId,
    durationMinutes,
    expiresAt,
    reason: body.reason || 'No reason provided',
    assignedBy: user.id,
    status: 'active',
  });

  return NextResponse.json({ success: true });
}
