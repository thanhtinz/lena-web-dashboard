import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { featureFlags, adminLogs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// PATCH update feature flag
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { enabled, rolloutPercentage, targetingRules } = body;

    const updateData: any = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (rolloutPercentage !== undefined) updateData.rolloutPercentage = rolloutPercentage;
    if (targetingRules !== undefined) updateData.targetingRules = targetingRules;

    const [updatedFlag] = await db
      .update(featureFlags)
      .set(updateData)
      .where(eq(featureFlags.id, id))
      .returning();

    if (!updatedFlag) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
    }

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'UPDATE_FEATURE_FLAG',
      targetType: 'feature_flag',
      targetId: id,
      details: { changes: updateData },
      timestamp: new Date(),
    });

    return NextResponse.json({ flag: updatedFlag });
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 });
  }
}

// DELETE feature flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deletedFlag] = await db
      .delete(featureFlags)
      .where(eq(featureFlags.id, id))
      .returning();

    if (!deletedFlag) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
    }

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'DELETE_FEATURE_FLAG',
      targetType: 'feature_flag',
      targetId: id,
      details: { name: deletedFlag.name },
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    return NextResponse.json({ error: 'Failed to delete feature flag' }, { status: 500 });
  }
}
