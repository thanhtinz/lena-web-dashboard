import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { customEmbeds } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/session';

// GET - Fetch all embeds for a server
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

    const embeds = await db
      .select()
      .from(customEmbeds)
      .where(eq(customEmbeds.serverId, serverId))
      .orderBy(desc(customEmbeds.createdAt));

    return NextResponse.json(embeds);
  } catch (error) {
    console.error('Error fetching embeds:', error);
    return NextResponse.json({ error: 'Failed to fetch embeds' }, { status: 500 });
  }
}

// POST - Create new embed
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

    if (!serverId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: serverId, name' },
        { status: 400 }
      );
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [newEmbed] = await db
      .insert(customEmbeds)
      .values({
        serverId,
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
        fields: fields ? JSON.stringify(fields) : null,
        createdBy: user.id
      })
      .returning();

    return NextResponse.json(newEmbed, { status: 201 });
  } catch (error) {
    console.error('Error creating embed:', error);
    return NextResponse.json({ error: 'Failed to create embed' }, { status: 500 });
  }
}

// PUT - Update embed
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

    // Get existing embed to verify ownership
    const [existing] = await db
      .select()
      .from(customEmbeds)
      .where(eq(customEmbeds.id, parseInt(id)));

    if (!existing) {
      return NextResponse.json({ error: 'Embed not found' }, { status: 404 });
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === existing.serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {
      name: body.name,
      title: body.title || null,
      description: body.description || null,
      color: body.color || null,
      authorName: body.authorName || null,
      authorIcon: body.authorIcon || null,
      footerText: body.footerText || null,
      footerIcon: body.footerIcon || null,
      imageUrl: body.imageUrl || null,
      thumbnailUrl: body.thumbnailUrl || null,
      updatedAt: new Date()
    };

    if (body.fields) {
      updateData.fields = JSON.stringify(body.fields);
    }

    const [updatedEmbed] = await db
      .update(customEmbeds)
      .set(updateData)
      .where(and(
        eq(customEmbeds.id, parseInt(id)),
        eq(customEmbeds.serverId, existing.serverId)
      ))
      .returning();

    return NextResponse.json(updatedEmbed);
  } catch (error) {
    console.error('Error updating embed:', error);
    return NextResponse.json({ error: 'Failed to update embed' }, { status: 500 });
  }
}

// DELETE - Delete embed
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

    // Get existing embed to verify ownership
    const [existing] = await db
      .select()
      .from(customEmbeds)
      .where(eq(customEmbeds.id, parseInt(id)));

    if (!existing) {
      return NextResponse.json({ error: 'Embed not found' }, { status: 404 });
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === existing.serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db
      .delete(customEmbeds)
      .where(and(
        eq(customEmbeds.id, parseInt(id)),
        eq(customEmbeds.serverId, existing.serverId)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting embed:', error);
    return NextResponse.json({ error: 'Failed to delete embed' }, { status: 500 });
  }
}
