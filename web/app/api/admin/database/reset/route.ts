import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminLogs } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

const resetSchema = z.object({
  serverId: z.string().optional(),
  tables: z.array(z.string()).optional(),
  resetAll: z.boolean().optional(),
});

// POST reset database tables
export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validation = resetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const { serverId, tables, resetAll } = validation.data;

    if (resetAll) {
      // Reset all tables - DANGEROUS!
      const tablesToReset = [
        'conversation_history',
        'giveaways',
        'giveaway_participants',
        'custom_responses',
        'embeds',
      ];

      for (const table of tablesToReset) {
        await db.execute(sql.raw(`DELETE FROM ${table}`));
      }

      // Log admin action
      await db.insert(adminLogs).values({
        adminUserId: adminId,
        action: 'RESET_ALL_DATABASE',
        targetType: 'database',
        details: { tables: tablesToReset },
        timestamp: new Date(),
      });

      return NextResponse.json({ 
        success: true, 
        message: 'All tables reset successfully',
        resetTables: tablesToReset 
      });
    } else if (serverId && tables && tables.length > 0) {
      // Reset specific tables for a server
      const resetTables = [];

      if (tables.includes('conversations')) {
        await db.execute(sql`
          DELETE FROM conversation_history 
          WHERE server_id = ${serverId}
        `);
        resetTables.push('conversations');
      }

      if (tables.includes('server_config')) {
        await db.execute(sql`
          DELETE FROM server_configs 
          WHERE server_id = ${serverId}
        `);
        resetTables.push('server_config');
      }

      if (tables.includes('giveaways')) {
        await db.execute(sql`
          DELETE FROM giveaways 
          WHERE server_id = ${serverId}
        `);
        await db.execute(sql`
          DELETE FROM giveaway_participants 
          WHERE giveaway_id IN (
            SELECT id FROM giveaways WHERE server_id = ${serverId}
          )
        `);
        resetTables.push('giveaways');
      }

      if (tables.includes('custom_responses')) {
        await db.execute(sql`
          DELETE FROM custom_responses 
          WHERE server_id = ${serverId}
        `);
        resetTables.push('custom_responses');
      }

      if (tables.includes('embeds')) {
        await db.execute(sql`
          DELETE FROM embeds 
          WHERE server_id = ${serverId}
        `);
        resetTables.push('embeds');
      }

      // Log admin action
      await db.insert(adminLogs).values({
        adminUserId: adminId,
        action: 'RESET_SERVER_DATA',
        targetType: 'server',
        targetId: serverId,
        details: { tables: resetTables },
        timestamp: new Date(),
      });

      return NextResponse.json({ 
        success: true, 
        message: `Server data reset successfully`,
        resetTables 
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid request parameters' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ 
      error: 'Failed to reset database' 
    }, { status: 500 });
  }
}
