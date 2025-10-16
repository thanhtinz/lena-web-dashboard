import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/user-auth';

const MAIN_BOT_CLIENT_ID = '1427054118572261390'; // Lena bot client ID

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { serverId } = await params;

    const discordToken = process.env.DISCORD_BOT_TOKEN;
    if (!discordToken) {
      return NextResponse.json({ 
        error: 'Bot token not configured',
        hasMainBot: false,
        canUseCustomBot: true
      });
    }

    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members/${MAIN_BOT_CLIENT_ID}`, {
        headers: {
          'Authorization': `Bot ${discordToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const memberData = await response.json();
        return NextResponse.json({
          hasMainBot: true,
          canUseCustomBot: false,
          mainBotId: MAIN_BOT_CLIENT_ID,
          mainBotName: 'Lena',
          message: 'Main bot (Lena) is present in this server. Please remove it before using a custom bot.',
          mainBotDetails: {
            userId: memberData.user?.id,
            username: memberData.user?.username,
            joinedAt: memberData.joined_at,
          }
        });
      } else if (response.status === 404) {
        return NextResponse.json({
          hasMainBot: false,
          canUseCustomBot: true,
          message: 'Main bot is not in this server. You can use a custom bot.'
        });
      } else {
        console.error('Discord API error:', response.status, await response.text());
        return NextResponse.json({
          error: 'Failed to check server membership',
          hasMainBot: false,
          canUseCustomBot: false
        }, { status: 500 });
      }
    } catch (fetchError) {
      console.error('Error checking Discord server:', fetchError);
      return NextResponse.json({
        error: 'Failed to verify server membership',
        hasMainBot: false,
        canUseCustomBot: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in check-conflict:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      hasMainBot: false,
      canUseCustomBot: false
    }, { status: 500 });
  }
}
