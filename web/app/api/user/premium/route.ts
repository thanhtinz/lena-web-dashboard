import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/user-auth';
import { isPremiumUser, getUserSubscription } from '@/lib/premium';

export async function GET(request: NextRequest) {
  const userId = await verifyUser(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const isPremium = await isPremiumUser(userId);
    const subscription = await getUserSubscription(userId);

    return NextResponse.json({ 
      isPremium,
      subscription: subscription?.subscription || null,
      plan: subscription?.plan || null,
    });
  } catch (error) {
    console.error('Error checking premium status:', error);
    return NextResponse.json({ error: 'Failed to check premium status' }, { status: 500 });
  }
}
