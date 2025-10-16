const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { eq, and, gte, sql } = require('drizzle-orm');

const neonClient = neon(process.env.DATABASE_URL);
const db = drizzle(neonClient);

const subscriptionsTable = {
  name: 'subscriptions',
  columns: {
    id: 'id',
    userId: 'user_id',
    planId: 'plan_id',
    status: 'status',
    paymentMethod: 'payment_method',
    startsAt: 'starts_at',
    endsAt: 'ends_at',
    createdAt: 'created_at'
  }
};

const pricingPlansTable = {
  name: 'pricing_plans',
  columns: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    priceUsd: 'price_usd',
    priceVnd: 'price_vnd',
    billingCycle: 'billing_cycle',
    features: 'features'
  }
};

/**
 * Check if a user has an active premium subscription
 * @param {string} userId - Discord user ID
 * @returns {Promise<{isPremium: boolean, subscription: object|null, plan: object|null}>}
 */
async function checkUserPremium(userId) {
  try {
    const result = await db.execute(sql`
      SELECT 
        s.id as subscription_id,
        s.user_id,
        s.plan_id,
        s.status,
        s.payment_method,
        s.starts_at,
        s.ends_at,
        s.created_at,
        p.id as plan_id_actual,
        p.name as plan_name,
        p.slug as plan_slug,
        p.price_vnd,
        p.billing_cycle,
        p.features
      FROM subscriptions s
      LEFT JOIN pricing_plans p ON s.plan_id = p.id
      WHERE s.user_id = ${userId}
        AND s.status = 'active'
        AND (s.ends_at IS NULL OR s.ends_at > NOW())
      ORDER BY s.created_at DESC
      LIMIT 1
    `);

    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      
      // Parse features if it's a string (from JSONB)
      let features = row.features;
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          console.error('Failed to parse features JSON:', e);
          features = [];
        }
      }
      
      // Ensure features is an array
      if (!Array.isArray(features)) {
        features = [];
      }
      
      return {
        isPremium: true,
        subscription: {
          id: row.subscription_id,
          userId: row.user_id,
          planId: row.plan_id,
          status: row.status,
          paymentMethod: row.payment_method,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          createdAt: row.created_at
        },
        plan: {
          id: row.plan_id_actual,
          name: row.plan_name,
          slug: row.plan_slug,
          priceVnd: row.price_vnd,
          billingCycle: row.billing_cycle,
          features: features
        }
      };
    }

    return {
      isPremium: false,
      subscription: null,
      plan: null
    };
  } catch (error) {
    console.error('Error checking premium status:', error);
    return {
      isPremium: false,
      subscription: null,
      plan: null
    };
  }
}

/**
 * Get all active subscriptions for a user
 * @param {string} userId - Discord user ID
 * @returns {Promise<Array>}
 */
async function getUserSubscriptions(userId) {
  try {
    const result = await db.execute(sql`
      SELECT 
        s.*,
        p.name as plan_name,
        p.slug as plan_slug,
        p.features
      FROM subscriptions s
      LEFT JOIN pricing_plans p ON s.plan_id = p.id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
    `);

    return result.rows || [];
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return [];
  }
}

/**
 * Get subscription details by ID
 * @param {string} subscriptionId
 * @returns {Promise<object|null>}
 */
async function getSubscriptionById(subscriptionId) {
  try {
    const result = await db.execute(sql`
      SELECT 
        s.*,
        p.name as plan_name,
        p.slug as plan_slug,
        p.price_vnd,
        p.features
      FROM subscriptions s
      LEFT JOIN pricing_plans p ON s.plan_id = p.id
      WHERE s.id = ${subscriptionId}
      LIMIT 1
    `);

    if (result.rows && result.rows.length > 0) {
      return result.rows[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Check if user has access to a specific feature
 * @param {string} userId - Discord user ID
 * @param {string} featureName - Feature name to check
 * @returns {Promise<boolean>}
 */
async function hasFeatureAccess(userId, featureName) {
  try {
    const { isPremium, plan } = await checkUserPremium(userId);
    
    if (!isPremium || !plan) {
      console.log(`[Premium] User ${userId} does not have premium - denying feature access`);
      return false;
    }

    const features = plan.features || [];
    if (!Array.isArray(features)) {
      console.error(`[Premium] Features is not an array for user ${userId}:`, features);
      return false;
    }

    const hasAccess = features.includes(featureName);
    console.log(`[Premium] User ${userId} feature check '${featureName}': ${hasAccess ? 'GRANTED' : 'DENIED'}`);
    return hasAccess;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Get all active pricing plans from database
 * @returns {Promise<Array>}
 */
async function getPricingPlans() {
  try {
    const result = await db.execute(sql`
      SELECT 
        id,
        name,
        slug,
        icon,
        badge,
        description,
        price_usd,
        price_vnd,
        billing_cycle,
        features,
        limits
      FROM pricing_plans
      WHERE is_active = true AND is_visible = true
      ORDER BY price_vnd ASC
    `);

    return result.rows.map(row => {
      // Parse features if it's a string (from JSONB)
      let features = row.features;
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          console.error('Failed to parse features JSON:', e);
          features = [];
        }
      }
      
      // Parse limits if it's a string (from JSONB)
      let limits = row.limits;
      if (typeof limits === 'string') {
        try {
          limits = JSON.parse(limits);
        } catch (e) {
          limits = null;
        }
      }
      
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        icon: row.icon,
        badge: row.badge,
        description: row.description,
        priceUsd: row.price_usd ? Number(row.price_usd) : 0,
        priceVnd: row.price_vnd ? Number(row.price_vnd) : 0,
        billingCycle: row.billing_cycle,
        features: Array.isArray(features) ? features : [],
        limits: limits
      };
    });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return [];
  }
}

/**
 * Check if user can use a specific command based on their plan
 * @param {string} userId - Discord user ID
 * @param {string} commandName - Command name
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
async function canUseCommand(userId, commandName) {
  try {
    const { isPremium, plan } = await checkUserPremium(userId);
    
    // Free tier commands
    const freeCommands = [
      'help', 'ping', 'status', 'avatar', 'banner', 
      'serverinfo', 'bot', 'roll', 'flip', 'trivia',
      'truth', 'dare', 'rps', '8ball', 'gif', 'pokemon', 'itunes'
    ];
    
    if (!isPremium || !plan) {
      if (freeCommands.includes(commandName)) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'Lệnh này yêu cầu Premium. Dùng `/premium` để xem các gói.' 
      };
    }
    
    // Get plan from database with allowed_commands
    const planResult = await db.execute(sql`
      SELECT allowed_commands, restrictions 
      FROM pricing_plans 
      WHERE id = ${plan.id}
      LIMIT 1
    `);
    
    if (planResult.rows && planResult.rows.length > 0) {
      const planData = planResult.rows[0];
      
      let allowedCommands = planData.allowed_commands || [];
      if (typeof allowedCommands === 'string') {
        try {
          allowedCommands = JSON.parse(allowedCommands);
        } catch (e) {
          console.error('Failed to parse allowed_commands:', e);
          return { allowed: false, reason: 'Invalid plan configuration' };
        }
      }
      
      if (!Array.isArray(allowedCommands)) {
        return { allowed: false, reason: 'Invalid plan configuration' };
      }
      
      if (allowedCommands.includes(commandName) || allowedCommands.includes('*')) {
        return { allowed: true };
      }
    }
    
    return { 
      allowed: false, 
      reason: `Plan ${plan.name} không hỗ trợ lệnh này.` 
    };
  } catch (error) {
    console.error('Error checking command permission:', error);
    return { allowed: false, reason: 'Lỗi hệ thống. Vui lòng thử lại sau.' };
  }
}

/**
 * Check if user can use a specific feature based on their plan
 * @param {string} userId - Discord user ID
 * @param {string} featureName - Feature name
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
async function canUseFeature(userId, featureName) {
  try {
    const { isPremium, plan } = await checkUserPremium(userId);
    
    // Free tier features
    const freeFeatures = ['ai_chat', 'web_search', 'news', 'vietnamese_games'];
    
    if (!isPremium || !plan) {
      if (freeFeatures.includes(featureName)) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'Tính năng này yêu cầu Premium.' 
      };
    }
    
    // Get plan from database with restrictions
    const planResult = await db.execute(sql`
      SELECT allowed_features, restrictions 
      FROM pricing_plans 
      WHERE id = ${plan.id}
      LIMIT 1
    `);
    
    if (planResult.rows && planResult.rows.length > 0) {
      const planData = planResult.rows[0];
      
      let allowedFeatures = planData.allowed_features || [];
      if (typeof allowedFeatures === 'string') {
        try {
          allowedFeatures = JSON.parse(allowedFeatures);
        } catch (e) {
          console.error('Failed to parse allowed_features:', e);
          return { allowed: false, reason: 'Invalid plan configuration' };
        }
      }
      
      let restrictions = planData.restrictions || {};
      if (typeof restrictions === 'string') {
        try {
          restrictions = JSON.parse(restrictions);
        } catch (e) {
          console.error('Failed to parse restrictions:', e);
          restrictions = {};
        }
      }
      
      if (!Array.isArray(allowedFeatures)) {
        return { allowed: false, reason: 'Invalid plan configuration' };
      }
      
      if (allowedFeatures.includes(featureName) || allowedFeatures.includes('*')) {
        // Check restrictions
        const featureRestrictionMap = {
          'ai_chat': 'canUseAI',
          'web_search': 'canUseWebSearch',
          'image_analysis': 'canUseImageAnalysis',
          'moderation': 'canUseModeration',
          'giveaways': 'canUseGiveaways',
          'custom_bots': 'canUseCustomBots',
          'vietnamese_games': 'canUseGames'
        };
        
        const restrictionKey = featureRestrictionMap[featureName];
        if (restrictionKey && restrictions[restrictionKey] === false) {
          return { 
            allowed: false, 
            reason: `Plan ${plan.name} đã tắt tính năng này.` 
          };
        }
        
        return { allowed: true };
      }
    }
    
    return { 
      allowed: false, 
      reason: `Plan ${plan.name} không hỗ trợ tính năng này.` 
    };
  } catch (error) {
    console.error('Error checking feature permission:', error);
    return { allowed: false, reason: 'Lỗi hệ thống. Vui lòng thử lại sau.' };
  }
}

/**
 * Check giveaway limit for user in current month
 * @param {string} userId - Discord user ID
 * @param {string} serverId - Discord server ID
 * @returns {Promise<{current: number, max: number|null, canCreate: boolean}>}
 */
async function checkGiveawayLimit(userId, serverId) {
  try {
    const { isPremium, plan } = await checkUserPremium(userId);
    
    // Get plan limits
    let maxGiveaways = null;
    if (isPremium && plan && plan.id) {
      const planResult = await db.execute(sql`
        SELECT limits 
        FROM pricing_plans 
        WHERE id = ${plan.id}
        LIMIT 1
      `);
      
      if (planResult.rows && planResult.rows.length > 0) {
        let limits = planResult.rows[0].limits || {};
        if (typeof limits === 'string') {
          try {
            limits = JSON.parse(limits);
          } catch (e) {
            console.error('Failed to parse limits:', e);
            limits = {};
          }
        }
        maxGiveaways = limits.maxGiveawaysPerMonth || null;
      }
    }
    
    // Count current month giveaways
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM giveaways
      WHERE server_id = ${serverId}
        AND host_id = ${userId}
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    const current = parseInt(countResult.rows[0]?.count || 0);
    
    if (maxGiveaways === null) {
      return { current, max: null, canCreate: true };
    }
    
    return { 
      current, 
      max: maxGiveaways, 
      canCreate: current < maxGiveaways 
    };
  } catch (error) {
    console.error('Error checking giveaway limit:', error);
    return { current: 0, max: null, canCreate: true };
  }
}

module.exports = {
  checkUserPremium,
  getUserSubscriptions,
  getSubscriptionById,
  hasFeatureAccess,
  getPricingPlans,
  canUseCommand,
  canUseFeature,
  checkGiveawayLimit
};
