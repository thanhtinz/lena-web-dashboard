import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customBots } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq, and } from 'drizzle-orm';

// GET bot metrics/health
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

    // Return metrics from database
    // In production, this would fetch real-time metrics from the bot process
    const metrics = bot.metrics || {
      ping: 0,
      uptime: 0,
      memoryUsage: 0,
      guildCount: 0,
      userCount: 0,
      lastHeartbeat: null,
    };

    return NextResponse.json({ 
      botId: bot.id,
      status: bot.status,
      metrics,
      isHealthy: bot.status === 'online' && metrics.ping && metrics.ping < 300,
    });
  } catch (error) {
    console.error('Error fetching bot metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch bot metrics' }, { status: 500 });
  }
}

// POST update bot metrics (called by bot process)
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

    // Update metrics
    await db
      .update(customBots)
      .set({
        metrics: {
          ping: body.ping || 0,
          uptime: body.uptime || 0,
          memoryUsage: body.memoryUsage || 0,
          guildCount: body.guildCount || 0,
          userCount: body.userCount || 0,
          lastHeartbeat: new Date().toISOString(),
        },
        status: body.status || bot.status,
        updatedAt: new Date(),
      })
      .where(eq(customBots.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating bot metrics:', error);
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
  }
}
