import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pricingPlans } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * SECURITY NOTE: Admin routes currently have NO authentication for development.
 * 
 * PRODUCTION REQUIREMENTS:
 * - Implement proper Discord OAuth / NextAuth integration
 * - Verify user has admin role before allowing access
 * - Add rate limiting and audit logging
 * - Consider IP whitelisting for admin panel
 * 
 * For now, these routes should only be accessible in development environment.
 */

// GET all plans - NO AUTH for development
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  try {
    const plans = await db.select().from(pricingPlans).orderBy(pricingPlans.priceUsd);
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// POST create new plan - NO AUTH for development
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    const [newPlan] = await db.insert(pricingPlans).values({
      name: body.name,
      slug: body.slug,
      icon: body.icon || 'gem',
      badge: body.badge,
      description: body.description,
      priceUsd: body.priceUsd,
      priceVnd: body.priceVnd,
      billingCycle: body.billingCycle,
      trialDays: body.trialDays || 0,
      features: body.features || [],
      limits: body.limits || {
        maxServers: 1,
        maxCustomBots: 0,
        maxGiveawaysPerMonth: 10,
        maxCustomCommands: 50,
        maxCustomResponses: 50,
        maxEmbeds: 20,
        storageMb: 100,
        dailyApiCalls: 1000,
        concurrentConversations: 5,
      },
      allowedCommands: body.allowedCommands || ['*'],
      allowedFeatures: body.allowedFeatures || ['*'],
      restrictions: body.restrictions || {
        canUseAI: true,
        canUseGames: true,
        canUseModeration: false,
        canUseGiveaways: false,
        canUseCustomBots: false,
        canUseWebSearch: true,
        canUseImageAnalysis: false,
      },
      isVisible: body.isVisible ?? true,
      isActive: body.isActive ?? true,
      targetRegion: body.targetRegion || 'all',
    }).returning();

    return NextResponse.json(newPlan);
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

// PUT update existing plan - NO AUTH for development
export async function PUT(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('id');
    
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const body = await req.json();
    
    const [updatedPlan] = await db.update(pricingPlans)
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
      .where(eq(pricingPlans.id, planId))
      .returning();

    if (!updatedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

// DELETE remove plan - NO AUTH for development
export async function DELETE(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('id');
    
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const [deletedPlan] = await db.delete(pricingPlans)
      .where(eq(pricingPlans.id, planId))
      .returning();

    if (!deletedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Plan deleted successfully', plan: deletedPlan });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
