import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

// GET - Fetch roles and channels for a server
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = user.guilds?.some((g: any) => g.id === id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch roles and channels from Discord API
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    const [rolesResponse, channelsResponse] = await Promise.all([
      fetch(`https://discord.com/api/v10/guilds/${id}/roles`, {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }),
      fetch(`https://discord.com/api/v10/guilds/${id}/channels`, {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }),
    ]);

    if (!rolesResponse.ok || !channelsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch server data from Discord' },
        { status: 500 }
      );
    }

    const roles = await rolesResponse.json();
    const channels = await channelsResponse.json();

    // Filter and format
    const formattedRoles = roles
      .filter((r: any) => r.name !== '@everyone')
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        position: r.position,
      }))
      .sort((a: any, b: any) => b.position - a.position);

    const formattedChannels = channels
      .filter((c: any) => [0, 5].includes(c.type)) // Text and announcement channels
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        position: c.position,
      }))
      .sort((a: any, b: any) => a.position - b.position);

    return NextResponse.json({
      roles: formattedRoles,
      channels: formattedChannels,
    });
  } catch (error) {
    console.error('Error fetching roles/channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles and channels' },
      { status: 500 }
    );
  }
}
