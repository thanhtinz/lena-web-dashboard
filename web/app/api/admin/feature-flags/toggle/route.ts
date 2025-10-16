import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { featureFlags, adminLogs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

const toggleSchema = z.object({
  id: z.string().min(1, 'Feature flag ID is required'),
});

// POST toggle feature flag
export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validation = toggleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const { id } = validation.data;

    // Get current flag
    const [currentFlag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, id));

    if (!currentFlag) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
    }

    // Toggle enabled status
    const [updatedFlag] = await db
      .update(featureFlags)
      .set({ enabled: !currentFlag.enabled })
      .where(eq(featureFlags.id, id))
      .returning();

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'TOGGLE_FEATURE_FLAG',
      targetType: 'feature_flag',
      targetId: id,
      details: { 
        name: currentFlag.name,
        from: currentFlag.enabled,
        to: !currentFlag.enabled 
      },
      timestamp: new Date(),
    });

    return NextResponse.json({ flag: updatedFlag });
  } catch (error) {
    console.error('Error toggling feature flag:', error);
    return NextResponse.json({ error: 'Failed to toggle feature flag' }, { status: 500 });
  }
}
