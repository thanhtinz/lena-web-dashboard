import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';
import { confessions, confessionReplies, confessionConfigs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { isPremiumServer } from '@/lib/premium';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serverId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin access to this server
    const guild = user.guilds?.find((g: any) => g.id === serverId);
    if (!guild || !(guild.permissions & 0x8)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Premium check: Only premium servers can reset confessions
    const premiumStatus = await isPremiumServer(serverId, guild.permissions, user.id);
    if (!premiumStatus) {
      return NextResponse.json(
        { error: 'Premium subscription required to reset confessions' },
        { status: 403 }
      );
    }

    // Get all confession IDs for this server
    const serverConfessions = await db.select({ id: confessions.id })
      .from(confessions)
      .where(eq(confessions.serverId, serverId));

    const confessionIds = serverConfessions.map(c => c.id);

    // Delete all replies first (if any confessions exist)
    if (confessionIds.length > 0) {
      // Delete replies one by one to avoid inArray issues with empty array
      for (const confessionId of confessionIds) {
        await db.delete(confessionReplies)
          .where(eq(confessionReplies.confessionId, confessionId));
      }
    }

    // Delete all confessions for this server
    await db.delete(confessions)
      .where(eq(confessions.serverId, serverId));

    return NextResponse.json({
      success: true,
      message: `Deleted ${serverConfessions.length} confessions and their replies`,
      deletedCount: serverConfessions.length
    });
  } catch (error) {
    console.error('Error resetting confessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
