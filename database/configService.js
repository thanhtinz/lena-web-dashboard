const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { eq } = require('drizzle-orm');
const { serverConfigs } = require('./schema');

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

/**
 * Get server configuration from database
 * @param {string} serverId - Discord server ID
 * @returns {Promise<Object>} Server configuration
 */
async function getServerConfig(serverId) {
  try {
    const result = await db
      .select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, serverId))
      .limit(1);

    if (result.length === 0) {
      // Return default config if not found (language is null = not configured yet)
      return {
        serverId,
        prefix: '!',
        mode: 'lena',
        personalityMode: 'lena',
        language: null,
        allowedChannels: [],
        autoReact: true,
        contentFilter: true,
        customBlacklist: [],
        keywords: {},
        customResponses: {},
        isPremium: false,
        premiumExpiry: null,
        premiumPlanId: null,
        premiumOwnerId: null
      };
    }

    const config = result[0];
    return {
      serverId: config.serverId,
      prefix: config.prefix || '!',
      mode: config.personalityMode || 'lena',
      personalityMode: config.personalityMode || 'lena',
      language: config.language || null,
      allowedChannels: config.allowedChannels || [],
      autoReact: config.autoReact ?? true,
      contentFilter: config.contentFilter ?? true,
      customBlacklist: config.customBlacklist || [],
      keywords: config.keywords || {},
      customResponses: {},
      isPremium: config.isPremium ?? false,
      premiumExpiry: config.premiumExpiry || null,
      premiumPlanId: config.premiumPlanId || null,
      premiumOwnerId: config.premiumOwnerId || null
    };
  } catch (error) {
    console.error('Error getting server config from database:', error);
    // Return default config on error
    return {
      serverId,
      prefix: '!',
      mode: 'lena',
      personalityMode: 'lena',
      language: null,
      allowedChannels: [],
      autoReact: true,
      contentFilter: true,
      customBlacklist: [],
      keywords: {},
      customResponses: {},
      isPremium: false,
      premiumExpiry: null,
      premiumPlanId: null,
      premiumOwnerId: null
    };
  }
}

/**
 * Set server personality mode
 * @param {string} serverId - Discord server ID
 * @param {string} mode - Personality mode
 */
async function setServerMode(serverId, mode) {
  try {
    const existing = await db
      .select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, serverId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(serverConfigs).values({
        serverId,
        personalityMode: mode,
        prefix: '!',
        allowedChannels: [],
        autoReact: true,
        contentFilter: true,
      });
    } else {
      await db
        .update(serverConfigs)
        .set({ 
          personalityMode: mode,
          updatedAt: new Date() 
        })
        .where(eq(serverConfigs.serverId, serverId));
    }

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error setting server mode:', error);
    throw error;
  }
}

/**
 * Set server command prefix
 * @param {string} serverId - Discord server ID
 * @param {string} prefix - Command prefix
 */
async function setServerPrefix(serverId, prefix) {
  try {
    const existing = await db
      .select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, serverId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(serverConfigs).values({
        serverId,
        prefix,
        personalityMode: 'lena',
        allowedChannels: [],
        autoReact: true,
        contentFilter: true,
      });
    } else {
      await db
        .update(serverConfigs)
        .set({ 
          prefix,
          updatedAt: new Date() 
        })
        .where(eq(serverConfigs.serverId, serverId));
    }

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error setting server prefix:', error);
    throw error;
  }
}

/**
 * Add allowed channel
 * @param {string} serverId - Discord server ID
 * @param {string} channelId - Channel ID to add
 */
async function addAllowedChannel(serverId, channelId) {
  try {
    const config = await getServerConfig(serverId);
    
    if (!config.allowedChannels.includes(channelId)) {
      const newChannels = [...config.allowedChannels, channelId];
      
      const existing = await db
        .select()
        .from(serverConfigs)
        .where(eq(serverConfigs.serverId, serverId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(serverConfigs).values({
          serverId,
          allowedChannels: newChannels,
          prefix: config.prefix,
          personalityMode: config.personalityMode,
          autoReact: config.autoReact,
          contentFilter: config.contentFilter,
        });
      } else {
        await db
          .update(serverConfigs)
          .set({ 
            allowedChannels: newChannels,
            updatedAt: new Date() 
          })
          .where(eq(serverConfigs.serverId, serverId));
      }
    }

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error adding allowed channel:', error);
    throw error;
  }
}

/**
 * Remove allowed channel
 * @param {string} serverId - Discord server ID
 * @param {string} channelId - Channel ID to remove
 */
async function removeAllowedChannel(serverId, channelId) {
  try {
    const config = await getServerConfig(serverId);
    const newChannels = config.allowedChannels.filter(id => id !== channelId);
    
    await db
      .update(serverConfigs)
      .set({ 
        allowedChannels: newChannels,
        updatedAt: new Date() 
      })
      .where(eq(serverConfigs.serverId, serverId));

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error removing allowed channel:', error);
    throw error;
  }
}

/**
 * Clear all allowed channels
 * @param {string} serverId - Discord server ID
 */
async function clearAllowedChannels(serverId) {
  try {
    await db
      .update(serverConfigs)
      .set({ 
        allowedChannels: [],
        updatedAt: new Date() 
      })
      .where(eq(serverConfigs.serverId, serverId));

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error clearing allowed channels:', error);
    throw error;
  }
}

/**
 * Update server blacklist
 * @param {string} serverId - Discord server ID
 * @param {Array<string>} customBlacklist - Custom blacklist array
 */
async function updateServerBlacklist(serverId, customBlacklist) {
  try {
    await db
      .update(serverConfigs)
      .set({ 
        customBlacklist,
        updatedAt: new Date() 
      })
      .where(eq(serverConfigs.serverId, serverId));

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error updating server blacklist:', error);
    throw error;
  }
}

/**
 * Toggle blacklist filter
 * @param {string} serverId - Discord server ID
 * @param {boolean} enabled - Enable/disable blacklist
 */
async function toggleBlacklist(serverId, enabled) {
  try {
    await db
      .update(serverConfigs)
      .set({ 
        blacklistEnabled: enabled,
        updatedAt: new Date() 
      })
      .where(eq(serverConfigs.serverId, serverId));

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error toggling blacklist:', error);
    throw error;
  }
}

/**
 * Update server keywords
 * @param {string} serverId - Discord server ID
 * @param {Object} keywords - Keywords object
 */
async function updateServerKeywords(serverId, keywords) {
  try {
    await db
      .update(serverConfigs)
      .set({ 
        keywords,
        updatedAt: new Date() 
      })
      .where(eq(serverConfigs.serverId, serverId));

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error updating server keywords:', error);
    throw error;
  }
}

/**
 * Generic update function for any config fields
 * @param {string} serverId - Discord server ID
 * @param {Object} updates - Fields to update
 */
async function updateServerConfig(serverId, updates) {
  try {
    await db
      .update(serverConfigs)
      .set({ 
        ...updates,
        updatedAt: new Date() 
      })
      .where(eq(serverConfigs.serverId, serverId));

    return await getServerConfig(serverId);
  } catch (error) {
    console.error('Error updating server config:', error);
    throw error;
  }
}

module.exports = {
  getServerConfig,
  setServerMode,
  setServerPrefix,
  addAllowedChannel,
  removeAllowedChannel,
  clearAllowedChannels,
  updateServerBlacklist,
  toggleBlacklist,
  updateServerKeywords,
  updateServerConfig,
};
