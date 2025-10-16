const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { checkServerPremium, PREMIUM_FEATURES } = require('../utils/serverPremiumChecker');

async function handleScheduledMessage(message, args, db) {
  const { scheduledMessages } = require('../database/schema');
  const { eq, and } = require('drizzle-orm');
  
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return message.reply('❌ Bạn cần quyền Manage Server để quản lý scheduled messages!');
  }

  // Check premium status
  const { isPremium } = await checkServerPremium(message.guild.id);
  if (!isPremium) {
    const premiumEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👑 Premium Feature')
      .setDescription('**Scheduled Messages** là tính năng Premium! Nâng cấp server để sử dụng.')
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

  if (subcommand === 'create' || subcommand === 'add') {
    const channelMention = message.mentions.channels.first();
    
    // Parse cron expression (standard format: minute hour day month dayofweek - 5 tokens)
    // Example: 0 9 * * * → "Send at 9:00 AM every day"
    const cronTokens = args.slice(2, 7); // args[2] to args[6] = 5 tokens
    const cron = cronTokens.join(' ');
    const messageContent = args.slice(7).join(' ');
    
    // Validate cron expression using node-cron
    const cronLib = require('node-cron');
    const isValidCron = cronLib.validate(cron);

    if (!channelMention || !isValidCron || !messageContent) {
      return message.reply('❌ Cú pháp: `!schedule create #channel <minute> <hour> <day> <month> <dayOfWeek> <message>`\nVí dụ: `!schedule create #general 0 9 * * * Chào buổi sáng!`\n\nCron format: `minute hour day month dayOfWeek`\n• minute: 0-59\n• hour: 0-23\n• day: 1-31\n• month: 1-12\n• dayOfWeek: 0-7 (0 và 7 = Sunday)\n• Dùng `*` để chọn "mọi"');
    }

    const result = await db.insert(scheduledMessages).values({
      serverId: serverId,
      channelId: channelMention.id,
      message: messageContent,
      cronExpression: cron,
      createdBy: message.author.id
    }).returning();
    
    // Start cron job immediately
    if (result.length > 0) {
      const { startCronJob } = require('../utils/scheduledMessagesHandler');
      startCronJob(message.client, db, result[0]);
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Scheduled Message đã tạo')
      .setDescription(`Tin nhắn sẽ được gửi tự động vào ${channelMention}`)
      .addFields(
        { name: 'Cron Expression', value: `\`${cron}\``, inline: false },
        { name: 'Message', value: messageContent, inline: false }
      )
      .setColor(0x57F287)
      .setFooter({ text: 'Dùng !schedule list để xem tất cả scheduled messages' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'list') {
    const messages = await db.select()
      .from(scheduledMessages)
      .where(eq(scheduledMessages.serverId, serverId));

    if (messages.length === 0) {
      return message.reply('❌ Server chưa có scheduled messages nào!');
    }

    const messageList = messages
      .map(msg => `• ID: ${msg.id} - <#${msg.channelId}> - ${msg.enabled ? '✅' : '❌'}\n  Cron: \`${msg.cronExpression}\``)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📋 Scheduled Messages')
      .setDescription(messageList)
      .setColor(0x5865F2)
      .setFooter({ text: `Tổng: ${messages.length} scheduled messages` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'delete' || subcommand === 'remove') {
    const id = parseInt(args[1]);

    if (isNaN(id)) {
      return message.reply('❌ Vui lòng cung cấp ID hợp lệ! Dùng `!schedule list` để xem danh sách.');
    }

    await db.delete(scheduledMessages)
      .where(and(
        eq(scheduledMessages.serverId, serverId),
        eq(scheduledMessages.id, id)
      ));
    
    // Stop cron job
    const { stopCronJob } = require('../utils/scheduledMessagesHandler');
    stopCronJob(id);

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Scheduled Message đã xóa')
      .setDescription(`Scheduled message ID ${id} đã bị xóa`)
      .setColor(0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'toggle') {
    const id = parseInt(args[1]);

    if (isNaN(id)) {
      return message.reply('❌ Vui lòng cung cấp ID hợp lệ!');
    }

    const existing = await db.select()
      .from(scheduledMessages)
      .where(and(
        eq(scheduledMessages.serverId, serverId),
        eq(scheduledMessages.id, id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return message.reply(`❌ Scheduled message ID ${id} không tồn tại!`);
    }

    const newStatus = !existing[0].enabled;

    await db.update(scheduledMessages)
      .set({ enabled: newStatus, updatedAt: new Date() })
      .where(eq(scheduledMessages.id, id));
    
    // Start or stop cron job
    const { startCronJob, stopCronJob } = require('../utils/scheduledMessagesHandler');
    if (newStatus) {
      // Reload message data and start job
      const reloaded = await db.select()
        .from(scheduledMessages)
        .where(eq(scheduledMessages.id, id))
        .limit(1);
      
      if (reloaded.length > 0) {
        startCronJob(message.client, db, reloaded[0]);
      }
    } else {
      stopCronJob(id);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${newStatus ? '✅' : '❌'} Scheduled Message ${newStatus ? 'đã bật' : 'đã tắt'}`)
      .setDescription(`Scheduled message ID ${id} đã được ${newStatus ? 'bật' : 'tắt'}`)
      .setColor(newStatus ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Show help
  const embed = new EmbedBuilder()
    .setTitle('⏰ Scheduled Messages Help')
    .setDescription('Tạo tin nhắn tự động theo lịch với Cron expressions')
    .setColor(0x5865F2)
    .addFields(
      { name: 'Tạo scheduled message', value: '`!schedule create #channel <cron> <message>`', inline: false },
      { name: 'Danh sách', value: '`!schedule list`', inline: false },
      { name: 'Xóa', value: '`!schedule delete <id>`', inline: false },
      { name: 'Bật/tắt', value: '`!schedule toggle <id>`', inline: false },
      { name: 'Cron Examples', value: '`0 9 * * *` - Mỗi ngày lúc 9:00\n`0 */6 * * *` - Mỗi 6 giờ\n`0 0 * * 1` - Mỗi thứ 2', inline: false }
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = {
  handleScheduledMessage
};
