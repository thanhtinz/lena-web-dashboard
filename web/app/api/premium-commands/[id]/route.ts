import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { premiumCommands } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateCommandSchema = z.object({
  commandName: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/).optional(),
  description: z.string().optional(),
  responseType: z.enum(['text', 'embed']).optional(),
  responseContent: z.string().min(1).optional(),
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
  isActive: z.boolean().optional(),
});

// PATCH update premium command
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
    const validation = updateCommandSchema.safeParse(body);
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

    // Update command (only if user owns it)
    const [updatedCommand] = await db
      .update(premiumCommands)
      .set(updateData)
      .where(
        and(
          eq(premiumCommands.id, id),
          eq(premiumCommands.userId, userId)
        )
      )
      .returning();

    if (!updatedCommand) {
      return NextResponse.json({ error: 'Premium command not found' }, { status: 404 });
    }

    return NextResponse.json({ command: updatedCommand });
  } catch (error) {
    console.error('Error updating premium command:', error);
    return NextResponse.json({ error: 'Failed to update premium command' }, { status: 500 });
  }
}

// DELETE premium command
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

    const [deletedCommand] = await db
      .delete(premiumCommands)
      .where(
        and(
          eq(premiumCommands.id, id),
          eq(premiumCommands.userId, userId)
        )
      )
      .returning();

    if (!deletedCommand) {
      return NextResponse.json({ error: 'Premium command not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting premium command:', error);
    return NextResponse.json({ error: 'Failed to delete premium command' }, { status: 500 });
  }
}
