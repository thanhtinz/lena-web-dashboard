import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customBots } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateBotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['online', 'offline', 'maintenance']).optional(),
  config: z.object({
    prefix: z.string().optional(),
    personalityMode: z.string().optional(),
    statusMessage: z.string().optional(),
    enabledFeatures: z.array(z.string()).optional(),
    intents: z.array(z.number()).optional(),
    permissions: z.array(z.string()).optional(),
    webhookUrl: z.string().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});

// GET single custom bot
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

    // Don't return sensitive fields (encrypted token, API key)
    const { botToken, apiKey, ...botWithoutSecrets } = bot;

    return NextResponse.json({ bot: botWithoutSecrets });
  } catch (error) {
    console.error('Error fetching custom bot:', error);
    return NextResponse.json({ error: 'Failed to fetch custom bot' }, { status: 500 });
  }
}

// PATCH update custom bot
export async function PATCH(
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
    
    // Validate input
    const validation = updateBotSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const updateData: any = {
      ...validation.data,
      updatedAt: new Date(),
    };

    // Update bot (only if user owns it)
    const [updatedBot] = await db
      .update(customBots)
      .set(updateData)
      .where(
        and(
          eq(customBots.id, id),
          eq(customBots.userId, userId)
        )
      )
      .returning();

    if (!updatedBot) {
      return NextResponse.json({ error: 'Custom bot not found' }, { status: 404 });
    }

    return NextResponse.json({ bot: updatedBot });
  } catch (error) {
    console.error('Error updating custom bot:', error);
    return NextResponse.json({ error: 'Failed to update custom bot' }, { status: 500 });
  }
}

// DELETE custom bot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deletedBot] = await db
      .delete(customBots)
      .where(
        and(
          eq(customBots.id, id),
          eq(customBots.userId, userId)
        )
      )
      .returning();

    if (!deletedBot) {
      return NextResponse.json({ error: 'Custom bot not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom bot:', error);
    return NextResponse.json({ error: 'Failed to delete custom bot' }, { status: 500 });
  }
}
