import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminLogs } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// POST cleanup old data
export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Clean up old conversation history (older than 7 days)
    const conversationResult = await db.execute(sql`
      DELETE FROM conversation_history 
      WHERE timestamp < NOW() - INTERVAL '7 days'
    `);

    // Clean up expired giveaways (ended more than 30 days ago)
    const giveawayResult = await db.execute(sql`
      DELETE FROM giveaways 
      WHERE end_time < NOW() - INTERVAL '30 days'
    `);

    // Clean up old admin logs (older than 90 days)
    const logsResult = await db.execute(sql`
      DELETE FROM admin_logs 
      WHERE timestamp < NOW() - INTERVAL '90 days'
    `);

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'CLEANUP_DATABASE',
      targetType: 'database',
      details: { 
        conversationsDeleted: conversationResult.rowCount || 0,
        giveawaysDeleted: giveawayResult.rowCount || 0,
        logsDeleted: logsResult.rowCount || 0
      },
      timestamp: new Date(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Database cleanup completed successfully',
      stats: {
        conversationsDeleted: conversationResult.rowCount || 0,
        giveawaysDeleted: giveawayResult.rowCount || 0,
        logsDeleted: logsResult.rowCount || 0
      }
    });
  } catch (error) {
    console.error('Error cleaning up database:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup database' 
    }, { status: 500 });
  }
}
