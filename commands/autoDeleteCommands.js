const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { checkServerPremium, PREMIUM_FEATURES } = require('../utils/serverPremiumChecker');

async function handleAutoDelete(message, args, db) {
  const { autoDeleteConfig } = require('../database/schema');
  const { eq } = require('drizzle-orm');
  
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ Bạn cần quyền Manage Messages để sử dụng lệnh này!');
  }

  // Check premium status
  const { isPremium } = await checkServerPremium(message.guild.id);
  if (!isPremium) {
    const premiumEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👑 Premium Feature')
      .setDescription('**Auto Delete** là tính năng Premium! Nâng cấp server để sử dụng.')
      .addFields({
        name: '✨ Premium Benefits',
        value: '• Train Lena\n• Custom Commands\n• Auto Ban\n• Auto Delete\n• Scheduled Messages',
        inline: false
      })
      .setFooter({ text: 'Liên hệ admin để nâng cấp Premium cho server' })
      .setTimestamp();
    return message.reply({ embeds: [premiumEmbed] });
  }

  const subcommand = args[0]?.toLowerCase();
  const serverId = message.guild.id;

  if (subcommand === 'on' || subcommand === 'off') {
    const enabled = subcommand === 'on';
    
    const existing = await db.select().from(autoDeleteConfig).where(eq(autoDeleteConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoDeleteConfig).values({
        serverId: serverId,
        enabled: enabled
      });
    } else {
      await db.update(autoDeleteConfig)
        .set({ enabled: enabled, updatedAt: new Date() })
        .where(eq(autoDeleteConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${enabled ? '✅' : '❌'} Auto Delete`)
      .setDescription(`Auto Delete đã được ${enabled ? 'bật' : 'tắt'}`)
      .setColor(enabled ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'time') {
    const seconds = parseInt(args[1]);
    
    if (isNaN(seconds) || seconds < 1) {
      return message.reply('❌ Vui lòng nhập số giây hợp lệ (tối thiểu 1)!');
    }

    const existing = await db.select().from(autoDeleteConfig).where(eq(autoDeleteConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoDeleteConfig).values({
        serverId: serverId,
        deleteAfterSeconds: seconds
      });
    } else {
      await db.update(autoDeleteConfig)
        .set({ deleteAfterSeconds: seconds, updatedAt: new Date() })
        .where(eq(autoDeleteConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle('⏱️ Cập nhật thời gian xóa')
      .setDescription(`Tin nhắn sẽ được xóa sau **${seconds}** giây`)
      .setColor(0x5865F2)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'channel') {
    const action = args[1]?.toLowerCase();
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
    
    if (!channel) {
      return message.reply('❌ Vui lòng mention kênh hoặc cung cấp ID kênh!');
    }

    const existing = await db.select().from(autoDeleteConfig).where(eq(autoDeleteConfig.serverId, serverId)).limit(1);
    let channelIds = existing.length > 0 ? existing[0].channelIds || [] : [];

    if (action === 'add') {
      if (!channelIds.includes(channel.id)) {
        channelIds.push(channel.id);
      }
    } else if (action === 'remove') {
      channelIds = channelIds.filter(id => id !== channel.id);
    } else {
      return message.reply('❌ Dùng: `!autodelete channel add/remove #channel`');
    }

    if (existing.length === 0) {
      await db.insert(autoDeleteConfig).values({
        serverId: serverId,
        channelIds: channelIds
      });
    } else {
      await db.update(autoDeleteConfig)
        .set({ channelIds: channelIds, updatedAt: new Date() })
        .where(eq(autoDeleteConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${action === 'add' ? '➕' : '➖'} Cập nhật kênh`)
      .setDescription(`${channel} đã được ${action === 'add' ? 'thêm vào' : 'xóa khỏi'} danh sách auto delete`)
      .setColor(0x5865F2)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Show current config
  const config = await db.select().from(autoDeleteConfig).where(eq(autoDeleteConfig.serverId, serverId)).limit(1);
  
  if (config.length === 0) {
    return message.reply('❌ Chưa có cấu hình auto delete! Dùng `!autodelete on` để bật.');
  }

  const cfg = config[0];
  const channels = cfg.channelIds && cfg.channelIds.length > 0 
    ? cfg.channelIds.map(id => `<#${id}>`).join(', ')
    : 'Tất cả kênh';

  const embed = new EmbedBuilder()
    .setTitle('⚙️ Cấu hình Auto Delete')
    .setColor(cfg.enabled ? 0x57F287 : 0xED4245)
    .addFields(
      { name: 'Trạng thái', value: cfg.enabled ? '✅ Đang bật' : '❌ Đang tắt', inline: true },
      { name: 'Thời gian xóa', value: `${cfg.deleteAfterSeconds}s`, inline: true },
      { name: 'Xóa commands', value: cfg.deleteCommands ? '✅' : '❌', inline: true },
      { name: 'Xóa bot replies', value: cfg.deleteBotReplies ? '✅' : '❌', inline: true },
      { name: 'Premium', value: cfg.isPremium ? '⭐ Có' : '❌ Không', inline: true },
      { name: 'Kênh áp dụng', value: channels, inline: false }
    )
    .setFooter({ text: 'Dùng !autodelete <on|off|time|channel> để cấu hình' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = {
  handleAutoDelete
};
