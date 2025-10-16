import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { giveaways, giveawayParticipants } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/session';

// GET - Fetch all giveaways for a server
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverId = req.nextUrl.searchParams.get('serverId');
    
    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 });
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const serverGiveaways = await db
      .select()
      .from(giveaways)
      .where(eq(giveaways.serverId, serverId))
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
          participantCount: participants.length
        };
      })
    );

    return NextResponse.json(giveawaysWithCounts);
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    return NextResponse.json({ error: 'Failed to fetch giveaways' }, { status: 500 });
  }
}

// POST - Create new giveaway
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      serverId,
      channelId,
      prize,
      winnerCount,
      requiredRole,
      duration
    } = body;

    if (!serverId || !channelId || !prize || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse duration (e.g., "1h", "30m", "1d")
    const parseDuration = (dur: string): number => {
      const regex = /(\d+)([smhd])/g;
      let totalMs = 0;
      let match;
      
      while ((match = regex.exec(dur)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
          case 's': totalMs += value * 1000; break;
          case 'm': totalMs += value * 60 * 1000; break;
          case 'h': totalMs += value * 60 * 60 * 1000; break;
          case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
        }
      }
      
      return totalMs;
    };

    const durationMs = parseDuration(duration);
    const endTime = new Date(Date.now() + durationMs);

    const [newGiveaway] = await db
      .insert(giveaways)
      .values({
        serverId,
        channelId,
        hostId: user.id,
        prize,
        winnerCount: winnerCount || 1,
        requiredRole: requiredRole || null,
        endTime,
        status: 'active'
      })
      .returning();

    return NextResponse.json(newGiveaway, { status: 201 });
  } catch (error) {
    console.error('Error creating giveaway:', error);
    return NextResponse.json({ error: 'Failed to create giveaway' }, { status: 500 });
  }
}

// PUT - Update giveaway
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Get existing giveaway to verify ownership
    const [existing] = await db
      .select()
      .from(giveaways)
      .where(eq(giveaways.id, parseInt(id)));

    if (!existing) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === existing.serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updatedGiveaway] = await db
      .update(giveaways)
      .set({
        prize: body.prize,
        winnerCount: body.winnerCount,
        requiredRole: body.requiredRole,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        status: body.status
      })
      .where(and(
        eq(giveaways.id, parseInt(id)),
        eq(giveaways.serverId, existing.serverId)
      ))
      .returning();

    return NextResponse.json(updatedGiveaway);
  } catch (error) {
    console.error('Error updating giveaway:', error);
    return NextResponse.json({ error: 'Failed to update giveaway' }, { status: 500 });
  }
}

// DELETE - Delete giveaway
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Get existing giveaway to verify ownership
    const [existing] = await db
      .select()
      .from(giveaways)
      .where(eq(giveaways.id, parseInt(id)));

    if (!existing) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === existing.serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete participants first
    await db
      .delete(giveawayParticipants)
      .where(eq(giveawayParticipants.giveawayId, parseInt(id)));

    // Delete giveaway (with server verification)
    await db
      .delete(giveaways)
      .where(and(
        eq(giveaways.id, parseInt(id)),
        eq(giveaways.serverId, existing.serverId)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting giveaway:', error);
    return NextResponse.json({ error: 'Failed to delete giveaway' }, { status: 500 });
  }
}
