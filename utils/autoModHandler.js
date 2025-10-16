const { EmbedBuilder } = require('discord.js');

// Spam tracking
const userMessages = new Map();
const userViolations = new Map();

async function checkAutoMod(message, db) {
  if (message.author.bot) return false;
  if (!message.guild) return false;

  const { autoModConfig } = require('../database/schema');
  const { eq } = require('drizzle-orm');

  const config = await db.select()
    .from(autoModConfig)
    .where(eq(autoModConfig.serverId, message.guild.id))
    .limit(1);

  if (config.length === 0 || !config[0].enabled) return false;

  const cfg = config[0];

  // Check ignored channels/roles
  if (cfg.ignoredChannels && cfg.ignoredChannels.includes(message.channel.id)) return false;
  if (cfg.ignoredRoles && message.member.roles.cache.some(role => cfg.ignoredRoles.includes(role.id))) return false;

  let violated = false;
  let reason = '';

  // Anti-Spam check
  if (cfg.antiSpam) {
    const userId = message.author.id;
    const now = Date.now();
    
    if (!userMessages.has(userId)) {
      userMessages.set(userId, []);
    }

    const messages = userMessages.get(userId);
    messages.push(now);

    // Remove old messages outside time window
    const timeWindow = cfg.spamTimeWindow * 1000;
    const recent = messages.filter(timestamp => now - timestamp < timeWindow);
    userMessages.set(userId, recent);

    if (recent.length >= cfg.spamThreshold) {
      violated = true;
      reason = 'Spam';
    }
  }

  // Anti-Links check
  if (cfg.antiLinks && !violated) {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    if (linkRegex.test(message.content)) {
      const whitelisted = cfg.whitelistedDomains || [];
      const hasWhitelisted = whitelisted.some(domain => message.content.includes(domain));
      
      if (!hasWhitelisted) {
        violated = true;
        reason = 'Unauthorized link';
      }
    }
  }

  // Anti-Invites check
  if (cfg.antiInvites && !violated) {
    const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/g;
    if (inviteRegex.test(message.content)) {
      violated = true;
      reason = 'Discord invite link';
    }
  }

  // Anti-Caps check
  if (cfg.antiCaps && !violated) {
    const text = message.content.replace(/[^a-zA-Z]/g, '');
    if (text.length > 5) {
      const capsCount = (text.match(/[A-Z]/g) || []).length;
      const capsPercent = (capsCount / text.length) * 100;
      
      if (capsPercent >= cfg.capsPercentage) {
        violated = true;
        reason = 'Excessive caps';
      }
    }
  }

  // Anti-Mention Spam check
  if (cfg.antiMentionSpam && !violated) {
    const mentions = message.mentions.users.size + message.mentions.roles.size;
    if (mentions >= cfg.mentionThreshold) {
      violated = true;
      reason = 'Mention spam';
    }
  }

  // Banned words check
  if (cfg.bannedWords && cfg.bannedWords.length > 0 && !violated) {
    const content = message.content.toLowerCase();
    const hasBannedWord = cfg.bannedWords.some(word => content.includes(word.toLowerCase()));
    
    if (hasBannedWord) {
      violated = true;
      reason = 'Banned word';
    }
  }

  if (violated) {
    await handleViolation(message, cfg, reason, db);
    return true;
  }

  return false;
}

async function handleViolation(message, config, reason, db) {
  try {
    // Always delete the message
    await message.delete().catch(() => {});

    const actionType = config.actionType || 'warn';
    const userId = message.author.id;

    // Track violations
    const violations = userViolations.get(userId) || 0;
    userViolations.set(userId, violations + 1);

    // Send warning to user
    const warningEmbed = new EmbedBuilder()
      .setTitle('⚠️ Auto Moderation')
      .setDescription(`Your message was removed: **${reason}**`)
      .setColor(0xED4245)
      .setTimestamp();

    await message.channel.send({ 
      content: `${message.author}`, 
      embeds: [warningEmbed] 
    }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    // Take action based on config
    if (actionType === 'kick' && violations >= 3) {
      await message.member.kick(`Auto mod: ${reason} (${violations} violations)`);
    } else if (actionType === 'ban' && violations >= 5) {
      await message.member.ban({ reason: `Auto mod: ${reason} (${violations} violations)` });
    } else if (actionType === 'mute' && violations >= 2) {
      await message.member.timeout(10 * 60 * 1000, `Auto mod: ${reason}`);
    }
  } catch (error) {
    console.error('Error handling auto mod violation:', error);
  }
}

// Cleanup old data
setInterval(() => {
  const now = Date.now();
  
  for (const [userId, messages] of userMessages.entries()) {
    const recent = messages.filter(timestamp => now - timestamp < 60000);
    if (recent.length === 0) {
      userMessages.delete(userId);
    } else {
      userMessages.set(userId, recent);
    }
  }
}, 60000);

module.exports = {
  checkAutoMod
};
