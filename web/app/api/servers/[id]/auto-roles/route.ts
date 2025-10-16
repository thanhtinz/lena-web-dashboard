import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { pgTable, serial, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

const autoRolesConfig = pgTable('auto_roles_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  enabled: boolean('enabled').default(false),
  enableReassign: boolean('enable_reassign').default(false),
  joinRoleIds: jsonb('join_role_ids').$type<string[]>().default([]),
  reactionRoles: jsonb('reaction_roles'),
  levelRoles: jsonb('level_roles'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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

  const config = await db.select().from(autoRolesConfig).where(eq(autoRolesConfig.serverId, id)).limit(1);

  if (config.length === 0) {
    return NextResponse.json({
      enabled: false,
      enableReassign: false,
      joinRoleIds: []
    });
  }

  return NextResponse.json({
    enabled: config[0].enabled ?? false,
    enableReassign: config[0].enableReassign ?? false,
    joinRoleIds: config[0].joinRoleIds || []
  });
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

  const existing = await db.select().from(autoRolesConfig).where(eq(autoRolesConfig.serverId, id)).limit(1);

  if (existing.length === 0) {
    await db.insert(autoRolesConfig).values({
      serverId: id,
      enabled: body.enabled ?? false,
      enableReassign: body.enableReassign ?? false,
      joinRoleIds: body.joinRoleIds || []
    });
  } else {
    await db.update(autoRolesConfig)
      .set({
        enabled: body.enabled ?? false,
        enableReassign: body.enableReassign ?? false,
        joinRoleIds: body.joinRoleIds || [],
        updatedAt: new Date(),
      })
      .where(eq(autoRolesConfig.serverId, id));
  }

  return NextResponse.json({ success: true });
}
