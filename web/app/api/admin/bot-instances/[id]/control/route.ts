import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { botInstances, adminLogs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// POST control bot instance (start, stop, restart)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'start', 'stop', 'restart'

    if (!['start', 'stop', 'restart'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be start, stop, or restart' 
      }, { status: 400 });
    }

    // Get current bot instance
    const [bot] = await db
      .select()
      .from(botInstances)
      .where(eq(botInstances.id, id));

    if (!bot) {
      return NextResponse.json({ error: 'Bot instance not found' }, { status: 404 });
    }

    let newStatus = bot.status;

    // Update status based on action
    switch (action) {
      case 'start':
        newStatus = 'online';
        break;
      case 'stop':
        newStatus = 'offline';
        break;
      case 'restart':
        // For restart, we set to maintenance briefly, then online
        // In a real implementation, this would trigger actual bot restart
        newStatus = 'online';
        break;
    }

    // Update bot status
    const [updatedBot] = await db
      .update(botInstances)
      .set({ status: newStatus })
      .where(eq(botInstances.id, id))
      .returning();

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: `BOT_${action.toUpperCase()}`,
      targetType: 'bot_instance',
      targetId: id,
      details: { 
        botName: bot.name,
        previousStatus: bot.status,
        newStatus 
      },
      timestamp: new Date(),
    });

    return NextResponse.json({ 
      success: true,
      bot: updatedBot,
      message: `Bot ${action}ed successfully` 
    });
  } catch (error) {
    console.error('Error controlling bot instance:', error);
    return NextResponse.json({ 
      error: 'Failed to control bot instance' 
    }, { status: 500 });
  }
}
