import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireServerAccess } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { giveaways, giveawayParticipants } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

// POST reroll giveaway winners
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

    const giveaway = existing[0];

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    const user = await requireServerAccess(sessionCookie?.value, giveaway.serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    // Get all participants
    const participants = await db
      .select()
      .from(giveawayParticipants)
      .where(eq(giveawayParticipants.giveawayId, giveawayId));

    if (participants.length === 0) {
      return NextResponse.json({ error: 'No participants to reroll' }, { status: 400 });
    }

    // Randomly select winners
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const newWinners = shuffled.slice(0, giveaway.winnerCount).map(p => p.userId);

    // Update giveaway with new winners (re-verify ownership with AND condition)
    const [updated] = await db
      .update(giveaways)
      .set({ 
        winners: JSON.stringify(newWinners)
      })
      .where(
        sql`${giveaways.id} = ${giveawayId} AND ${giveaways.serverId} = ${giveaway.serverId}`
      )
      .returning();

    return NextResponse.json({ 
      success: true, 
      giveaway: updated,
      newWinners,
      message: 'Winners rerolled successfully' 
    });
  } catch (error) {
    console.error('Error rerolling winners:', error);
    return NextResponse.json({ error: 'Failed to reroll winners' }, { status: 500 });
  }
}
