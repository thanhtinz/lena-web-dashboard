const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

async function handleActionLogsConfig(message, args, db) {
  const { actionLogsConfig } = require('../database/schema');
  const { eq } = require('drizzle-orm');
  
  if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply('❌ Chỉ admin mới có thể cấu hình action logs!');
  }

  const subcommand = args[0]?.toLowerCase();
  const serverId = message.guild.id;

  if (subcommand === 'channel') {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
    
    if (!channel) {
      return message.reply('❌ Vui lòng mention kênh hoặc cung cấp ID kênh!');
    }

    const existing = await db.select().from(actionLogsConfig).where(eq(actionLogsConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(actionLogsConfig).values({
        serverId: serverId,
        logChannelId: channel.id
      });
    } else {
      await db.update(actionLogsConfig)
        .set({ logChannelId: channel.id, updatedAt: new Date() })
        .where(eq(actionLogsConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Cấu hình Action Logs')
      .setDescription(`Đã đặt kênh log thành ${channel}`)
      .setColor(0x57F287)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'toggle') {
    const logType = args[1]?.toLowerCase();
    const enabled = args[2]?.toLowerCase() === 'on';

    const logTypes = {
      'delete': 'enableMessageDelete',
      'edit': 'enableMessageEdit',
      'join': 'enableMemberJoin',
      'leave': 'enableMemberLeave',
      'ban': 'enableMemberBan',
      'kick': 'enableMemberKick',
      'update': 'enableMemberUpdate',
      'role': 'enableRoleUpdate',
      'channel': 'enableChannelUpdate',
      'server': 'enableServerUpdate'
    };

    if (!logTypes[logType]) {
      return message.reply(`❌ Log type không hợp lệ! Các loại: ${Object.keys(logTypes).join(', ')}`);
    }

    const existing = await db.select().from(actionLogsConfig).where(eq(actionLogsConfig.serverId, serverId)).limit(1);

    const updateData = { [logTypes[logType]]: enabled, updatedAt: new Date() };

    if (existing.length === 0) {
      await db.insert(actionLogsConfig).values({
        serverId: serverId,
        ...updateData
      });
    } else {
      await db.update(actionLogsConfig)
        .set(updateData)
        .where(eq(actionLogsConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Cập nhật Log Type')
      .setDescription(`${logType} đã được ${enabled ? 'bật' : 'tắt'}`)
      .setColor(enabled ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Show current config
  const config = await db.select().from(actionLogsConfig).where(eq(actionLogsConfig.serverId, serverId)).limit(1);
  
  if (config.length === 0) {
    return message.reply('❌ Chưa có cấu hình action logs! Dùng `!actionlogs channel #channel` để thiết lập.');
  }

  const cfg = config[0];
  const logChannel = cfg.logChannelId ? `<#${cfg.logChannelId}>` : 'Chưa thiết lập';

  const embed = new EmbedBuilder()
    .setTitle('⚙️ Cấu hình Action Logs')
    .setColor(0x5865F2)
    .addFields(
      { name: '📢 Kênh Log', value: logChannel, inline: false },
      { name: '🗑️ Message Delete', value: cfg.enableMessageDelete ? '✅' : '❌', inline: true },
      { name: '✏️ Message Edit', value: cfg.enableMessageEdit ? '✅' : '❌', inline: true },
      { name: '➕ Member Join', value: cfg.enableMemberJoin ? '✅' : '❌', inline: true },
      { name: '➖ Member Leave', value: cfg.enableMemberLeave ? '✅' : '❌', inline: true },
      { name: '🔨 Ban', value: cfg.enableMemberBan ? '✅' : '❌', inline: true },
      { name: '👢 Kick', value: cfg.enableMemberKick ? '✅' : '❌', inline: true },
      { name: '👤 Member Update', value: cfg.enableMemberUpdate ? '✅' : '❌', inline: true },
      { name: '🎭 Role Update', value: cfg.enableRoleUpdate ? '✅' : '❌', inline: true },
      { name: '📝 Channel Update', value: cfg.enableChannelUpdate ? '✅' : '❌', inline: true },
      { name: '🏰 Server Update', value: cfg.enableServerUpdate ? '✅' : '❌', inline: true }
    )
    .setFooter({ text: 'Dùng !actionlogs toggle <type> <on|off> để bật/tắt' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = {
  handleActionLogsConfig
};
