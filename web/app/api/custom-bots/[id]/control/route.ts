import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customBots } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq, and } from 'drizzle-orm';

const MAIN_BOT_CLIENT_ID = '1427054118572261390';

// POST control bot (start/stop/restart)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const action = body.action as 'start' | 'stop' | 'restart';
    
    if (!['start', 'stop', 'restart'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action',
        message: 'Action must be start, stop, or restart'
      }, { status: 400 });
    }

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

    // Check for main bot conflict when starting/restarting custom bot
    if (action === 'start' || action === 'restart') {
      const discordToken = process.env.DISCORD_BOT_TOKEN;
      if (discordToken) {
        try {
          const checkResponse = await fetch(
            `https://discord.com/api/v10/guilds/${bot.serverId}/members/${MAIN_BOT_CLIENT_ID}`,
            {
              headers: {
                'Authorization': `Bot ${discordToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (checkResponse.ok) {
            return NextResponse.json({ 
              error: 'Main bot conflict detected',
              message: 'The main bot (Lena) is still present in this server. Please remove the main bot before starting your custom bot to avoid conflicts.',
              code: 'MAIN_BOT_PRESENT',
              mainBotId: MAIN_BOT_CLIENT_ID,
            }, { status: 409 });
          }
        } catch (checkError) {
          console.error('Error checking for main bot:', checkError);
        }
      }
    }

    // TODO: Implement actual bot control logic with Discord.js
    // This would connect to your bot runner service/process manager
    // For now, we'll update the status in the database
    
    let newStatus: 'online' | 'offline' | 'maintenance';
    
    switch (action) {
      case 'start':
        newStatus = 'online';
        // TODO: Start bot process with token from database
        break;
      case 'stop':
        newStatus = 'offline';
        // TODO: Stop bot process
        break;
      case 'restart':
        newStatus = 'online';
        // TODO: Restart bot process
        break;
    }

    // Update bot status
    const [updatedBot] = await db
      .update(customBots)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(customBots.id, id))
      .returning();

    return NextResponse.json({ 
      success: true,
      action,
      status: updatedBot.status,
      message: `Bot ${action} command executed`
    });
  } catch (error) {
    console.error('Error controlling bot:', error);
    return NextResponse.json({ error: 'Failed to control bot' }, { status: 500 });
  }
}
