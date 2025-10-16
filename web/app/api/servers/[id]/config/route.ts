import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { serverConfigs, conversationHistory } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { isPremiumServer } from '@/lib/premium';

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

  if (!guild) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check server premium status
  const premiumStatus = await isPremiumServer(id, guild.permissions, user.id);

  const config = await db.select().from(serverConfigs).where(eq(serverConfigs.serverId, id)).limit(1);

  if (config.length === 0) {
    return NextResponse.json({
      prefix: '!',
      personality: 'lena',
      language: 'vi',
      allowedChannels: [],
      autoReact: true,
      contentFilter: true,
      isPremium: premiumStatus,
    });
  }

  return NextResponse.json({
    prefix: config[0].prefix || '!',
    personality: config[0].personalityMode || 'lena',
    language: config[0].language || 'vi',
    allowedChannels: config[0].allowedChannels || [],
    autoReact: config[0].autoReact ?? true,
    contentFilter: config[0].contentFilter ?? true,
    isPremium: premiumStatus,
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

  const existing = await db.select().from(serverConfigs).where(eq(serverConfigs.serverId, id)).limit(1);

  // Check if language is being changed
  const oldLanguage = existing.length > 0 ? existing[0].language : null;
  const newLanguage = body.language || 'vi';
  const languageChanged = oldLanguage && oldLanguage !== newLanguage;

  if (existing.length === 0) {
    await db.insert(serverConfigs).values({
      serverId: id,
      prefix: body.prefix || '!',
      personalityMode: body.personality || 'lena',
      language: body.language || 'vi',
      allowedChannels: body.allowedChannels || [],
      autoReact: body.autoReact ?? true,
      contentFilter: body.contentFilter ?? true,
    });
  } else {
    await db.update(serverConfigs)
      .set({
        prefix: body.prefix || '!',
        personalityMode: body.personality || 'lena',
        language: body.language || 'vi',
        allowedChannels: body.allowedChannels || [],
        autoReact: body.autoReact ?? true,
        contentFilter: body.contentFilter ?? true,
        updatedAt: new Date(),
      })
      .where(eq(serverConfigs.serverId, id));
  }

  // Auto-clear conversation history when language changes
  if (languageChanged) {
    try {
      await db.delete(conversationHistory)
        .where(eq(conversationHistory.serverId, id));
      console.log(`🗑️ Auto-cleared conversation history for server ${id} due to language change: ${oldLanguage} → ${newLanguage}`);
    } catch (error) {
      console.error('Error clearing conversation history:', error);
    }
  }

  return NextResponse.json({ 
    success: true,
    historyCleared: languageChanged 
  });
}
