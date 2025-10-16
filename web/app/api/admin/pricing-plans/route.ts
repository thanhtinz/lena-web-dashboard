import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pricingPlans, adminLogs } from '@/lib/schema';
import { verifyAdmin } from '@/lib/admin-auth';

// GET all pricing plans
export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const plans = await db.select().from(pricingPlans);
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing plans' }, { status: 500 });
  }
}

// POST create new pricing plan
export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      icon,
      badge,
      description,
      priceUsd,
      priceVnd,
      billingCycle,
      trialDays,
      features,
      limits,
      isVisible,
      isActive,
      targetRegion
    } = body;

    // Validate required fields
    if (!name || !slug || priceUsd === undefined || priceVnd === undefined || !billingCycle || !features) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const [newPlan] = await db.insert(pricingPlans).values({
      name,
      slug,
      icon,
      badge,
      description,
      priceUsd,
      priceVnd,
      billingCycle,
      trialDays: trialDays || 0,
      features,
      limits: limits || {},
      isVisible: isVisible !== undefined ? isVisible : true,
      isActive: isActive !== undefined ? isActive : true,
      targetRegion: targetRegion || 'all',
    }).returning();

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'CREATE_PRICING_PLAN',
      targetType: 'pricing_plan',
      targetId: newPlan.id,
      details: { name, slug },
      timestamp: new Date(),
    });

    return NextResponse.json({ plan: newPlan });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    return NextResponse.json({ error: 'Failed to create pricing plan' }, { status: 500 });
  }
}
