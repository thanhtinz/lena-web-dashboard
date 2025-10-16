import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customBots, customBotAnalytics } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq, and, desc, gte } from 'drizzle-orm';

// GET bot analytics (last 30 days)
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

    // Get analytics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const analytics = await db
      .select()
      .from(customBotAnalytics)
      .where(
        and(
          eq(customBotAnalytics.botId, id),
          gte(customBotAnalytics.date, dateStr)
        )
      )
      .orderBy(desc(customBotAnalytics.date))
      .limit(30);

    // Calculate totals
    const totals = analytics.reduce((acc, day) => ({
      totalMessages: acc.totalMessages + (day.messageCount || 0),
      totalCommands: acc.totalCommands + (day.commandCount || 0),
      totalErrors: acc.totalErrors + (day.errorCount || 0),
      totalUptime: acc.totalUptime + (day.uptimeMinutes || 0),
    }), {
      totalMessages: 0,
      totalCommands: 0,
      totalErrors: 0,
      totalUptime: 0,
    });

    return NextResponse.json({ 
      botId: id,
      analytics,
      totals,
      period: '30d',
    });
  } catch (error) {
    console.error('Error fetching bot analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
