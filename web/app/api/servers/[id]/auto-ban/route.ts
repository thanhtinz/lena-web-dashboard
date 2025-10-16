import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { autoBanRules } from '@/lib/schema';
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

  const rules = await db.select().from(autoBanRules).where(eq(autoBanRules.serverId, id));

  // Map snake_case to camelCase for frontend
  const mappedRules = rules.map(rule => ({
    id: rule.id,
    ruleName: rule.ruleName,
    ruleType: rule.ruleType,
    threshold: rule.threshold,
    banReason: rule.banReason,
    enabled: rule.enabled,
    isPremium: rule.isPremium,
    keywords: rule.keywords
  }));

  return NextResponse.json(mappedRules);
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
    const { ruleName, ruleType, banReason, threshold, keywords, enabled } = body;

    if (!ruleType) {
      return NextResponse.json(
        { error: 'Rule type is required' },
        { status: 400 }
      );
    }

    const validTypes = ['no_avatar', 'account_age', 'username_pattern', 'invite_username'];
    if (!validTypes.includes(ruleType)) {
      return NextResponse.json(
        { error: 'Invalid rule type. Valid types: no_avatar, account_age, username_pattern, invite_username' },
        { status: 400 }
      );
    }

    const newRule = await db.insert(autoBanRules).values({
      serverId: id,
      ruleName: ruleName || `${ruleType} rule`,
      ruleType,
      banReason: banReason || `Violated auto-ban rule: ${ruleType}`,
      threshold: threshold || (ruleType === 'account_age' ? 7 : 1),
      keywords: keywords || [],
      enabled: enabled !== undefined ? enabled : true,
      isPremium: false
    }).returning();

    return NextResponse.json(newRule[0], { status: 201 });
  } catch (error) {
    console.error('Error creating auto ban rule:', error);
    return NextResponse.json(
      { error: 'Failed to create auto ban rule' },
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

  await db.delete(autoBanRules).where(and(
    eq(autoBanRules.serverId, id),
    eq(autoBanRules.id, body.id)
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

  await db.update(autoBanRules)
    .set({ 
      enabled: body.enabled,
      ruleName: body.ruleName,
      ruleType: body.ruleType,
      banReason: body.banReason,
      threshold: body.threshold,
      keywords: body.keywords,
      updatedAt: new Date() 
    })
    .where(and(
      eq(autoBanRules.serverId, id),
      eq(autoBanRules.id, body.id)
    ));

  return NextResponse.json({ success: true });
}
