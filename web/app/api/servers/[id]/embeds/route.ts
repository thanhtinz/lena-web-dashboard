import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customEmbeds } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { getUserGuilds } from '@/lib/discord';

// GET - List all embeds for a server
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

    const embeds = await db
      .select()
      .from(customEmbeds)
      .where(eq(customEmbeds.serverId, id));

    return NextResponse.json(embeds);
  } catch (error) {
    console.error('Get embeds error:', error);
    return NextResponse.json({ error: 'Failed to fetch embeds' }, { status: 500 });
  }
}

// POST - Create new embed
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
    const {
      name,
      title,
      description,
      color,
      authorName,
      authorIcon,
      footerText,
      footerIcon,
      imageUrl,
      thumbnailUrl,
      fields
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [newEmbed] = await db
      .insert(customEmbeds)
      .values({
        serverId: id,
        name,
        title: title || null,
        description: description || null,
        color: color || null,
        authorName: authorName || null,
        authorIcon: authorIcon || null,
        footerText: footerText || null,
        footerIcon: footerIcon || null,
        imageUrl: imageUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        fields: fields || null,
        createdBy: session.user_id,
      })
      .returning();

    return NextResponse.json(newEmbed, { status: 201 });
  } catch (error) {
    console.error('Create embed error:', error);
    return NextResponse.json({ error: 'Failed to create embed' }, { status: 500 });
  }
}

// PATCH - Update embed
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
    const { embedId, ...updateData } = body;

    if (!embedId) {
      return NextResponse.json({ error: 'Embed ID is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(customEmbeds)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(customEmbeds.id, embedId),
        eq(customEmbeds.serverId, id)
      ))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Embed not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update embed error:', error);
    return NextResponse.json({ error: 'Failed to update embed' }, { status: 500 });
  }
}

// DELETE - Delete embed
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
    const { embedId } = body;

    if (!embedId) {
      return NextResponse.json({ error: 'Embed ID is required' }, { status: 400 });
    }

    await db
      .delete(customEmbeds)
      .where(and(
        eq(customEmbeds.id, embedId),
        eq(customEmbeds.serverId, id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete embed error:', error);
    return NextResponse.json({ error: 'Failed to delete embed' }, { status: 500 });
  }
}
