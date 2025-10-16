import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireServerAccess } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { giveaways } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

// POST end giveaway early
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID is numeric
    const giveawayId = parseInt(id);
    if (!Number.isInteger(giveawayId) || giveawayId <= 0) {
      return NextResponse.json({ error: 'Invalid giveaway ID' }, { status: 400 });
    }
    
    // Get giveaway to check ownership
    const existing = await db
      .select()
      .from(giveaways)
      .where(eq(giveaways.id, giveawayId))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    const user = await requireServerAccess(sessionCookie?.value, existing[0].serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    // Update giveaway status to ended (re-verify ownership with AND condition)
    const [updated] = await db
      .update(giveaways)
      .set({ 
        status: 'ended',
        endTime: new Date()
      })
      .where(
        sql`${giveaways.id} = ${giveawayId} AND ${giveaways.serverId} = ${existing[0].serverId}`
      )
      .returning();

    return NextResponse.json({ 
      success: true, 
      giveaway: updated,
      message: 'Giveaway ended successfully' 
    });
  } catch (error) {
    console.error('Error ending giveaway:', error);
    return NextResponse.json({ error: 'Failed to end giveaway' }, { status: 500 });
  }
}
