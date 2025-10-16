const { eq } = require('drizzle-orm');

async function handleAutoDelete(message, db) {
  if (message.author.bot) return;
  if (!message.guild) return;

  const { autoDeleteConfig } = require('../database/schema');

  const config = await db.select()
    .from(autoDeleteConfig)
    .where(eq(autoDeleteConfig.serverId, message.guild.id))
    .limit(1);

  if (config.length === 0 || !config[0].enabled) return;

  const cfg = config[0];

  // Check if channel is in list (if list exists)
  if (cfg.channelIds && cfg.channelIds.length > 0) {
    if (!cfg.channelIds.includes(message.channel.id)) return;
  }

  // Check whitelist
  if (cfg.whitelistUserIds && cfg.whitelistUserIds.includes(message.author.id)) return;
  if (cfg.whitelistRoleIds && message.member.roles.cache.some(role => cfg.whitelistRoleIds.includes(role.id))) return;

  // Check if should delete based on message type
  const isCommand = message.content.startsWith('!') || message.content.startsWith('/');
  
  if (isCommand && !cfg.deleteCommands) return;
  if (message.author.bot && !cfg.deleteBotReplies) return;

  // Schedule deletion
  const deleteAfter = cfg.deleteAfterSeconds * 1000;
  
  setTimeout(async () => {
    try {
      await message.delete();
    } catch (error) {
      // Message might already be deleted
    }
  }, deleteAfter);
}

module.exports = {
  handleAutoDelete
};
