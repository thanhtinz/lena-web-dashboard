import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { featureFlags, adminLogs } from '@/lib/schema';
import { verifyAdmin } from '@/lib/admin-auth';

// GET all feature flags
export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const flags = await db.select().from(featureFlags);
    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 });
  }
}

// POST create new feature flag
export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, enabled, rolloutPercentage, targetingRules } = body;

    const [newFlag] = await db.insert(featureFlags).values({
      name,
      description,
      enabled: enabled || false,
      rolloutPercentage: rolloutPercentage || 100,
      targetingRules: targetingRules || {},
    }).returning();

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'CREATE_FEATURE_FLAG',
      targetType: 'feature_flag',
      targetId: newFlag.id,
      details: { name },
      timestamp: new Date(),
    });

    return NextResponse.json({ flag: newFlag });
  } catch (error) {
    console.error('Error creating feature flag:', error);
    return NextResponse.json({ error: 'Failed to create feature flag' }, { status: 500 });
  }
}
