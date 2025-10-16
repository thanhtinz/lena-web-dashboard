import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { giveaways, giveawayParticipants } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { getUserGuilds } from '@/lib/discord';

// GET - List all giveaways for a server
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this server
    const guilds = await getUserGuilds(session.access_token);
    const hasAccess = guilds.some(
      (guild: any) => guild.id === id && (guild.permissions & 0x8) === 0x8
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'No permission' }, { status: 403 });
    }

    const serverGiveaways = await db
      .select()
      .from(giveaways)
      .where(eq(giveaways.serverId, id))
      .orderBy(desc(giveaways.createdAt));

    // Get participant counts for each giveaway
    const giveawaysWithCounts = await Promise.all(
      serverGiveaways.map(async (giveaway) => {
        const participants = await db
          .select()
          .from(giveawayParticipants)
          .where(eq(giveawayParticipants.giveawayId, giveaway.id));
        
        return {
          ...giveaway,
          participantCount: participants.length,
        };
      })
    );

    return NextResponse.json(giveawaysWithCounts);
  } catch (error) {
    console.error('Get giveaways error:', error);
    return NextResponse.json({ error: 'Failed to fetch giveaways' }, { status: 500 });
  }
}

// POST - Create new giveaway OR perform action (end/reroll)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this server
    const guilds = await getUserGuilds(session.access_token);
    const hasAccess = guilds.some(
      (guild: any) => guild.id === id && (guild.permissions & 0x8) === 0x8
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'No permission' }, { status: 403 });
    }

    const body = await request.json();
    const { action, giveawayId, channelId, prize, winnerCount, requiredRole, endTime } = body;

    // Handle different actions
    if (action === 'end' && giveawayId) {
      // End giveaway early
      const [giveaway] = await db
        .select()
        .from(giveaways)
        .where(and(
          eq(giveaways.id, giveawayId),
          eq(giveaways.serverId, id)
        ));

      if (!giveaway) {
        return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
      }

      if (giveaway.status !== 'active') {
        return NextResponse.json({ error: 'Giveaway is not active' }, { status: 400 });
      }

      // Update status to ended
      await db
        .update(giveaways)
        .set({ status: 'ended' })
        .where(eq(giveaways.id, giveawayId));

      return NextResponse.json({ success: true, message: 'Giveaway ended successfully' });

    } else if (action === 'reroll' && giveawayId) {
      // Reroll winners
      const [giveaway] = await db
        .select()
        .from(giveaways)
        .where(and(
          eq(giveaways.id, giveawayId),
          eq(giveaways.serverId, id)
        ));

      if (!giveaway) {
        return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
      }

      if (giveaway.status !== 'ended') {
        return NextResponse.json({ error: 'Can only reroll ended giveaways' }, { status: 400 });
      }

      // Get all participants
      const participants = await db
        .select()
        .from(giveawayParticipants)
        .where(eq(giveawayParticipants.giveawayId, giveawayId));

      if (participants.length === 0) {
        return NextResponse.json({ error: 'No participants to reroll' }, { status: 400 });
      }

      // Pick random winners
      const count = Math.min(giveaway.winnerCount, participants.length);
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const newWinners = shuffled.slice(0, count).map(p => p.userId);

      // Update winners
      await db
        .update(giveaways)
        .set({ winners: newWinners.join(',') })
        .where(eq(giveaways.id, giveawayId));

      return NextResponse.json({ success: true, newWinners });

    } else {
      // Create new giveaway
      if (!channelId || !prize || !endTime) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const [newGiveaway] = await db
        .insert(giveaways)
        .values({
          serverId: id,
          channelId,
          prize,
          winnerCount: winnerCount || 1,
          requiredRole: requiredRole || null,
          endTime: new Date(endTime),
          hostId: session.user_id,
          status: 'active',
        })
        .returning();

      return NextResponse.json(newGiveaway, { status: 201 });
    }
  } catch (error) {
    console.error('Giveaway action error:', error);
    return NextResponse.json({ error: 'Failed to perform giveaway action' }, { status: 500 });
  }
}

// DELETE - Cancel/delete giveaway
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this server
    const guilds = await getUserGuilds(session.access_token);
    const hasAccess = guilds.some(
      (guild: any) => guild.id === id && (guild.permissions & 0x8) === 0x8
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'No permission' }, { status: 403 });
    }

    const body = await request.json();
    const { giveawayId } = body;

    if (!giveawayId) {
      return NextResponse.json({ error: 'Giveaway ID is required' }, { status: 400 });
    }

    // Delete participants first
    await db
      .delete(giveawayParticipants)
      .where(eq(giveawayParticipants.giveawayId, giveawayId));

    // Delete giveaway
    await db
      .delete(giveaways)
      .where(and(
        eq(giveaways.id, giveawayId),
        eq(giveaways.serverId, id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete giveaway error:', error);
    return NextResponse.json({ error: 'Failed to delete giveaway' }, { status: 500 });
  }
}
