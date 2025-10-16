import { db } from './db';
import { serverConfigs } from './schema';
import { eq } from 'drizzle-orm';

export const PREMIUM_FEATURES = {
  TRAIN_LENA: 'train_lena',
  CUSTOM_COMMANDS: 'custom_commands',
  AUTO_BAN: 'auto_ban',
  AUTO_DELETE: 'auto_delete',
  SCHEDULED_MESSAGES: 'scheduled_messages',
  CUSTOM_BOTS: 'custom_bots',
  ADVANCED_LOGGING: 'advanced_logging',
  CONFESSION_LOGGING: 'confession_logging'
};

interface PremiumStatus {
  isPremium: boolean;
  planId: string | null;
  expiresAt: Date | null;
  ownerId: string | null;
}

/**
 * Check if user is a super admin (bypasses all premium checks)
 */
export function isSuperAdmin(userId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
}

/**
 * Check if a server has active premium access
 * Super admins always get premium access
 */
export async function checkServerPremium(serverId: string, userId?: string): Promise<PremiumStatus> {
  try {
    // Super admin bypass
    if (userId && isSuperAdmin(userId)) {
      return { 
        isPremium: true, 
        planId: 'super_admin', 
        expiresAt: null, 
        ownerId: userId 
      };
    }

    const config = await db.select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, serverId))
      .limit(1);

    if (config.length === 0) {
      return { isPremium: false, planId: null, expiresAt: null, ownerId: null };
    }

    const serverConfig = config[0];

    // Check if premium flag is enabled
    if (!serverConfig.isPremium) {
      return { 
        isPremium: false, 
        planId: serverConfig.premiumPlanId, 
        expiresAt: null, 
        ownerId: serverConfig.premiumOwnerId 
      };
    }

    // Check if premium has expired
    if (serverConfig.premiumExpiry) {
      const now = new Date();
      const expiryDate = new Date(serverConfig.premiumExpiry);

      if (expiryDate < now) {
        // Premium has expired, auto-disable it
        await db.update(serverConfigs)
          .set({ isPremium: false })
          .where(eq(serverConfigs.serverId, serverId));

        console.log(`[Server Premium] Server ${serverId} premium expired on ${expiryDate.toISOString()}`);

        return { 
          isPremium: false, 
          planId: serverConfig.premiumPlanId, 
          expiresAt: expiryDate, 
          ownerId: serverConfig.premiumOwnerId 
        };
      }
    }

    // Premium is active
    return {
      isPremium: true,
      planId: serverConfig.premiumPlanId,
      expiresAt: serverConfig.premiumExpiry ? new Date(serverConfig.premiumExpiry) : null,
      ownerId: serverConfig.premiumOwnerId
    };
  } catch (error) {
    console.error('Error checking server premium status:', error);
    return { isPremium: false, planId: null, expiresAt: null, ownerId: null };
  }
}

/**
 * Check if server has access to a specific premium feature
 */
export async function hasServerPremiumFeature(serverId: string, feature: string): Promise<boolean> {
  const { isPremium } = await checkServerPremium(serverId);
  return isPremium;
}
