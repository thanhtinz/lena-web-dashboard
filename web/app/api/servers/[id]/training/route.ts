import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trainingData, serverConfigs } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { getUserGuilds } from '@/lib/discord';
import { checkServerPremium } from '@/lib/premiumChecker';

// GET - List all training data for a server
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

    // Check premium status (super admin bypasses)
    const { isPremium } = await checkServerPremium(id, session.user_id);
    if (!isPremium) {
      return NextResponse.json({ error: 'Premium required', isPremium: false }, { status: 403 });
    }

    const trainings = await db
      .select()
      .from(trainingData)
      .where(eq(trainingData.serverId, id))
      .orderBy(trainingData.createdAt);

    return NextResponse.json(trainings);
  } catch (error) {
    console.error('Get training data error:', error);
    return NextResponse.json({ error: 'Failed to fetch training data' }, { status: 500 });
  }
}

// POST - Create new training data
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

    // Check premium status (super admin bypasses)
    const { isPremium } = await checkServerPremium(id, session.user_id);
    if (!isPremium) {
      return NextResponse.json({ error: 'Premium required', isPremium: false }, { status: 403 });
    }

    const body = await request.json();
    const { question, answer, category, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const [newTraining] = await db
      .insert(trainingData)
      .values({
        serverId: id,
        question,
        answer,
        category: category || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.user_id,
      })
      .returning();

    return NextResponse.json(newTraining, { status: 201 });
  } catch (error) {
    console.error('Create training data error:', error);
    return NextResponse.json({ error: 'Failed to create training data' }, { status: 500 });
  }
}

// PATCH - Update training data
export async function PATCH(
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

    // Check premium status (super admin bypasses)
    const { isPremium } = await checkServerPremium(id, session.user_id);
    if (!isPremium) {
      return NextResponse.json({ error: 'Premium required', isPremium: false }, { status: 403 });
    }

    const body = await request.json();
    const { trainingId, ...updateData } = body;

    if (!trainingId) {
      return NextResponse.json({ error: 'Training ID is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(trainingData)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(trainingData.id, trainingId),
        eq(trainingData.serverId, id)
      ))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Training data not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update training data error:', error);
    return NextResponse.json({ error: 'Failed to update training data' }, { status: 500 });
  }
}

// DELETE - Delete training data
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

    // Check premium status (super admin bypasses)
    const { isPremium } = await checkServerPremium(id, session.user_id);
    if (!isPremium) {
      return NextResponse.json({ error: 'Premium required', isPremium: false }, { status: 403 });
    }

    const body = await request.json();
    const { trainingId } = body;

    if (!trainingId) {
      return NextResponse.json({ error: 'Training ID is required' }, { status: 400 });
    }

    await db
      .delete(trainingData)
      .where(and(
        eq(trainingData.id, trainingId),
        eq(trainingData.serverId, id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete training data error:', error);
    return NextResponse.json({ error: 'Failed to delete training data' }, { status: 500 });
  }
}
