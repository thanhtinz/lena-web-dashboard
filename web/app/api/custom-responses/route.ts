import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireServerAccess } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { customResponses } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// GET custom responses for a server
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
    const responses = await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.serverId, serverId))
      .orderBy(customResponses.priority);

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error fetching custom responses:', error);
    return NextResponse.json({ error: 'Failed to fetch custom responses' }, { status: 500 });
  }
}

// POST create custom response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverId, trigger, response, embedName, isExactMatch, priority } = body;

    if (!serverId || !trigger || !response) {
      return NextResponse.json({ 
        error: 'serverId, trigger, and response are required' 
      }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    const user = await requireServerAccess(sessionCookie?.value, serverId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No access to this server' }, { status: 403 });
    }

    const [newResponse] = await db.insert(customResponses).values({
      serverId,
      trigger,
      response,
      embedName: embedName || null,
      isExactMatch: isExactMatch || false,
      priority: priority || 0,
      createdBy: user.id,
    }).returning();

    return NextResponse.json({ response: newResponse });
  } catch (error) {
    console.error('Error creating custom response:', error);
    return NextResponse.json({ error: 'Failed to create custom response' }, { status: 500 });
  }
}
