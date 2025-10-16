import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { customResponses } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/session';

// GET - Fetch all custom responses for a server
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

    const responses = await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.serverId, serverId))
      .orderBy(desc(customResponses.priority), desc(customResponses.createdAt));

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching custom responses:', error);
    return NextResponse.json({ error: 'Failed to fetch custom responses' }, { status: 500 });
  }
}

// POST - Create new custom response
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
      trigger,
      response,
      embedName,
      isExactMatch,
      priority
    } = body;

    if (!serverId || !trigger || !response) {
      return NextResponse.json(
        { error: 'Missing required fields: serverId, trigger, response' },
        { status: 400 }
      );
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [newResponse] = await db
      .insert(customResponses)
      .values({
        serverId,
        trigger,
        response,
        embedName: embedName || null,
        isExactMatch: isExactMatch || false,
        priority: priority || 0,
        createdBy: user.id
      })
      .returning();

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating custom response:', error);
    return NextResponse.json({ error: 'Failed to create custom response' }, { status: 500 });
  }
}

// PUT - Update custom response
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

    // Get existing response to verify ownership
    const [existing] = await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.id, parseInt(id)));

    if (!existing) {
      return NextResponse.json({ error: 'Custom response not found' }, { status: 404 });
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === existing.serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updatedResponse] = await db
      .update(customResponses)
      .set({
        trigger: body.trigger,
        response: body.response,
        embedName: body.embedName || null,
        isExactMatch: body.isExactMatch || false,
        priority: body.priority || 0
      })
      .where(and(
        eq(customResponses.id, parseInt(id)),
        eq(customResponses.serverId, existing.serverId)
      ))
      .returning();

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error('Error updating custom response:', error);
    return NextResponse.json({ error: 'Failed to update custom response' }, { status: 500 });
  }
}

// DELETE - Delete custom response
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

    // Get existing response to verify ownership
    const [existing] = await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.id, parseInt(id)));

    if (!existing) {
      return NextResponse.json({ error: 'Custom response not found' }, { status: 404 });
    }

    // Verify user has access to this server
    const hasAccess = user.guilds?.some((g: any) => g.id === existing.serverId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db
      .delete(customResponses)
      .where(and(
        eq(customResponses.id, parseInt(id)),
        eq(customResponses.serverId, existing.serverId)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom response:', error);
    return NextResponse.json({ error: 'Failed to delete custom response' }, { status: 500 });
  }
}
