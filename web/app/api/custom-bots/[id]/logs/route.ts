import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customBots, customBotLogs } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq, and, desc, gte, inArray } from 'drizzle-orm';

// GET bot logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level'); // info, warn, error, debug
    const since = searchParams.get('since'); // ISO date string

    // Verify ownership
    const [bot] = await db
      .select()
      .from(customBots)
      .where(
        and(
          eq(customBots.id, id),
          eq(customBots.userId, userId)
        )
      )
      .limit(1);

    if (!bot) {
      return NextResponse.json({ error: 'Custom bot not found' }, { status: 404 });
    }

    // Build query conditions
    const conditions = [eq(customBotLogs.botId, id)];
    
    if (level && ['info', 'warn', 'error', 'debug'].includes(level)) {
      conditions.push(eq(customBotLogs.level, level));
    }
    
    if (since) {
      const sinceDate = new Date(since);
      conditions.push(gte(customBotLogs.timestamp, sinceDate));
    }

    // Fetch logs
    const logs = await db
      .select()
      .from(customBotLogs)
      .where(and(...conditions))
      .orderBy(desc(customBotLogs.timestamp))
      .limit(Math.min(limit, 500)); // Max 500 logs per request

    return NextResponse.json({ 
      botId: id,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Error fetching bot logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

// POST add log entry (called by bot process)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Authenticate bot process via API key in Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bot ')) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'API key required in Authorization header (format: "Bot <api_key>")'
      }, { status: 401 });
    }

    const apiKey = authHeader.substring(4); // Remove "Bot " prefix
    
    // Validate API key format
    if (!/^bot_[a-f0-9]{48}$/.test(apiKey)) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid API key format'
      }, { status: 401 });
    }
    
    const [bot] = await db
      .select()
      .from(customBots)
      .where(eq(customBots.id, id))
      .limit(1);

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Verify API key
    if (bot.apiKey !== apiKey) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid API key'
      }, { status: 401 });
    }

    // Validate log level
    if (!['info', 'warn', 'error', 'debug'].includes(body.level)) {
      return NextResponse.json({ error: 'Invalid log level' }, { status: 400 });
    }

    // Insert log entry
    await db.insert(customBotLogs).values({
      botId: id,
      level: body.level,
      message: body.message,
      metadata: body.metadata || {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating log entry:', error);
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}
