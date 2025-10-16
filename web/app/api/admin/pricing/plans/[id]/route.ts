import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pricingPlans } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * SECURITY NOTE: Admin routes currently have NO authentication for development.
 * See /api/admin/pricing/plans/route.ts for security requirements.
 */

// PUT update plan - NO AUTH for development
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  // Validate ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    return NextResponse.json({ error: 'Invalid plan ID format' }, { status: 400 });
  }

  try {
    const body = await req.json();
    
    const [updated] = await db
      .update(pricingPlans)
      .set({
        name: body.name,
        slug: body.slug,
        icon: body.icon,
        badge: body.badge,
        description: body.description,
        priceUsd: body.priceUsd,
        priceVnd: body.priceVnd,
        billingCycle: body.billingCycle,
        trialDays: body.trialDays,
        features: body.features,
        limits: body.limits,
        allowedCommands: body.allowedCommands,
        allowedFeatures: body.allowedFeatures,
        restrictions: body.restrictions,
        isVisible: body.isVisible,
        isActive: body.isActive,
        targetRegion: body.targetRegion,
        updatedAt: new Date(),
      })
      .where(eq(pricingPlans.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

// DELETE plan - NO AUTH for development
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  // Validate ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    return NextResponse.json({ error: 'Invalid plan ID format' }, { status: 400 });
  }

  try {
    await db.delete(pricingPlans).where(eq(pricingPlans.id, params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
