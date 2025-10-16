import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireServerAccess } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { customResponses } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// PATCH update custom response
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First, get the response to check server ownership
    const existing = await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.id, parseInt(id)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    const user = await requireServerAccess(sessionCookie?.value, existing[0].serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    const body = await request.json();
    const { trigger, response, embedName, isExactMatch, priority } = body;

    const updateData: any = {};
    if (trigger !== undefined) updateData.trigger = trigger;
    if (response !== undefined) updateData.response = response;
    if (embedName !== undefined) updateData.embedName = embedName || null;
    if (isExactMatch !== undefined) updateData.isExactMatch = isExactMatch;
    if (priority !== undefined) updateData.priority = priority;

    const [updated] = await db
      .update(customResponses)
      .set(updateData)
      .where(eq(customResponses.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json({ response: updated });
  } catch (error) {
    console.error('Error updating custom response:', error);
    return NextResponse.json({ error: 'Failed to update custom response' }, { status: 500 });
  }
}

// DELETE custom response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First, get the response to check server ownership
    const existing = await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.id, parseInt(id)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    const user = await requireServerAccess(sessionCookie?.value, existing[0].serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    const [deleted] = await db
      .delete(customResponses)
      .where(eq(customResponses.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom response:', error);
    return NextResponse.json({ error: 'Failed to delete custom response' }, { status: 500 });
  }
}
