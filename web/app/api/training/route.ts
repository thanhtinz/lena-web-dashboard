import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trainingData, serverConfigs } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { isPremiumServer } from '@/lib/premium';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

const trainingSchema = z.object({
  serverId: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

// POST create training data
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifySession(sessionCookie.value);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const validation = trainingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const data = validation.data;

    // Check if user has access to server
    const guild = user.guilds?.find((g: any) => g.id === data.serverId);
    if (!guild || !(guild.permissions & 0x8)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if server has premium (Site admin + Server admin = auto premium)
    const hasPremium = await isPremiumServer(data.serverId, guild.permissions, user.id);
    if (!hasPremium) {
      return NextResponse.json({ 
        error: 'Premium required',
        message: 'Training data is a premium feature. Upgrade your server to premium to use this feature.'
      }, { status: 403 });
    }

    const [newTraining] = await db.insert(trainingData).values({
      serverId: data.serverId,
      question: data.question,
      answer: data.answer,
      category: data.category || null,
      isActive: data.isActive ?? true,
      createdBy: user.id,
    }).returning();

    return NextResponse.json({ training: newTraining }, { status: 201 });
  } catch (error) {
    console.error('Error creating training data:', error);
    return NextResponse.json({ error: 'Failed to create training data' }, { status: 500 });
  }
}
