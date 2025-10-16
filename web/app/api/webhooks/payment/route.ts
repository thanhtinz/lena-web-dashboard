import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions, transactions, pricingPlans } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Verify PayOS webhook signature with replay protection
 * 
 * SECURITY NOTE: This implementation must match PayOS official spec exactly.
 * Current implementation includes:
 * - Replay protection with 5-minute timestamp window
 * - Timing-safe signature comparison
 * 
 * PRODUCTION TODO: Verify signature calculation against official PayOS docs
 * and implement nonce/transaction ID deduplication to prevent replay attacks.
 */
function verifyPayOSSignature(body: any, signature: string): boolean {
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!checksumKey) {
    console.error('PAYOS_CHECKSUM_KEY not configured');
    return false;
  }
  
  const timestamp = body.transactionDateTime;
  if (!timestamp) {
    console.error('Missing transaction timestamp');
    return false;
  }
  
  const requestTime = new Date(timestamp).getTime();
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (Math.abs(currentTime - requestTime) > fiveMinutes) {
    console.error('Webhook timestamp too old or in future');
    return false;
  }
  
  const sortedData = [
    body.code,
    body.desc,
    body.data?.orderCode,
    body.data?.amount,
    body.transactionDateTime
  ].filter(Boolean).sort().join('&');
  
  const expectedSignature = crypto
    .createHmac('sha256', checksumKey)
    .update(sortedData)
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    return false;
  }
}

/**
 * Verify Stripe webhook signature using exact match
 */
function verifyStripeSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return false;
  }
  
  try {
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.substring(2);
    const receivedSig = parts.find(p => p.startsWith('v1='))?.substring(3);
    
    if (!timestamp || !receivedSig) {
      return false;
    }
    
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(receivedSig),
      Buffer.from(expectedSig)
    );
  } catch (err) {
    console.error('Stripe signature verification error:', err);
    return false;
  }
}

/**
 * Payment webhook handler
 * Auto-apply premium plan sau khi thanh toán thành công
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    const signature = req.headers.get('x-payos-signature') || req.headers.get('stripe-signature') || '';
    const paymentProvider = body.paymentProvider || (req.headers.get('x-payos-signature') ? 'payos' : 'stripe');
    
    // Verify signature based on provider
    let isValidSignature = false;
    
    if (paymentProvider === 'payos') {
      isValidSignature = verifyPayOSSignature(body, signature);
    } else if (paymentProvider === 'stripe') {
      isValidSignature = verifyStripeSignature(rawBody, signature);
    } else {
      console.error('Unknown payment provider:', paymentProvider);
      return NextResponse.json({ error: 'Unknown payment provider' }, { status: 400 });
    }
    
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    
    const {
      userId,
      planId,
      amount,
      currency,
      externalTransactionId,
      status
    } = body;
    
    // Validate required fields
    if (!userId || !planId || !externalTransactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate ID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID format' }, { status: 400 });
    }

    // Log transaction
    const [transaction] = await db.insert(transactions).values({
      userId,
      amount,
      currency,
      status,
      paymentProvider,
      externalTransactionId,
      metadata: body,
    }).returning();
    
    // If payment successful, create/update subscription
    if (status === 'success' || status === 'completed') {
      // Get plan details
      const [plan] = await db
        .select()
        .from(pricingPlans)
        .where(eq(pricingPlans.id, planId))
        .limit(1);
      
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      
      // Calculate end date based on billing cycle
      const startsAt = new Date();
      const endsAt = new Date();
      
      if (plan.billingCycle === 'monthly') {
        endsAt.setMonth(endsAt.getMonth() + 1);
      } else if (plan.billingCycle === 'yearly') {
        endsAt.setFullYear(endsAt.getFullYear() + 1);
      } else if (plan.billingCycle === 'lifetime') {
        // Lifetime plan - no expiry
        endsAt.setFullYear(endsAt.getFullYear() + 100);
      }
      
      // Check existing subscription
      const existingSub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);
      
      if (existingSub.length > 0) {
        // Update existing subscription
        await db
          .update(subscriptions)
          .set({
            planId,
            status: 'active',
            paymentMethod: paymentProvider,
            startsAt,
            endsAt,
          })
          .where(eq(subscriptions.userId, userId));
      } else {
        // Create new subscription
        await db.insert(subscriptions).values({
          userId,
          planId,
          status: 'active',
          paymentMethod: paymentProvider,
          startsAt,
          endsAt,
        });
      }
      
      console.log(`✅ Premium plan applied for user ${userId}: ${plan.name}`);
      
      await db.execute(sql`
        INSERT INTO admin_logs (action, user_id, metadata, created_at)
        VALUES ('premium_activated', ${userId}, ${JSON.stringify({ planId, planName: plan.name, transactionId: transaction.id })}, NOW())
      `);
      
      return NextResponse.json({
        success: true,
        subscription: {
          userId,
          planId,
          planName: plan.name,
          startsAt,
          endsAt,
        }
      });
    }
    
    return NextResponse.json({ success: true, status: 'pending' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
