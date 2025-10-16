import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions, adminLogs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// GET all subscriptions
export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subs = await db.select().from(subscriptions);
    return NextResponse.json({ subscriptions: subs });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST create subscription
export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, planId, status, paymentMethod, startsAt, endsAt } = body;

    if (!userId || !status) {
      return NextResponse.json({ 
        error: 'userId and status are required' 
      }, { status: 400 });
    }

    const [newSub] = await db.insert(subscriptions).values({
      userId,
      planId,
      status,
      paymentMethod,
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      endsAt: endsAt ? new Date(endsAt) : null,
    }).returning();

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'CREATE_SUBSCRIPTION',
      targetType: 'subscription',
      targetId: newSub.id,
      details: { userId, planId },
      timestamp: new Date(),
    });

    return NextResponse.json({ subscription: newSub });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// PATCH update subscription
export async function PATCH(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, endsAt } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'Subscription id is required' 
      }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt) : null;

    const [updatedSub] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, id))
      .returning();

    if (!updatedSub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'UPDATE_SUBSCRIPTION',
      targetType: 'subscription',
      targetId: id,
      details: { changes: updateData },
      timestamp: new Date(),
    });

    return NextResponse.json({ subscription: updatedSub });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

// DELETE subscription
export async function DELETE(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Subscription id is required' 
      }, { status: 400 });
    }

    const [deletedSub] = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id))
      .returning();

    if (!deletedSub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Log admin action
    await db.insert(adminLogs).values({
      adminUserId: adminId,
      action: 'DELETE_SUBSCRIPTION',
      targetType: 'subscription',
      targetId: id,
      details: { userId: deletedSub.userId },
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}
