import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customResponses } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { getUserGuilds } from '@/lib/discord';

// GET - List all custom responses for a server
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

    const responses = await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.serverId, id))
      .orderBy(customResponses.priority);

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Get responses error:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}

// POST - Create new custom response
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
    const { trigger, response, embedName, isExactMatch, priority } = body;

    if (!trigger || !response) {
      return NextResponse.json({ error: 'Trigger and response are required' }, { status: 400 });
    }

    const [newResponse] = await db
      .insert(customResponses)
      .values({
        serverId: id,
        trigger,
        response,
        embedName: embedName || null,
        isExactMatch: isExactMatch || false,
        priority: priority || 0,
        createdBy: session.user_id,
      })
      .returning();

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error('Create response error:', error);
    return NextResponse.json({ error: 'Failed to create response' }, { status: 500 });
  }
}

// PATCH - Update custom response
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

    const body = await request.json();
    const { responseId, ...updateData } = body;

    if (!responseId) {
      return NextResponse.json({ error: 'Response ID is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(customResponses)
      .set(updateData)
      .where(and(
        eq(customResponses.id, responseId),
        eq(customResponses.serverId, id)
      ))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update response error:', error);
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
  }
}

// DELETE - Delete custom response
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
    const { responseId } = body;

    if (!responseId) {
      return NextResponse.json({ error: 'Response ID is required' }, { status: 400 });
    }

    await db
      .delete(customResponses)
      .where(and(
        eq(customResponses.id, responseId),
        eq(customResponses.serverId, id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete response error:', error);
    return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 });
  }
}
