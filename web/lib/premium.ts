import { db } from './db';
import { subscriptions, pricingPlans } from './schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Check if a user has an active premium subscription
 * @param userId - Discord user ID  
 * @param testMode - If true, bypass admin premium check (for testing as normal user)
 */
export async function isPremiumUser(userId: string, testMode: boolean = false): Promise<boolean> {
  // Check if global TEST_MODE is enabled (for admin testing)
  const globalTestMode = process.env.TEST_MODE === 'true';
  
  // Admin users always have premium access UNLESS test mode is enabled
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (adminIds.includes(userId) && !testMode && !globalTestMode) {
    return true; // Admin has premium by default
  }

  // For non-admin users or admin in test mode, check database subscription
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      )
    )
    .limit(1);

  if (!sub) return false;

  // Check if subscription is not expired
  if (sub.endsAt && new Date(sub.endsAt) < new Date()) {
    return false;
  }

  return true;
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) return null;

  // Get plan details
  if (sub.planId) {
    const [plan] = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.id, sub.planId))
      .limit(1);

    return {
      subscription: sub,
      plan: plan || null,
    };
  }

  return {
    subscription: sub,
    plan: null,
  };
}

/**
 * Check if user has access to a specific premium feature
 * @param testMode - If true, admin will be treated as non-premium
 */
export async function hasPremiumFeature(
  userId: string,
  featureName: 'custom_bot' | 'custom_commands' | 'unlimited_giveaways' | 'analytics',
  testMode: boolean = false
): Promise<boolean> {
  const isPremium = await isPremiumUser(userId, testMode);
  if (!isPremium) return false;

  // All premium users have access to all premium features
  // You can add more granular checks here if needed
  return true;
}

/**
 * Check if a server has premium status
 * Server has premium if:
 * 1. User is site admin (ADMIN_USER_IDS) AND has server admin permissions → Auto premium (special exception), OR
 * 2. Server admin purchased premium → Server's isPremium flag is true AND not expired
 * 
 * Regular server admins must purchase premium for their server.
 * Only site admins (bot creators) get automatic premium.
 * 
 * @param serverId - Discord server ID
 * @param userPermissions - User's permission bitmask for that server (0x8 = Administrator)
 * @param userId - Discord user ID
 */
export async function isPremiumServer(
  serverId: string, 
  userPermissions: number,
  userId: string
): Promise<boolean> {
  const globalTestMode = process.env.TEST_MODE === 'true';
  
  // EXCEPTION: Only site admins (bot creators) get auto premium
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  const isSiteAdmin = adminIds.includes(userId);
  const isServerAdmin = (userPermissions & 0x8) === 0x8; // 0x8 = Administrator permission
  
  // Site admin (bot creator) + Server admin = Auto premium (unless TEST_MODE)
  if (isSiteAdmin && isServerAdmin && !globalTestMode) {
    return true;
  }
  
  // For all other users (including regular server admins):
  // Check if they purchased premium (database isPremium flag) AND not expired
  const { serverConfigs } = await import('./schema');
  const [config] = await db
    .select()
    .from(serverConfigs)
    .where(eq(serverConfigs.serverId, serverId))
    .limit(1);
  
  if (!config || !config.isPremium) {
    return false;
  }
  
  // Check if premium subscription has expired
  if (config.premiumExpiry) {
    const now = new Date();
    const expiry = new Date(config.premiumExpiry);
    if (now > expiry) {
      return false; // Premium expired
    }
  }
  
  return true;
}

/**
 * Get premium limits for user
 */
export async function getPremiumLimits(userId: string) {
  const subData = await getUserSubscription(userId);
  
  if (!subData || !subData.plan) {
    // Free tier limits
    return {
      maxCustomBots: 0,
      maxCustomCommands: 0,
      maxGiveaways: 5,
      maxServers: 1,
    };
  }

  const plan = subData.plan;
  
  // Extract limits from plan metadata (not hard-coded by name)
  const limits = plan.limits || {};
  
  return {
    maxCustomBots: (limits as any).maxCustomBots || 0,
    maxCustomCommands: (limits as any).maxCustomCommands || 0,
    maxGiveaways: limits.maxGiveawaysPerMonth || 5,
    maxServers: limits.maxServers || 1,
  };
}

/**
 * Count user's current usage (total owned, not just active to prevent limit bypass)
 */
export async function getUserUsage(userId: string) {
  const customBotsCount = await db.execute(sql`
    SELECT COUNT(*) as count FROM custom_bots WHERE user_id = ${userId}
  `);

  const customCommandsCount = await db.execute(sql`
    SELECT COUNT(*) as count FROM premium_commands WHERE user_id = ${userId}
  `);

  return {
    customBots: Number(customBotsCount.rows[0]?.count) || 0,
    customCommands: Number(customCommandsCount.rows[0]?.count) || 0,
  };
}
