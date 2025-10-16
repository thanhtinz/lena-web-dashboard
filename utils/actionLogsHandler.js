const { EmbedBuilder } = require('discord.js');
const { eq } = require('drizzle-orm');

async function logAction(guild, db, type, data) {
  const { actionLogsConfig } = require('../database/schema');

  const config = await db.select()
    .from(actionLogsConfig)
    .where(eq(actionLogsConfig.serverId, guild.id))
    .limit(1);

  if (config.length === 0) return;

  const cfg = config[0];
  
  // Check if this log type is enabled
  const enabledMap = {
    'messageDelete': cfg.enableMessageDelete,
    'messageEdit': cfg.enableMessageEdit,
    'imageDelete': cfg.enableImageDelete,
    'bulkDelete': cfg.enableBulkDelete,
    'inviteLog': cfg.enableInviteLog,
    'moderatorCommand': cfg.enableModeratorCommands,
    'memberJoin': cfg.enableMemberJoin,
    'memberLeave': cfg.enableMemberLeave,
    'memberRoleAdd': cfg.enableMemberRoleAdd,
    'memberRoleRemove': cfg.enableMemberRoleRemove,
    'memberTimeout': cfg.enableMemberTimeout,
    'nicknameChange': cfg.enableNicknameChange,
    'memberBan': cfg.enableMemberBan,
    'memberUnban': cfg.enableMemberUnban,
    'memberKick': cfg.enableMemberKick,
    'memberUpdate': cfg.enableMemberUpdate,
    'roleCreate': cfg.enableRoleCreate,
    'roleDelete': cfg.enableRoleDelete,
    'roleUpdate': cfg.enableRoleUpdate,
    'channelCreate': cfg.enableChannelCreate,
    'channelUpdate': cfg.enableChannelUpdate,
    'channelDelete': cfg.enableChannelDelete,
    'emojiCreate': cfg.enableEmojiCreate,
    'emojiUpdate': cfg.enableEmojiUpdate,
    'emojiDelete': cfg.enableEmojiDelete,
    'voiceJoin': cfg.enableVoiceJoin,
    'voiceLeave': cfg.enableVoiceLeave,
    'voiceMove': cfg.enableVoiceMove,
    'serverUpdate': cfg.enableServerUpdate
  };

  if (!enabledMap[type]) return;
  if (!cfg.logChannelId) return;

  // Check ignored channels
  const ignoredChannels = cfg.ignoredChannels || [];
  if (data.channelId && ignoredChannels.includes(data.channelId)) return;

  // Check ignored roles (for message delete events)
  const ignoredRoles = cfg.ignoredRoles || [];
  if (data.memberRoles && ignoredRoles.some(roleId => data.memberRoles.includes(roleId))) return;

  const logChannel = await guild.channels.fetch(cfg.logChannelId).catch(() => null);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTimestamp();

  switch (type) {
    case 'messageDelete':
      embed.setTitle('🗑️ Message Deleted')
        .setDescription(`**Author:** ${data.author}\n**Channel:** ${data.channel}\n**Content:** ${data.content || '*[No content]*'}`)
        .setColor(0xED4245);
      break;
    
    case 'messageEdit':
      embed.setTitle('✏️ Message Edited')
        .setDescription(`**Author:** ${data.author}\n**Channel:** ${data.channel}\n**Before:** ${data.before || '*[No content]*'}\n**After:** ${data.after || '*[No content]*'}`)
        .setColor(0xFEE75C);
      break;

    case 'imageDelete':
      embed.setTitle('🖼️ Image Deleted')
        .setDescription(`**Author:** ${data.author}\n**Channel:** ${data.channel}\n**Attachments:** ${data.attachmentCount || 0}`)
        .setColor(0x9B59B6);
      if (data.imageUrl) {
        embed.setImage(data.imageUrl);
      }
      break;

    case 'bulkDelete':
      embed.setTitle('🗑️ Bulk Messages Deleted')
        .setDescription(`**Channel:** ${data.channel}\n**Message Count:** ${data.count}\n**Moderator:** ${data.moderator || 'Unknown'}`)
        .setColor(0xE91E63);
      break;

    case 'inviteLog':
      embed.setTitle('📨 Invite Activity')
        .setDescription(`**Type:** ${data.type}\n**Code:** ${data.code}\n**Created By:** ${data.creator || 'Unknown'}`)
        .setColor(0x3498DB);
      break;

    case 'moderatorCommand':
      embed.setTitle('🔨 Moderator Command')
        .setDescription(`**Moderator:** ${data.moderator}\n**Command:** ${data.command}\n**Target:** ${data.target || 'N/A'}`)
        .setColor(0xE67E22);
      break;
    
    case 'memberJoin':
      embed.setTitle('➕ Member Joined')
        .setColor(0x57F287);
      
      let joinDesc = `**User:** ${data.user}`;
      
      if (cfg.showAccountAge && data.accountAge) {
        joinDesc += `\n**Account Age:** ${data.accountAge} days`;
      }
      
      if (data.created) {
        joinDesc += `\n**Account Created:** ${data.created}`;
      }
      
      embed.setDescription(joinDesc);
      
      if (cfg.showAvatar && data.avatar) {
        embed.setThumbnail(data.avatar);
      }
      break;
    
    case 'memberLeave':
      embed.setTitle('➖ Member Left')
        .setColor(0xED4245);
      
      let leaveDesc = `**User:** ${data.user}`;
      
      if (data.roles) {
        leaveDesc += `\n**Roles:** ${data.roles}`;
      }
      
      embed.setDescription(leaveDesc);
      
      if (cfg.showAvatar && data.avatar) {
        embed.setThumbnail(data.avatar);
      }
      break;

    case 'memberRoleAdd':
      embed.setTitle('➕ Role Added')
        .setDescription(`**User:** ${data.user}\n**Role:** ${data.role}\n**Added By:** ${data.moderator || 'Unknown'}`)
        .setColor(0x57F287);
      break;

    case 'memberRoleRemove':
      embed.setTitle('➖ Role Removed')
        .setDescription(`**User:** ${data.user}\n**Role:** ${data.role}\n**Removed By:** ${data.moderator || 'Unknown'}`)
        .setColor(0xE67E22);
      break;

    case 'memberTimeout':
      embed.setTitle('⏰ Member Timeout')
        .setDescription(`**User:** ${data.user}\n**Duration:** ${data.duration}\n**Reason:** ${data.reason || 'No reason provided'}\n**Moderator:** ${data.moderator || 'Unknown'}`)
        .setColor(0xF39C12);
      break;

    case 'nicknameChange':
      embed.setTitle('✏️ Nickname Changed')
        .setDescription(`**User:** ${data.user}\n**Before:** ${data.before || '*None*'}\n**After:** ${data.after || '*None*'}`)
        .setColor(0x9B59B6);
      break;
    
    case 'memberBan':
      embed.setTitle('🔨 Member Banned')
        .setDescription(`**User:** ${data.user}\n**Reason:** ${data.reason || 'No reason provided'}\n**Moderator:** ${data.moderator || 'Unknown'}`)
        .setColor(0xED4245);
      break;

    case 'memberUnban':
      embed.setTitle('🔓 Member Unbanned')
        .setDescription(`**User:** ${data.user}\n**Moderator:** ${data.moderator || 'Unknown'}`)
        .setColor(0x57F287);
      break;

    case 'memberKick':
      embed.setTitle('👢 Member Kicked')
        .setDescription(`**User:** ${data.user}\n**Reason:** ${data.reason || 'No reason provided'}\n**Moderator:** ${data.moderator || 'Unknown'}`)
        .setColor(0xFEE75C);
      break;

    case 'memberUpdate':
      embed.setTitle('👤 Member Updated')
        .setDescription(`**User:** ${data.user}\n**Changes:** ${data.changes || 'Unknown'}`)
        .setColor(0x3498DB);
      break;

    case 'roleCreate':
      embed.setTitle('➕ Role Created')
        .setDescription(`**Role:** ${data.role}\n**Created By:** ${data.moderator || 'Unknown'}`)
        .setColor(0x57F287);
      break;

    case 'roleDelete':
      embed.setTitle('🗑️ Role Deleted')
        .setDescription(`**Role:** ${data.role}\n**Deleted By:** ${data.moderator || 'Unknown'}`)
        .setColor(0xED4245);
      break;

    case 'roleUpdate':
      embed.setTitle('✏️ Role Updated')
        .setDescription(`**Role:** ${data.role}\n**Changes:** ${data.changes || 'Unknown'}`)
        .setColor(0xFEE75C);
      break;

    case 'channelCreate':
      embed.setTitle('➕ Channel Created')
        .setDescription(`**Channel:** ${data.channel}\n**Type:** ${data.channelType || 'Unknown'}\n**Created By:** ${data.moderator || 'Unknown'}`)
        .setColor(0x57F287);
      break;

    case 'channelUpdate':
      embed.setTitle('✏️ Channel Updated')
        .setDescription(`**Channel:** ${data.channel}\n**Changes:** ${data.changes || 'Unknown'}`)
        .setColor(0xFEE75C);
      break;

    case 'channelDelete':
      embed.setTitle('🗑️ Channel Deleted')
        .setDescription(`**Channel:** ${data.channel}\n**Type:** ${data.channelType || 'Unknown'}\n**Deleted By:** ${data.moderator || 'Unknown'}`)
        .setColor(0xED4245);
      break;

    case 'emojiCreate':
      embed.setTitle('➕ Emoji Created')
        .setDescription(`**Emoji:** ${data.emoji}\n**Name:** ${data.name}\n**Created By:** ${data.moderator || 'Unknown'}`)
        .setColor(0x57F287);
      break;

    case 'emojiUpdate':
      embed.setTitle('✏️ Emoji Name Changed')
        .setDescription(`**Emoji:** ${data.emoji}\n**Before:** ${data.before}\n**After:** ${data.after}`)
        .setColor(0xFEE75C);
      break;

    case 'emojiDelete':
      embed.setTitle('🗑️ Emoji Deleted')
        .setDescription(`**Emoji:** ${data.emoji}\n**Name:** ${data.name}`)
        .setColor(0xED4245);
      break;

    case 'voiceJoin':
      embed.setTitle('🎤 Voice Channel Join')
        .setDescription(`**User:** ${data.user}\n**Channel:** ${data.channel}`)
        .setColor(0x57F287);
      break;

    case 'voiceLeave':
      embed.setTitle('🔇 Voice Channel Leave')
        .setDescription(`**User:** ${data.user}\n**Channel:** ${data.channel}`)
        .setColor(0xED4245);
      break;

    case 'voiceMove':
      embed.setTitle('🔄 Voice Channel Move')
        .setDescription(`**User:** ${data.user}\n**From:** ${data.from}\n**To:** ${data.to}`)
        .setColor(0xFEE75C);
      break;

    case 'serverUpdate':
      embed.setTitle('🏰 Server Updated')
        .setDescription(`**Changes:** ${data.changes || 'Unknown'}`)
        .setColor(0x3498DB);
      break;

    default:
      return;
  }

  try {
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send log:', error);
  }
}

module.exports = {
  logAction
};
