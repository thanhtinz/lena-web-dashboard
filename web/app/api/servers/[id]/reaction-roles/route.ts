import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/session';
import { reactionRoleMessages } from '@/lib/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const messages = await db.select().from(reactionRoleMessages).where(eq(reactionRoleMessages.serverId, id));

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  try {
    const body = await request.json();
    const { channelId, messageType, content, embed } = body;

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Build Discord message payload
    const messagePayload: any = {};

    if (messageType === 'text' && content) {
      messagePayload.content = content;
    } else if (messageType === 'embed' && embed) {
      const discordEmbed: any = {};
      
      if (embed.title) discordEmbed.title = embed.title;
      if (embed.description) discordEmbed.description = embed.description;
      if (embed.color) {
        const colorHex = embed.color.replace('#', '');
        discordEmbed.color = parseInt(colorHex, 16);
      }
      if (embed.authorName) {
        discordEmbed.author = { name: embed.authorName };
        if (embed.authorIcon) discordEmbed.author.icon_url = embed.authorIcon;
      }
      if (embed.footerText) {
        discordEmbed.footer = { text: embed.footerText };
        if (embed.footerIcon) discordEmbed.footer.icon_url = embed.footerIcon;
      }
      if (embed.imageUrl) discordEmbed.image = { url: embed.imageUrl };
      if (embed.thumbnailUrl) discordEmbed.thumbnail = { url: embed.thumbnailUrl };
      if (embed.fields && embed.fields.length > 0) {
        discordEmbed.fields = embed.fields.map((f: any) => ({
          name: f.name,
          value: f.value,
          inline: f.inline || false
        }));
      }

      messagePayload.embeds = [discordEmbed];
    }

    // Send message via Discord API
    const discordResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      }
    );

    if (!discordResponse.ok) {
      const error = await discordResponse.json();
      console.error('Discord API error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send message to Discord' },
        { status: discordResponse.status }
      );
    }

    const discordMessage = await discordResponse.json();

    // Save to database
    await db.insert(reactionRoleMessages).values({
      serverId: id,
      messageId: discordMessage.id,
      channelId,
      enabled: true,
      locked: false,
      createdBy: user.id,
    });

    return NextResponse.json({ 
      success: true, 
      messageId: discordMessage.id 
    });

  } catch (error: any) {
    console.error('Error creating reaction role message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create message' },
      { status: 500 }
    );
  }
}
