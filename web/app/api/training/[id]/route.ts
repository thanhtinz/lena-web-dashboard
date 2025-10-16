import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trainingData, serverConfigs } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Check if server has premium
async function isServerPremium(serverId: string): Promise<boolean> {
  const config = await db
    .select()
    .from(serverConfigs)
    .where(eq(serverConfigs.serverId, serverId))
    .limit(1);

  if (config.length === 0) return false;

  const serverConfig = config[0];
  
  if (!serverConfig.isPremium) return false;
  
  if (serverConfig.premiumExpiry) {
    const now = new Date();
    const expiry = new Date(serverConfig.premiumExpiry);
    if (now > expiry) return false;
  }

  return true;
}

// PATCH update training data
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid training ID' }, { status: 400 });
    }

    // Get existing training
    const existing = await db
      .select()
      .from(trainingData)
      .where(eq(trainingData.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Training data not found' }, { status: 404 });
    }

    // Check premium
    const hasPremium = await isServerPremium(existing[0].serverId);
    if (!hasPremium) {
      return NextResponse.json({ 
        error: 'Premium required',
        message: 'Training data is a premium feature'
      }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const updates = validation.data;

    const [updated] = await db
      .update(trainingData)
      .set({ 
        ...updates,
        updatedAt: new Date() 
      })
      .where(eq(trainingData.id, id))
      .returning();

    return NextResponse.json({ training: updated });
  } catch (error) {
    console.error('Error updating training data:', error);
    return NextResponse.json({ error: 'Failed to update training data' }, { status: 500 });
  }
}

// DELETE training data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid training ID' }, { status: 400 });
    }

    // Get existing training
    const existing = await db
      .select()
      .from(trainingData)
      .where(eq(trainingData.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Training data not found' }, { status: 404 });
    }

    // Check premium
    const hasPremium = await isServerPremium(existing[0].serverId);
    if (!hasPremium) {
      return NextResponse.json({ 
        error: 'Premium required',
        message: 'Training data is a premium feature'
      }, { status: 403 });
    }

    await db.delete(trainingData).where(eq(trainingData.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting training data:', error);
    return NextResponse.json({ error: 'Failed to delete training data' }, { status: 500 });
  }
}
