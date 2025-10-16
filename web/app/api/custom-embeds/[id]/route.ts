import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireServerAccess } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { customEmbeds } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// PATCH update custom embed
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First, get the embed to check server ownership
    const existing = await db
      .select()
      .from(customEmbeds)
      .where(eq(customEmbeds.id, parseInt(id)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Embed not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    const user = await requireServerAccess(sessionCookie?.value, existing[0].serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    const body = await request.json();

    const updateData: any = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.title !== undefined) updateData.title = body.title || null;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.color !== undefined) updateData.color = body.color || null;
    if (body.authorName !== undefined) updateData.authorName = body.authorName || null;
    if (body.authorIcon !== undefined) updateData.authorIcon = body.authorIcon || null;
    if (body.footerText !== undefined) updateData.footerText = body.footerText || null;
    if (body.footerIcon !== undefined) updateData.footerIcon = body.footerIcon || null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl || null;
    if (body.fields !== undefined) updateData.fields = body.fields ? JSON.stringify(body.fields) : null;

    const [updated] = await db
      .update(customEmbeds)
      .set(updateData)
      .where(eq(customEmbeds.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Embed not found' }, { status: 404 });
    }

    return NextResponse.json({ embed: updated });
  } catch (error) {
    console.error('Error updating custom embed:', error);
    return NextResponse.json({ error: 'Failed to update custom embed' }, { status: 500 });
  }
}

// DELETE custom embed
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First, get the embed to check server ownership
    const existing = await db
      .select()
      .from(customEmbeds)
      .where(eq(customEmbeds.id, parseInt(id)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Embed not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    const user = await requireServerAccess(sessionCookie?.value, existing[0].serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    const [deleted] = await db
      .delete(customEmbeds)
      .where(eq(customEmbeds.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Embed not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom embed:', error);
    return NextResponse.json({ error: 'Failed to delete custom embed' }, { status: 500 });
  }
}
