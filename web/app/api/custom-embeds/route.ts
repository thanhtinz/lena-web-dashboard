import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireServerAccess } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { customEmbeds } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET custom embeds for a server
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get('serverId');

  if (!serverId) {
    return NextResponse.json({ error: 'serverId is required' }, { status: 400 });
  }

  const user = await requireServerAccess(sessionCookie?.value, serverId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
  }

  try {
    const embeds = await db
      .select()
      .from(customEmbeds)
      .where(eq(customEmbeds.serverId, serverId));

    return NextResponse.json({ embeds });
  } catch (error) {
    console.error('Error fetching custom embeds:', error);
    return NextResponse.json({ error: 'Failed to fetch custom embeds' }, { status: 500 });
  }
}

// POST create custom embed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverId, name, title, description, color, authorName, authorIcon, footerText, footerIcon, imageUrl, thumbnailUrl, fields } = body;

    if (!serverId || !name) {
      return NextResponse.json({ 
        error: 'serverId and name are required' 
      }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    const user = await requireServerAccess(sessionCookie?.value, serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    const [newEmbed] = await db.insert(customEmbeds).values({
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
      createdBy: user.id,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ embed: newEmbed });
  } catch (error) {
    console.error('Error creating custom embed:', error);
    return NextResponse.json({ error: 'Failed to create custom embed' }, { status: 500 });
  }
}
