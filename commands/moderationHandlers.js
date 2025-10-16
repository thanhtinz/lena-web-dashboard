const { db } = require('../database/db');
const { moderationConfigs, warnings } = require('../database/schema');
const { eq, and } = require('drizzle-orm');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logger, LogLevel, LogCategory } = require('../utils/logger');
const { t, getLang } = require('../i18n');
const { getServerConfig } = require('../database/configService');

async function getModerationConfig(serverId) {
  const config = await db.select()
    .from(moderationConfigs)
    .where(eq(moderationConfigs.serverId, serverId))
    .limit(1);
  
  return config[0] || {
    enabled: true,
    dmOnKick: true,
    dmOnBan: true,
    dmOnMute: true,
    useDiscordTimeout: true,
    deleteModCommands: false,
    respondWithReason: true,
    preserveMessagesOnBan: true,
    logChannelId: null,
    logOptions: { 
      logBans: true, 
      logUnbans: true,
      logKicks: true, 
      logMutes: true, 
      logUnmutes: true, 
      logWarns: true,
      logPurges: true,
      logLockdowns: true,
      logLocks: true,
      logUnlocks: true,
      logSlowmode: true
    },
    moderatorRoles: [],
    protectedRoles: [],
    lockdownChannels: [],
    customMessages: {
      banMessage: 'You have been banned from {server} for: {reason}',
      unbanMessage: 'You have been unbanned from {server}',
      kickMessage: 'You have been kicked from {server} for: {reason}',
      muteMessage: 'You have been muted in {server} for: {reason}. Duration: {duration}',
      unmuteMessage: 'You have been unmuted in {server}',
      warnMessage: 'You have been warned in {server} for: {reason}'
    },
    commandsEnabled: {
      ban: true,
      unban: true,
      kick: true,
      mute: true,
      unmute: true,
      warn: true,
      unwarn: true,
      lock: true,
      unlock: true,
      slowmode: true,
      purge: true,
      nuke: true
    }
  };
}

async function checkModerationPermissions(member, config, requiredPermission) {
  if (member.permissions.has(requiredPermission) || member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  
  if (config.moderatorRoles && config.moderatorRoles.length > 0) {
    return member.roles.cache.some(role => config.moderatorRoles.includes(role.id));
  }
  
  return false;
}

function isProtected(member, config) {
  if (!config.protectedRoles || config.protectedRoles.length === 0) {
    return false;
  }
  return member.roles.cache.some(role => config.protectedRoles.includes(role.id));
}

function replaceMessageVariables(message, serverName, reason = '', duration = '') {
  return message
    .replace(/{server}/g, serverName)
    .replace(/{reason}/g, reason)
    .replace(/{duration}/g, duration);
}

function hasBanPermission(member) {
  return member && (
    member.permissions.has(PermissionFlagsBits.BanMembers) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  );
}

function hasKickPermission(member) {
  return member && (
    member.permissions.has(PermissionFlagsBits.KickMembers) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  );
}

function hasMutePermission(member) {
  return member && (
    member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  );
}

function hasManageRolesPermission(member) {
  return member && (
    member.permissions.has(PermissionFlagsBits.ManageRoles) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  );
}

async function logModerationAction(guild, action, moderator, target, reason, duration = null, config = null) {
  try {
    if (!config) {
      config = await getModerationConfig(guild.id);
    }

    const actionTypeMap = {
      'BAN': 'logBans',
      'UNBAN': 'logUnbans',
      'KICK': 'logKicks',
      'MUTE': 'logMutes',
      'UNMUTE': 'logUnmutes',
      'WARNING': 'logWarns',
      'UNWARNING': 'logWarns',
      'LOCK': 'logLocks',
      'UNLOCK': 'logUnlocks',
      'SLOWMODE': 'logSlowmode',
      'PURGE': 'logPurges',
      'NUKE': 'logPurges'
    };

    const logKey = actionTypeMap[action];
    let shouldLog = false;
    
    if (config.logOptions) {
      shouldLog = config.logOptions[logKey];
      
      // Fallback to logLockdowns for backward compatibility if new keys are missing
      if (shouldLog === undefined && ['logLocks', 'logUnlocks', 'logSlowmode'].includes(logKey)) {
        shouldLog = config.logOptions.logLockdowns ?? true;
      }
      
      // Fallback to logPurges for backward compatibility if missing
      if (shouldLog === undefined && logKey === 'logPurges') {
        shouldLog = config.logOptions.logPurges ?? true;
      }
    }

    if (shouldLog && config.logChannelId && config.enabled) {
      const logChannel = await guild.channels.fetch(config.logChannelId).catch(() => null);
      
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle(`🛡️ ${action}`)
          .addFields(
            { name: '👤 Target', value: `${target.user?.tag || target.id} (${target.id})`, inline: true },
            { name: '👮 Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
            { name: '📝 Reason', value: reason || 'Không có lý do', inline: false }
          )
          .setColor(getColorForAction(action))
          .setTimestamp();

        if (duration) {
          embed.addFields({ name: '⏱️ Duration', value: duration, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
      }
    }

    await logger.log(
      LogLevel.INFO,
      LogCategory.MODERATION,
      action,
      guild,
      `Target: ${target.user?.tag || target.id}\nModerator: ${moderator.tag}\nReason: ${reason || 'No reason'}`
    );

  } catch (error) {
    console.error('Error logging moderation action:', error);
  }
}

function getColorForAction(action) {
  const colors = {
    'BAN': 0xFF0000,
    'UNBAN': 0x00FF00,
    'KICK': 0xFF9900,
    'MUTE': 0xFFFF00,
    'UNMUTE': 0x00FFFF,
    'WARNING': 0xFFA500,
    'UNWARNING': 0x90EE90,
    'LOCK': 0xFF6B6B,
    'UNLOCK': 0x4ECDC4,
    'SLOWMODE': 0xFFA07A
  };
  return colors[action] || 0x808080;
}

async function handleBan(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);
    const serverConfig = await getServerConfig(interaction.guild.id);
    const lang = getLang(serverConfig);
    
    // Helper for moderation messages
    const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);

    if (!config.enabled) {
      return await interaction.reply({ 
        content: msg('errors.disabled'), 
        ephemeral: true 
      });
    }

    const hasPermission = await checkModerationPermissions(
      interaction.member, 
      config, 
      PermissionFlagsBits.BanMembers
    );

    if (!hasPermission) {
      return await interaction.reply({ 
        content: msg('errors.noPermBan'), 
        ephemeral: true 
      });
    }

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || msg('labels.noReason');
    const deleteMessages = interaction.options.getInteger('delete_messages') || 0;

    if (!target) {
      return await interaction.reply({ 
        content: msg('errors.userNotFound'), 
        ephemeral: true 
      });
    }

    if (target.id === interaction.user.id) {
      return await interaction.reply({ 
        content: msg('errors.cannotSelf'), 
        ephemeral: true 
      });
    }

    if (isProtected(target, config)) {
      return await interaction.reply({ 
        content: msg('errors.protected'), 
        ephemeral: true 
      });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return await interaction.reply({ 
        content: msg('errors.higherRole'), 
        ephemeral: true 
      });
    }

    if (config.dmOnBan) {
      try {
        const dmMessage = msg('dm.banned', {
          server: interaction.guild.name,
          reason: reason
        });
        await target.send(dmMessage).catch(() => {});
      } catch (error) {
        console.log('Could not DM user');
      }
    }

    const deleteMessageSeconds = config.preserveMessagesOnBan ? 0 : (deleteMessages || 7) * 86400;

    await target.ban({ 
      deleteMessageSeconds: deleteMessageSeconds,
      reason: `${reason} - By ${interaction.user.tag}` 
    });

    await logModerationAction(
      interaction.guild,
      'BAN',
      interaction.user,
      target,
      reason,
      null,
      config,
      lang
    );

    let responseContent = msg('success.banned', { user: target.user.tag });
    if (config.respondWithReason) {
      responseContent += `\n**${msg('labels.reason')}:** ${reason}`;
    }

    await interaction.reply({ 
      content: responseContent,
      ephemeral: !config.respondWithReason 
    });

    if (config.deleteModCommands) {
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);
    }

  } catch (error) {
    console.error('Error handling ban:', error);
    
    // Fallback error message if translation fails
    const fallbackMsg = '❌ Có lỗi xảy ra khi ban user! / An error occurred while banning user!';
    
    try {
      const serverConfig = await getServerConfig(interaction.guild.id);
      const lang = getLang(serverConfig);
      const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
      
      await interaction.reply({ 
        content: msg('errors.botError'), 
        ephemeral: true 
      });
    } catch (fallbackError) {
      await interaction.reply({ 
        content: fallbackMsg, 
        ephemeral: true 
      });
    }
  }
}

async function handleUnban(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);

    if (!config.enabled) {
      return await interaction.reply({ 
        content: '❌ Moderation module is currently disabled! Enable it in the web dashboard.', 
        ephemeral: true 
      });
    }

    const hasPermission = await checkModerationPermissions(
      interaction.member, 
      config, 
      PermissionFlagsBits.BanMembers
    );

    if (!hasPermission) {
      return await interaction.reply({ 
        content: '❌ Bạn không có quyền unban members!', 
        ephemeral: true 
      });
    }

    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'Không có lý do';

    try {
      await interaction.guild.members.unban(userId, `${reason} - By ${interaction.user.tag}`);

      await logModerationAction(
        interaction.guild,
        'UNBAN',
        interaction.user,
        { user: { tag: userId }, id: userId },
        reason,
        null,
        config
      );

      let responseContent = `✅ User ID **${userId}** đã được unban!`;
      if (config.respondWithReason) {
        responseContent += `\n**Lý do:** ${reason}`;
      }

      await interaction.reply({ 
        content: responseContent,
        ephemeral: !config.respondWithReason 
      });

      if (config.deleteModCommands) {
        setTimeout(() => {
          interaction.deleteReply().catch(() => {});
        }, 5000);
      }

    } catch (error) {
      if (error.code === 10026) {
        return await interaction.reply({ 
          content: '❌ User này không bị ban!', 
          ephemeral: true 
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error handling unban:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi unban user!', 
      ephemeral: true 
    });
  }
}

async function handleKick(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);

    if (!config.enabled) {
      return await interaction.reply({ 
        content: '❌ Moderation module is currently disabled! Enable it in the web dashboard.', 
        ephemeral: true 
      });
    }

    const hasPermission = await checkModerationPermissions(
      interaction.member, 
      config, 
      PermissionFlagsBits.KickMembers
    );

    if (!hasPermission) {
      return await interaction.reply({ 
        content: '❌ Bạn không có quyền kick members!', 
        ephemeral: true 
      });
    }

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do';

    if (!target) {
      return await interaction.reply({ 
        content: '❌ Không tìm thấy user trong server!', 
        ephemeral: true 
      });
    }

    if (target.id === interaction.user.id) {
      return await interaction.reply({ 
        content: '❌ Bạn không thể tự kick chính mình!', 
        ephemeral: true 
      });
    }

    if (isProtected(target, config)) {
      return await interaction.reply({ 
        content: '❌ User này có role được bảo vệ, không thể kick!', 
        ephemeral: true 
      });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return await interaction.reply({ 
        content: '❌ Bạn không thể kick người có role cao hơn hoặc bằng bạn!', 
        ephemeral: true 
      });
    }

    if (config.dmOnKick) {
      try {
        const dmMessage = replaceMessageVariables(
          config.customMessages.kickMessage,
          interaction.guild.name,
          reason
        );
        await target.send(dmMessage).catch(() => {});
      } catch (error) {
        console.log('Could not DM user');
      }
    }

    await target.kick(`${reason} - By ${interaction.user.tag}`);

    await logModerationAction(
      interaction.guild,
      'KICK',
      interaction.user,
      target,
      reason,
      null,
      config
    );

    let responseContent = `✅ **${target.user.tag}** đã bị kick!`;
    if (config.respondWithReason) {
      responseContent += `\n**Lý do:** ${reason}`;
    }

    await interaction.reply({ 
      content: responseContent,
      ephemeral: !config.respondWithReason 
    });

    if (config.deleteModCommands) {
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);
    }

  } catch (error) {
    console.error('Error handling kick:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi kick user!', 
      ephemeral: true 
    });
  }
}

async function handleMute(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);

    if (!config.enabled) {
      return await interaction.reply({ 
        content: '❌ Moderation module is currently disabled! Enable it in the web dashboard.', 
        ephemeral: true 
      });
    }

    const hasPermission = await checkModerationPermissions(
      interaction.member, 
      config, 
      PermissionFlagsBits.ModerateMembers
    );

    if (!hasPermission) {
      return await interaction.reply({ 
        content: '❌ Bạn không có quyền mute members!', 
        ephemeral: true 
      });
    }

    const target = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'Không có lý do';

    if (!target) {
      return await interaction.reply({ 
        content: '❌ Không tìm thấy user trong server!', 
        ephemeral: true 
      });
    }

    if (target.id === interaction.user.id) {
      return await interaction.reply({ 
        content: '❌ Bạn không thể tự mute chính mình!', 
        ephemeral: true 
      });
    }

    if (isProtected(target, config)) {
      return await interaction.reply({ 
        content: '❌ User này có role được bảo vệ, không thể mute!', 
        ephemeral: true 
      });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return await interaction.reply({ 
        content: '❌ Bạn không thể mute người có role cao hơn hoặc bằng bạn!', 
        ephemeral: true 
      });
    }

    const durationMs = duration * 60 * 1000;
    const durationText = duration >= 60 
      ? `${Math.floor(duration / 60)} giờ ${duration % 60} phút`
      : `${duration} phút`;

    if (config.useDiscordTimeout) {
      await target.timeout(durationMs, `${reason} - By ${interaction.user.tag}`);
    } else {
      if (!config.muteRoleId) {
        return await interaction.reply({ 
          content: '❌ Mute role chưa được cấu hình! Vui lòng sử dụng Discord timeout hoặc cấu hình mute role.', 
          ephemeral: true 
        });
      }

      const muteRole = await interaction.guild.roles.fetch(config.muteRoleId).catch(() => null);
      if (!muteRole) {
        return await interaction.reply({ 
          content: '❌ Không tìm thấy mute role! Vui lòng cấu hình lại.', 
          ephemeral: true 
        });
      }

      await target.roles.add(muteRole, `${reason} - By ${interaction.user.tag}`);

      setTimeout(async () => {
        try {
          const member = await interaction.guild.members.fetch(target.id);
          if (member.roles.cache.has(config.muteRoleId)) {
            await member.roles.remove(muteRole, 'Mute duration expired');
          }
        } catch (error) {
          console.error('Error removing mute role:', error);
        }
      }, durationMs);
    }

    if (config.dmOnMute) {
      try {
        const dmMessage = replaceMessageVariables(
          config.customMessages.muteMessage,
          interaction.guild.name,
          reason,
          durationText
        );
        await target.send(dmMessage).catch(() => {});
      } catch (error) {
        console.log('Could not DM user');
      }
    }

    await logModerationAction(
      interaction.guild,
      'MUTE',
      interaction.user,
      target,
      reason,
      durationText,
      config
    );

    let responseContent = `✅ **${target.user.tag}** đã bị mute trong ${durationText}!`;
    if (config.respondWithReason) {
      responseContent += `\n**Lý do:** ${reason}`;
    }

    await interaction.reply({ 
      content: responseContent,
      ephemeral: !config.respondWithReason 
    });

    if (config.deleteModCommands) {
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);
    }

  } catch (error) {
    console.error('Error handling mute:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi mute user!', 
      ephemeral: true 
    });
  }
}

async function handleUnmute(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);

    if (!config.enabled) {
      return await interaction.reply({ 
        content: '❌ Moderation module is currently disabled! Enable it in the web dashboard.', 
        ephemeral: true 
      });
    }

    const hasPermission = await checkModerationPermissions(
      interaction.member, 
      config, 
      PermissionFlagsBits.ModerateMembers
    );

    if (!hasPermission) {
      return await interaction.reply({ 
        content: '❌ Bạn không có quyền unmute members!', 
        ephemeral: true 
      });
    }

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do';

    if (!target) {
      return await interaction.reply({ 
        content: '❌ Không tìm thấy user trong server!', 
        ephemeral: true 
      });
    }

    if (config.useDiscordTimeout) {
      if (!target.isCommunicationDisabled()) {
        return await interaction.reply({ 
          content: '❌ User này không bị mute!', 
          ephemeral: true 
        });
      }
      await target.timeout(null, `${reason} - By ${interaction.user.tag}`);
    } else {
      if (!config.muteRoleId) {
        return await interaction.reply({ 
          content: '❌ Mute role chưa được cấu hình!', 
          ephemeral: true 
        });
      }

      const muteRole = await interaction.guild.roles.fetch(config.muteRoleId).catch(() => null);
      if (!muteRole || !target.roles.cache.has(config.muteRoleId)) {
        return await interaction.reply({ 
          content: '❌ User này không bị mute!', 
          ephemeral: true 
        });
      }

      await target.roles.remove(muteRole, `${reason} - By ${interaction.user.tag}`);
    }

    const dmMessage = replaceMessageVariables(
      config.customMessages.unmuteMessage,
      interaction.guild.name
    );

    try {
      await target.send(dmMessage).catch(() => {});
    } catch (error) {
      console.log('Could not DM user');
    }

    await logModerationAction(
      interaction.guild,
      'UNMUTE',
      interaction.user,
      target,
      reason,
      null,
      config
    );

    let responseContent = `✅ **${target.user.tag}** đã được unmute!`;
    if (config.respondWithReason) {
      responseContent += `\n**Lý do:** ${reason}`;
    }

    await interaction.reply({ 
      content: responseContent,
      ephemeral: !config.respondWithReason 
    });

    if (config.deleteModCommands) {
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);
    }

  } catch (error) {
    console.error('Error handling unmute:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi unmute user!', 
      ephemeral: true 
    });
  }
}

async function handleWarning(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);

    if (!config.enabled) {
      return await interaction.reply({ 
        content: '❌ Moderation module is currently disabled! Enable it in the web dashboard.', 
        ephemeral: true 
      });
    }

    const hasPermission = await checkModerationPermissions(
      interaction.member, 
      config, 
      PermissionFlagsBits.ModerateMembers
    );

    if (!hasPermission) {
      return await interaction.reply({ 
        content: '❌ Bạn không có quyền warn members!', 
        ephemeral: true 
      });
    }

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do';
    const serverId = interaction.guild.id;

    if (!target) {
      return await interaction.reply({ 
        content: '❌ Không tìm thấy user trong server!', 
        ephemeral: true 
      });
    }

    if (target.id === interaction.user.id) {
      return await interaction.reply({ 
        content: '❌ Bạn không thể tự warn chính mình!', 
        ephemeral: true 
      });
    }

    if (isProtected(target, config)) {
      return await interaction.reply({ 
        content: '❌ User này có role được bảo vệ, không thể warn!', 
        ephemeral: true 
      });
    }

    const result = await db.insert(warnings).values({
      serverId,
      userId: target.id,
      moderatorId: interaction.user.id,
      reason,
      status: 'active'
    }).returning();

    const warningId = result[0].id;

    const userWarnings = await db.select()
      .from(warnings)
      .where(and(
        eq(warnings.serverId, serverId),
        eq(warnings.userId, target.id),
        eq(warnings.status, 'active')
      ));

    try {
      await target.send(
        `⚠️ Bạn đã nhận warning #${warningId} trong **${interaction.guild.name}**\n` +
        `**Lý do:** ${reason}\n` +
        `**Tổng warnings:** ${userWarnings.length}/5`
      ).catch(() => {});
    } catch (error) {
      console.log('Could not DM user');
    }

    await logModerationAction(
      interaction.guild,
      'WARNING',
      interaction.user,
      target,
      reason,
      null,
      config
    );

    let responseContent = `✅ **${target.user.tag}** đã nhận warning #${warningId}!`;
    if (config.respondWithReason) {
      responseContent += `\n**Lý do:** ${reason}\n**Tổng warnings:** ${userWarnings.length}/5`;
    }

    await interaction.reply({ 
      content: responseContent,
      ephemeral: !config.respondWithReason 
    });

    if (config.deleteModCommands) {
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);
    }

  } catch (error) {
    console.error('Error handling warning:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi warn user!', 
      ephemeral: true 
    });
  }
}

async function handleUnwarning(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);

    const hasPermission = await checkModerationPermissions(
      interaction.member, 
      config, 
      PermissionFlagsBits.ModerateMembers
    );

    if (!hasPermission) {
      return await interaction.reply({ 
        content: '❌ Bạn không có quyền remove warnings!', 
        ephemeral: true 
      });
    }

    const warningId = interaction.options.getInteger('warning_id');
    const reason = interaction.options.getString('reason') || 'Không có lý do';
    const serverId = interaction.guild.id;

    const warning = await db.select()
      .from(warnings)
      .where(and(
        eq(warnings.id, warningId),
        eq(warnings.serverId, serverId),
        eq(warnings.status, 'active')
      ))
      .limit(1);

    if (!warning.length) {
      return await interaction.reply({ 
        content: `❌ Không tìm thấy warning #${warningId} hoặc warning đã bị xóa!`, 
        ephemeral: true 
      });
    }

    await db.update(warnings)
      .set({ 
        status: 'removed',
        removedAt: new Date(),
        removedBy: interaction.user.id
      })
      .where(eq(warnings.id, warningId));

    const target = await interaction.guild.members.fetch(warning[0].userId).catch(() => null);

    if (target) {
      try {
        await target.send(
          `✅ Warning #${warningId} của bạn đã được xóa trong **${interaction.guild.name}**\n` +
          `**Lý do:** ${reason}`
        ).catch(() => {});
      } catch (error) {
        console.log('Could not DM user');
      }

      await logModerationAction(
        interaction.guild,
        'UNWARNING',
        interaction.user,
        target,
        `Removed warning #${warningId}: ${reason}`,
        null,
        config
      );
    }

    let responseContent = `✅ Warning #${warningId} đã được xóa!`;
    if (config.respondWithReason) {
      responseContent += `\n**Lý do:** ${reason}`;
    }

    await interaction.reply({ 
      content: responseContent,
      ephemeral: !config.respondWithReason 
    });

    if (config.deleteModCommands) {
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);
    }

  } catch (error) {
    console.error('Error handling unwarning:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi xóa warning!', 
      ephemeral: true 
    });
  }
}

async function handleWarnings(interaction) {
  try {
    const target = interaction.options.getMember('user');
    const serverId = interaction.guild.id;

    if (!target) {
      return await interaction.reply({ 
        content: '❌ Không tìm thấy user trong server!', 
        ephemeral: true 
      });
    }

    const userWarnings = await db.select()
      .from(warnings)
      .where(and(
        eq(warnings.serverId, serverId),
        eq(warnings.userId, target.id),
        eq(warnings.status, 'active')
      ));

    if (!userWarnings.length) {
      return await interaction.reply({ 
        content: `📋 **${target.user.tag}** không có warnings nào!`, 
        ephemeral: true 
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warnings - ${target.user.tag}`)
      .setColor(0xFFA500)
      .setThumbnail(target.user.displayAvatarURL())
      .setDescription(`**Tổng warnings:** ${userWarnings.length}/5`)
      .setTimestamp();

    for (const warning of userWarnings) {
      const moderator = await interaction.guild.members.fetch(warning.moderatorId).catch(() => null);
      embed.addFields({
        name: `Warning #${warning.id}`,
        value: `**Lý do:** ${warning.reason || 'Không có lý do'}\n` +
               `**Moderator:** ${moderator ? moderator.user.tag : 'Unknown'}\n` +
               `**Ngày:** <t:${Math.floor(new Date(warning.createdAt).getTime() / 1000)}:R>`,
        inline: false
      });
    }

    await interaction.reply({ 
      embeds: [embed], 
      ephemeral: true 
    });

  } catch (error) {
    console.error('Error fetching warnings:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi lấy warnings!', 
      ephemeral: true 
    });
  }
}

async function handleModSetup(interaction) {
  try {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return await interaction.reply({ 
        content: '❌ Chỉ admin mới có thể setup moderation logs!', 
        ephemeral: true 
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;

    if (subcommand === 'logchannel') {
      const channel = interaction.options.getChannel('channel');

      const existing = await db.select()
        .from(moderationConfigs)
        .where(eq(moderationConfigs.serverId, serverId))
        .limit(1);

      if (existing.length) {
        await db.update(moderationConfigs)
          .set({ 
            logChannelId: channel.id,
            enabled: true,
            updatedAt: new Date()
          })
          .where(eq(moderationConfigs.serverId, serverId));
      } else {
        await db.insert(moderationConfigs).values({
          serverId,
          logChannelId: channel.id,
          enabled: true
        });
      }

      await interaction.reply({ 
        content: `✅ Đã đặt kênh moderation logs thành ${channel}!`, 
        ephemeral: true 
      });

    } else if (subcommand === 'remove') {
      await db.update(moderationConfigs)
        .set({ 
          logChannelId: null,
          enabled: false,
          updatedAt: new Date()
        })
        .where(eq(moderationConfigs.serverId, serverId));

      await interaction.reply({ 
        content: `✅ Đã xóa cấu hình moderation logs!`, 
        ephemeral: true 
      });
    }

  } catch (error) {
    console.error('Error in mod setup:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra! Vui lòng thử lại sau.', 
      ephemeral: true 
    });
  }
}

async function handleLock(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);
    const serverConfig = await getServerConfig(interaction.guild.id);
    const lang = getLang(serverConfig);
    
    const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
    
    if (!config.commandsEnabled?.lock) {
      return await interaction.reply({ 
        content: msg('command_disabled', { command: 'lock' }), 
        ephemeral: true 
      });
    }

    if (!await checkModerationPermissions(interaction.member, config, PermissionFlagsBits.ManageChannels)) {
      return await interaction.reply({ 
        content: msg('no_permission'), 
        ephemeral: true 
      });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || msg('no_reason');

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    }, { reason: `${interaction.user.tag}: ${reason}` });

    await logModerationAction(
      interaction.guild,
      'LOCK',
      interaction.user,
      { user: { tag: channel.name }, id: channel.id },
      reason,
      null,
      config
    );

    await interaction.reply({ 
      content: msg('lock_success', { channel: channel.toString(), reason }), 
      ephemeral: config.deleteModCommands 
    });

    if (config.deleteModCommands) {
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    }

  } catch (error) {
    console.error('Error in lock command:', error);
    try {
      const serverConfig = await getServerConfig(interaction.guild.id);
      const lang = getLang(serverConfig);
      const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: msg('error') || '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    } catch (innerError) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    }
  }
}

async function handleUnlock(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);
    const serverConfig = await getServerConfig(interaction.guild.id);
    const lang = getLang(serverConfig);
    
    const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
    
    if (!config.commandsEnabled?.unlock) {
      return await interaction.reply({ 
        content: msg('command_disabled', { command: 'unlock' }), 
        ephemeral: true 
      });
    }

    if (!await checkModerationPermissions(interaction.member, config, PermissionFlagsBits.ManageChannels)) {
      return await interaction.reply({ 
        content: msg('no_permission'), 
        ephemeral: true 
      });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || msg('no_reason');

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null
    }, { reason: `${interaction.user.tag}: ${reason}` });

    await logModerationAction(
      interaction.guild,
      'UNLOCK',
      interaction.user,
      { user: { tag: channel.name }, id: channel.id },
      reason,
      null,
      config
    );

    await interaction.reply({ 
      content: msg('unlock_success', { channel: channel.toString(), reason }), 
      ephemeral: config.deleteModCommands 
    });

    if (config.deleteModCommands) {
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    }

  } catch (error) {
    console.error('Error in unlock command:', error);
    try {
      const serverConfig = await getServerConfig(interaction.guild.id);
      const lang = getLang(serverConfig);
      const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: msg('error') || '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    } catch (innerError) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    }
  }
}

async function handleSlowmode(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);
    const serverConfig = await getServerConfig(interaction.guild.id);
    const lang = getLang(serverConfig);
    
    const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
    
    if (!config.commandsEnabled?.slowmode) {
      return await interaction.reply({ 
        content: msg('command_disabled', { command: 'slowmode' }), 
        ephemeral: true 
      });
    }

    if (!await checkModerationPermissions(interaction.member, config, PermissionFlagsBits.ManageChannels)) {
      return await interaction.reply({ 
        content: msg('no_permission'), 
        ephemeral: true 
      });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const duration = interaction.options.getInteger('duration') || 0;
    const reason = interaction.options.getString('reason') || msg('no_reason');

    if (duration < 0 || duration > 21600) {
      return await interaction.reply({ 
        content: msg('slowmode_invalid_duration'), 
        ephemeral: true 
      });
    }

    await channel.setRateLimitPerUser(duration, `${interaction.user.tag}: ${reason}`);

    const durationText = duration === 0 ? msg('slowmode_disabled') : msg('slowmode_duration', { duration: `${duration}s` });

    await logModerationAction(
      interaction.guild,
      'SLOWMODE',
      interaction.user,
      { user: { tag: channel.name }, id: channel.id },
      reason,
      durationText,
      config
    );

    await interaction.reply({ 
      content: msg('slowmode_success', { channel: channel.toString(), duration: durationText, reason }), 
      ephemeral: config.deleteModCommands 
    });

    if (config.deleteModCommands) {
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    }

  } catch (error) {
    console.error('Error in slowmode command:', error);
    try {
      const serverConfig = await getServerConfig(interaction.guild.id);
      const lang = getLang(serverConfig);
      const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: msg('error') || '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    } catch (innerError) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    }
  }
}

async function handlePurge(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);
    const serverConfig = await getServerConfig(interaction.guild.id);
    const lang = getLang(serverConfig);
    
    const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
    
    if (!config.commandsEnabled?.purge) {
      return await interaction.reply({ 
        content: msg('command_disabled', { command: 'purge' }), 
        ephemeral: true 
      });
    }

    if (!await checkModerationPermissions(interaction.member, config, PermissionFlagsBits.ManageMessages)) {
      return await interaction.reply({ 
        content: msg('no_permission'), 
        ephemeral: true 
      });
    }

    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    let toDelete = messages.first(amount);
    
    if (targetUser) {
      toDelete = toDelete.filter(m => m.author.id === targetUser.id);
    }

    const deleted = await interaction.channel.bulkDelete(toDelete, true);

    await logModerationAction(
      interaction.guild,
      'PURGE',
      interaction.user,
      targetUser || { user: { tag: 'All users' }, id: 'all' },
      `${deleted.size} messages`,
      null,
      config
    );

    await interaction.editReply({ 
      content: msg('purge_success', { count: deleted.size, channel: interaction.channel.toString() }), 
      ephemeral: true 
    });

    if (config.deleteModCommands) {
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    }

  } catch (error) {
    console.error('Error in purge command:', error);
    try {
      const serverConfig = await getServerConfig(interaction.guild.id);
      const lang = getLang(serverConfig);
      const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: msg('error') || '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      } else if (interaction.deferred) {
        await interaction.editReply({ 
          content: msg('error') || '❌ Có lỗi xảy ra! / An error occurred!'
        });
      }
    } catch (innerError) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      } else if (interaction.deferred) {
        await interaction.editReply({ 
          content: '❌ Có lỗi xảy ra! / An error occurred!'
        });
      }
    }
  }
}

async function handleNuke(interaction) {
  try {
    const config = await getModerationConfig(interaction.guild.id);
    const serverConfig = await getServerConfig(interaction.guild.id);
    const lang = getLang(serverConfig);
    
    const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
    
    if (!config.commandsEnabled?.nuke) {
      return await interaction.reply({ 
        content: msg('command_disabled', { command: 'nuke' }), 
        ephemeral: true 
      });
    }

    if (!await checkModerationPermissions(interaction.member, config, PermissionFlagsBits.ManageChannels)) {
      return await interaction.reply({ 
        content: msg('no_permission'), 
        ephemeral: true 
      });
    }

    await interaction.reply({ 
      content: msg('nuke_processing') || '💣 Đang nuke channel...', 
      ephemeral: true 
    });

    const channel = interaction.channel;
    const channelName = channel.name;
    const channelPosition = channel.position;
    const channelParent = channel.parent;
    const channelTopic = channel.topic;
    const channelNsfw = channel.nsfw;
    const channelRateLimitPerUser = channel.rateLimitPerUser;
    const channelPermissionOverwrites = channel.permissionOverwrites.cache;

    const newChannel = await channel.clone({
      name: channelName,
      topic: channelTopic,
      nsfw: channelNsfw,
      rateLimitPerUser: channelRateLimitPerUser,
      parent: channelParent,
      position: channelPosition,
      permissionOverwrites: channelPermissionOverwrites,
      reason: `Channel nuked by ${interaction.user.tag}`
    });

    await channel.delete(`Nuked by ${interaction.user.tag}`);

    await logModerationAction(
      interaction.guild,
      'NUKE',
      interaction.user,
      { user: { tag: channelName }, id: channel.id },
      'Channel reset',
      null,
      config
    );

    await newChannel.send(msg('nuke_success', { user: interaction.user.toString() }) || `💣 Channel đã được nuke bởi ${interaction.user}! Tất cả tin nhắn cũ đã bị xóa sạch! ✨`);

  } catch (error) {
    console.error('Error in nuke command:', error);
    try {
      const serverConfig = await getServerConfig(interaction.guild.id);
      const lang = getLang(serverConfig);
      const msg = (key, params = {}) => t(lang, `moderation:${key}`, params);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: msg('error') || '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    } catch (innerError) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ Có lỗi xảy ra! / An error occurred!', 
          ephemeral: true 
        });
      }
    }
  }
}

module.exports = {
  handleBan,
  handleUnban,
  handleKick,
  handleMute,
  handleUnmute,
  handleWarning,
  handleUnwarning,
  handleWarnings,
  handleModSetup,
  handleLock,
  handleUnlock,
  handleSlowmode,
  handlePurge,
  handleNuke
};
