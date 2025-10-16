import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customBots } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { isPremiumUser, getUserUsage, getPremiumLimits } from '@/lib/premium';
import { encrypt } from '@/lib/encryption';
import { generateBotApiKey } from '@/lib/bot-api-key';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createBotSchema = z.object({
  serverId: z.string().min(1),
  name: z.string().min(1).max(100),
  botToken: z.string().min(1),
  clientId: z.string().min(1),
  username: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  config: z.object({
    prefix: z.string().optional(),
    personalityMode: z.string().optional(),
    statusMessage: z.string().optional(),
    enabledFeatures: z.array(z.string()).optional(),
  }).optional(),
});

// GET user's custom bots
export async function GET(request: NextRequest) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bots = await db
      .select()
      .from(customBots)
      .where(eq(customBots.userId, userId));

    // Strip sensitive fields from response
    const sanitizedBots = bots.map(({ botToken, apiKey, ...bot }) => bot);

    return NextResponse.json({ bots: sanitizedBots });
  } catch (error) {
    console.error('Error fetching custom bots:', error);
    return NextResponse.json({ error: 'Failed to fetch custom bots' }, { status: 500 });
  }
}

// POST create custom bot
export async function POST(request: NextRequest) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is premium
    const isPremium = await isPremiumUser(userId);
    if (!isPremium) {
      return NextResponse.json({ 
        error: 'Premium subscription required',
        message: 'Custom bots are only available for premium users'
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = createBotSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const data = validation.data;

    // Check limits
    const limits = await getPremiumLimits(userId);
    const usage = await getUserUsage(userId);

    if (usage.customBots >= limits.maxCustomBots) {
      return NextResponse.json({ 
        error: 'Custom bot limit reached',
        message: `You can only create ${limits.maxCustomBots} custom bot(s) with your current plan`
      }, { status: 403 });
    }

    // Create custom bot with encrypted token and API key
    const apiKey = generateBotApiKey();
    
    const [newBot] = await db.insert(customBots).values({
      userId,
      serverId: data.serverId,
      name: data.name,
      username: data.username,
      avatarUrl: data.avatarUrl,
      botToken: encrypt(data.botToken), // Encrypt bot token
      clientId: data.clientId,
      apiKey, // Store API key for bot process authentication
      config: data.config || {},
      status: 'offline',
      isActive: true,
    }).returning();

    // Return API key in response (user needs to save it, won't be shown again)
    return NextResponse.json({ 
      bot: newBot,
      apiKey, // Only returned on creation
      message: 'Save this API key securely - you won\'t be able to see it again!'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom bot:', error);
    return NextResponse.json({ error: 'Failed to create custom bot' }, { status: 500 });
  }
}
