import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pricingPlans, adminLogs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// PATCH update pricing plan
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

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update only provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.priceUsd !== undefined) updateData.priceUsd = body.priceUsd;
    if (body.priceVnd !== undefined) updateData.priceVnd = body.priceVnd;
    if (body.billingCycle !== undefined) updateData.billingCycle = body.billingCycle;
    if (body.trialDays !== undefined) updateData.trialDays = body.trialDays;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.limits !== undefined) updateData.limits = body.limits;
    if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.targetRegion !== undefined) updateData.targetRegion = body.targetRegion;

    const [updatedPlan] = await db
      .update(pricingPlans)
      .set(updateData)
      .where(eq(pricingPlans.id, id))
      .returning();

    if (!updatedPlan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 });
    }

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'UPDATE_PRICING_PLAN',
      targetType: 'pricing_plan',
      targetId: id,
      details: { changes: Object.keys(updateData) },
      timestamp: new Date(),
    });

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    return NextResponse.json({ error: 'Failed to update pricing plan' }, { status: 500 });
  }
}

// DELETE pricing plan
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

    const [deletedPlan] = await db
      .delete(pricingPlans)
      .where(eq(pricingPlans.id, id))
      .returning();

    if (!deletedPlan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 });
    }

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'DELETE_PRICING_PLAN',
      targetType: 'pricing_plan',
      targetId: id,
      details: { name: deletedPlan.name },
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    return NextResponse.json({ error: 'Failed to delete pricing plan' }, { status: 500 });
  }
}
