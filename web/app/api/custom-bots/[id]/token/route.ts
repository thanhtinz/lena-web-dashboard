import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customBots } from '@/lib/schema';
import { verifyUser } from '@/lib/user-auth';
import { encrypt } from '@/lib/encryption';
import { eq, and } from 'drizzle-orm';

// PATCH update bot token
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
    
    if (!body.botToken) {
      return NextResponse.json({ error: 'Bot token is required' }, { status: 400 });
    }

    // Verify token format (basic validation)
    if (body.botToken.length < 50) {
      return NextResponse.json({ 
        error: 'Invalid bot token format',
        message: 'Discord bot tokens are typically 70+ characters'
      }, { status: 400 });
    }

    // Update bot token (only if user owns it)
    const [updatedBot] = await db
      .update(customBots)
      .set({
        botToken: encrypt(body.botToken),
        updatedAt: new Date(),
      })
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

    return NextResponse.json({ 
      success: true,
      message: 'Bot token updated successfully' 
    });
  } catch (error) {
    console.error('Error updating bot token:', error);
    return NextResponse.json({ error: 'Failed to update bot token' }, { status: 500 });
  }
}
