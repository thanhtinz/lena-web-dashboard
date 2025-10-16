const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

async function handleAutoMod(message, args, db) {
  const { autoModConfig } = require('../database/schema');
  const { eq } = require('drizzle-orm');
  
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return message.reply('❌ Bạn cần quyền Manage Server để cấu hình auto mod!');
  }

  const subcommand = args[0]?.toLowerCase();
  const serverId = message.guild.id;

  if (subcommand === 'on' || subcommand === 'off') {
    const enabled = subcommand === 'on';
    
    const existing = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoModConfig).values({
        serverId: serverId,
        enabled: enabled
      });
    } else {
      await db.update(autoModConfig)
        .set({ enabled: enabled, updatedAt: new Date() })
        .where(eq(autoModConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${enabled ? '✅' : '❌'} Auto Moderation`)
      .setDescription(`Auto Mod đã được ${enabled ? 'bật' : 'tắt'}`)
      .setColor(enabled ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'antispam') {
    const action = args[1]?.toLowerCase();
    const enabled = action === 'on';

    if (action !== 'on' && action !== 'off') {
      return message.reply('❌ Dùng: `!automod antispam <on|off>`');
    }

    const existing = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoModConfig).values({
        serverId: serverId,
        antiSpam: enabled
      });
    } else {
      await db.update(autoModConfig)
        .set({ antiSpam: enabled, updatedAt: new Date() })
        .where(eq(autoModConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${enabled ? '🛡️' : '❌'} Anti-Spam`)
      .setDescription(`Anti-Spam đã được ${enabled ? 'bật' : 'tắt'}`)
      .setColor(enabled ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'antilinks') {
    const action = args[1]?.toLowerCase();
    const enabled = action === 'on';

    if (action !== 'on' && action !== 'off') {
      return message.reply('❌ Dùng: `!automod antilinks <on|off>`');
    }

    const existing = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoModConfig).values({
        serverId: serverId,
        antiLinks: enabled
      });
    } else {
      await db.update(autoModConfig)
        .set({ antiLinks: enabled, updatedAt: new Date() })
        .where(eq(autoModConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${enabled ? '🔗' : '❌'} Anti-Links`)
      .setDescription(`Anti-Links đã được ${enabled ? 'bật' : 'tắt'}`)
      .setColor(enabled ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'antiinvites') {
    const action = args[1]?.toLowerCase();
    const enabled = action === 'on';

    if (action !== 'on' && action !== 'off') {
      return message.reply('❌ Dùng: `!automod antiinvites <on|off>`');
    }

    const existing = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoModConfig).values({
        serverId: serverId,
        antiInvites: enabled
      });
    } else {
      await db.update(autoModConfig)
        .set({ antiInvites: enabled, updatedAt: new Date() })
        .where(eq(autoModConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${enabled ? '🚫' : '❌'} Anti-Invites`)
      .setDescription(`Anti-Invites đã được ${enabled ? 'bật' : 'tắt'}`)
      .setColor(enabled ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'action') {
    const actionType = args[1]?.toLowerCase();
    
    const validActions = ['warn', 'kick', 'ban', 'mute', 'delete'];
    if (!validActions.includes(actionType)) {
      return message.reply(`❌ Action không hợp lệ! Dùng: ${validActions.join(', ')}`);
    }

    const existing = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoModConfig).values({
        serverId: serverId,
        actionType: actionType
      });
    } else {
      await db.update(autoModConfig)
        .set({ actionType: actionType, updatedAt: new Date() })
        .where(eq(autoModConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Action Type đã cập nhật')
      .setDescription(`Hành động mặc định: **${actionType}**`)
      .setColor(0x5865F2)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Show current config
  const config = await db.select().from(autoModConfig).where(eq(autoModConfig.serverId, serverId)).limit(1);
  
  if (config.length === 0) {
    return message.reply('❌ Chưa có cấu hình auto mod! Dùng `!automod on` để bật.');
  }

  const cfg = config[0];

  const embed = new EmbedBuilder()
    .setTitle('⚙️ Cấu hình Auto Moderation')
    .setColor(cfg.enabled ? 0x57F287 : 0xED4245)
    .addFields(
      { name: 'Trạng thái', value: cfg.enabled ? '✅ Đang bật' : '❌ Đang tắt', inline: true },
      { name: 'Action Type', value: cfg.actionType || 'warn', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '🛡️ Anti-Spam', value: cfg.antiSpam ? '✅' : '❌', inline: true },
      { name: '🔗 Anti-Links', value: cfg.antiLinks ? '✅' : '❌', inline: true },
      { name: '🚫 Anti-Invites', value: cfg.antiInvites ? '✅' : '❌', inline: true },
      { name: '📢 Anti-Caps', value: cfg.antiCaps ? '✅' : '❌', inline: true },
      { name: '👥 Anti-Mention Spam', value: cfg.antiMentionSpam ? '✅' : '❌', inline: true },
      { name: 'Spam Threshold', value: `${cfg.spamThreshold} tin nhắn / ${cfg.spamTimeWindow}s`, inline: true }
    )
    .setFooter({ text: 'Dùng !automod <antispam|antilinks|antiinvites> <on|off>' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = {
  handleAutoMod
};
