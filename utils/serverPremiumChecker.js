const { db } = require('../database/db');
const { serverConfigs } = require('../database/schema');
const { eq } = require('drizzle-orm');
const { EmbedBuilder } = require('discord.js');

/**
 * List of premium features
 */
const PREMIUM_FEATURES = {
  TRAIN_LENA: 'train_lena',
  CUSTOM_COMMANDS: 'custom_commands',
  AUTO_BAN: 'auto_ban',
  AUTO_DELETE: 'auto_delete',
  SCHEDULED_MESSAGES: 'scheduled_messages',
  CUSTOM_BOTS: 'custom_bots',
  ADVANCED_LOGGING: 'advanced_logging',
  CONFESSION_LOGGING: 'confession_logging'
};

/**
 * Check if a server has active premium access
 * @param {string} serverId - Discord server ID
 * @returns {Promise<{isPremium: boolean, planId: string|null, expiresAt: Date|null, ownerId: string|null}>}
 */
async function checkServerPremium(serverId) {
  try {
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
      return { isPremium: false, planId: serverConfig.premiumPlanId, expiresAt: null, ownerId: serverConfig.premiumOwnerId };
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

        return { isPremium: false, planId: serverConfig.premiumPlanId, expiresAt: expiryDate, ownerId: serverConfig.premiumOwnerId };
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
 * @param {string} serverId - Discord server ID
 * @param {string} feature - Feature name from PREMIUM_FEATURES
 * @returns {Promise<boolean>}
 */
async function hasServerPremiumFeature(serverId, feature) {
  const { isPremium } = await checkServerPremium(serverId);
  return isPremium;
}

/**
 * Show premium required message for server
 * @param {Interaction} interaction - Discord interaction
 * @param {string} featureName - Name of the feature
 */
async function showServerPremiumRequired(interaction, featureName = 'This feature') {
  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 Premium Feature')
    .setDescription(`${featureName} is a **Premium-only feature** for this server!`)
    .addFields(
      {
        name: '✨ Premium Benefits',
        value: '• Train Lena with custom data\n• Custom Commands\n• Auto Ban rules\n• Auto Delete system\n• Scheduled Messages\n• Advanced logging',
        inline: false
      },
      {
        name: '🚀 Upgrade This Server',
        value: 'Contact us to activate Premium for your server!',
        inline: false
      }
    )
    .setFooter({ text: 'Only server administrators can upgrade to Premium' })
    .setTimestamp();

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

/**
 * Require premium for slash command execution
 * @param {Interaction} interaction - Discord interaction
 * @param {string} featureName - Feature name
 * @returns {Promise<boolean>} - Returns true if premium is active, false otherwise
 */
async function requireServerPremium(interaction, featureName) {
  const serverId = interaction.guildId;
  
  if (!serverId) {
    await interaction.reply({ 
      content: '❌ This command can only be used in a server!', 
      ephemeral: true 
    });
    return false;
  }

  const { isPremium } = await checkServerPremium(serverId);

  if (!isPremium) {
    await showServerPremiumRequired(interaction, featureName);
    return false;
  }

  return true;
}

/**
 * Enable premium for a server
 * @param {string} serverId - Discord server ID
 * @param {string} planId - Premium plan ID
 * @param {number} durationDays - Duration in days (0 for unlimited)
 * @param {string} ownerId - User ID who purchased premium
 * @returns {Promise<boolean>}
 */
async function enableServerPremium(serverId, planId, durationDays = 30, ownerId) {
  try {
    const expiryDate = durationDays > 0 
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null; // null = unlimited

    // Check if server config exists
    const existing = await db.select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, serverId))
      .limit(1);

    if (existing.length === 0) {
      // Create new config
      await db.insert(serverConfigs).values({
        serverId,
        isPremium: true,
        premiumPlanId: planId,
        premiumExpiry: expiryDate,
        premiumOwnerId: ownerId
      });
    } else {
      // Update existing config
      await db.update(serverConfigs)
        .set({
          isPremium: true,
          premiumPlanId: planId,
          premiumExpiry: expiryDate,
          premiumOwnerId: ownerId,
          updatedAt: new Date()
        })
        .where(eq(serverConfigs.serverId, serverId));
    }

    console.log(`[Server Premium] Enabled premium for server ${serverId} until ${expiryDate ? expiryDate.toISOString() : 'unlimited'}`);
    return true;
  } catch (error) {
    console.error('Error enabling server premium:', error);
    return false;
  }
}

/**
 * Disable premium for a server
 * @param {string} serverId - Discord server ID
 * @returns {Promise<boolean>}
 */
async function disableServerPremium(serverId) {
  try {
    await db.update(serverConfigs)
      .set({
        isPremium: false,
        updatedAt: new Date()
      })
      .where(eq(serverConfigs.serverId, serverId));

    console.log(`[Server Premium] Disabled premium for server ${serverId}`);
    return true;
  } catch (error) {
    console.error('Error disabling server premium:', error);
    return false;
  }
}

module.exports = {
  checkServerPremium,
  hasServerPremiumFeature,
  showServerPremiumRequired,
  requireServerPremium,
  enableServerPremium,
  disableServerPremium,
  PREMIUM_FEATURES
};
