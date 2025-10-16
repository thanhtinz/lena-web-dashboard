import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { premiumCommands } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { isPremiumUser, getUserUsage, getPremiumLimits } from '@/lib/premium';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createCommandSchema = z.object({
  serverId: z.string().min(1),
  customBotId: z.string().optional(),
  commandName: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/, 'Command name must be lowercase alphanumeric with underscores'),
  description: z.string().optional(),
  responseType: z.enum(['text', 'embed']).default('text'),
  responseContent: z.string().min(1),
  embedData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).optional(),
    footer: z.string().optional(),
    thumbnail: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
  permissions: z.object({
    requiredRoles: z.array(z.string()).optional(),
    allowedChannels: z.array(z.string()).optional(),
    cooldown: z.number().int().min(0).optional(),
  }).optional(),
});

// GET user's premium commands
export async function GET(request: NextRequest) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');

    let query = db.select().from(premiumCommands).where(eq(premiumCommands.userId, userId));
    
    if (serverId) {
      query = db.select().from(premiumCommands).where(
        and(
          eq(premiumCommands.userId, userId),
          eq(premiumCommands.serverId, serverId)
        )
      );
    }

    const commands = await query;

    return NextResponse.json({ commands });
  } catch (error) {
    console.error('Error fetching premium commands:', error);
    return NextResponse.json({ error: 'Failed to fetch premium commands' }, { status: 500 });
  }
}

// POST create premium command
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
        message: 'Custom commands are only available for premium users'
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = createCommandSchema.safeParse(body);
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

    if (usage.customCommands >= limits.maxCustomCommands) {
      return NextResponse.json({ 
        error: 'Custom command limit reached',
        message: `You can only create ${limits.maxCustomCommands} custom command(s) with your current plan`
      }, { status: 403 });
    }

    // Create premium command
    const [newCommand] = await db.insert(premiumCommands).values({
      userId,
      serverId: data.serverId,
      customBotId: data.customBotId,
      commandName: data.commandName,
      description: data.description,
      responseType: data.responseType,
      responseContent: data.responseContent,
      embedData: data.embedData,
      permissions: data.permissions,
      isActive: true,
      usageCount: 0,
    }).returning();

    return NextResponse.json({ command: newCommand }, { status: 201 });
  } catch (error) {
    console.error('Error creating premium command:', error);
    return NextResponse.json({ error: 'Failed to create premium command' }, { status: 500 });
  }
}
