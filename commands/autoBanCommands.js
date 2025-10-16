const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { checkServerPremium, PREMIUM_FEATURES } = require('../utils/serverPremiumChecker');

async function handleAutoBan(message, args, db) {
  const { autoBanRules } = require('../database/schema');
  const { eq, and } = require('drizzle-orm');
  
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply('❌ Bạn cần quyền Ban Members để quản lý auto ban!');
  }

  // Check premium status
  const { isPremium } = await checkServerPremium(message.guild.id);
  if (!isPremium) {
    const premiumEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👑 Premium Feature')
      .setDescription('**Auto Ban** là tính năng Premium! Nâng cấp server để sử dụng.')
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
    const ruleName = args[1];
    const ruleType = args[2]?.toLowerCase();
    const threshold = parseInt(args[3]) || 1;

    const validTypes = ['spam', 'invite', 'link', 'keyword', 'newaccount'];
    
    if (!ruleName || !validTypes.includes(ruleType)) {
      return message.reply(`❌ Cú pháp: \`!autoban create <tên_rule> <type> [threshold]\`\nTypes: ${validTypes.join(', ')}`);
    }

    await db.insert(autoBanRules).values({
      serverId: serverId,
      ruleName: ruleName,
      ruleType: ruleType,
      threshold: threshold,
      banReason: `Auto ban: ${ruleName}`
    });

    const embed = new EmbedBuilder()
      .setTitle('⭐ Auto Ban Rule đã tạo (Premium)')
      .setDescription(`Rule: **${ruleName}**\nType: ${ruleType}\nThreshold: ${threshold}`)
      .setColor(0x57F287)
      .setFooter({ text: 'Premium feature - Dùng !autoban list để xem tất cả rules' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'list') {
    const rules = await db.select()
      .from(autoBanRules)
      .where(eq(autoBanRules.serverId, serverId));

    if (rules.length === 0) {
      return message.reply('❌ Server chưa có auto ban rules nào!');
    }

    const ruleList = rules
      .map(rule => `• **${rule.ruleName}** - ${rule.ruleType} (${rule.threshold}x) - ${rule.enabled ? '✅' : '❌'}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('⭐ Auto Ban Rules (Premium)')
      .setDescription(ruleList)
      .setColor(0x5865F2)
      .setFooter({ text: `Tổng: ${rules.length} rules` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'delete' || subcommand === 'remove') {
    const ruleName = args[1];

    if (!ruleName) {
      return message.reply('❌ Cú pháp: `!autoban delete <tên_rule>`');
    }

    await db.delete(autoBanRules)
      .where(and(
        eq(autoBanRules.serverId, serverId),
        eq(autoBanRules.ruleName, ruleName)
      ));

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Auto Ban Rule đã xóa')
      .setDescription(`Rule **${ruleName}** đã bị xóa`)
      .setColor(0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'toggle') {
    const ruleName = args[1];

    if (!ruleName) {
      return message.reply('❌ Cú pháp: `!autoban toggle <tên_rule>`');
    }

    const existing = await db.select()
      .from(autoBanRules)
      .where(and(
        eq(autoBanRules.serverId, serverId),
        eq(autoBanRules.ruleName, ruleName)
      ))
      .limit(1);

    if (existing.length === 0) {
      return message.reply(`❌ Rule **${ruleName}** không tồn tại!`);
    }

    const newStatus = !existing[0].enabled;

    await db.update(autoBanRules)
      .set({ enabled: newStatus, updatedAt: new Date() })
      .where(and(
        eq(autoBanRules.serverId, serverId),
        eq(autoBanRules.ruleName, ruleName)
      ));

    const embed = new EmbedBuilder()
      .setTitle(`${newStatus ? '✅' : '❌'} Rule ${newStatus ? 'đã bật' : 'đã tắt'}`)
      .setDescription(`Rule **${ruleName}** đã được ${newStatus ? 'bật' : 'tắt'}`)
      .setColor(newStatus ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Show help
  const embed = new EmbedBuilder()
    .setTitle('⭐ Auto Ban Help (Premium)')
    .setDescription('Tự động ban users vi phạm rules')
    .setColor(0x5865F2)
    .addFields(
      { name: 'Tạo rule', value: '`!autoban create <tên> <type> [threshold]`', inline: false },
      { name: 'Danh sách', value: '`!autoban list`', inline: false },
      { name: 'Xóa rule', value: '`!autoban delete <tên>`', inline: false },
      { name: 'Bật/tắt', value: '`!autoban toggle <tên>`', inline: false },
      { name: 'Rule Types', value: 'spam, invite, link, keyword, newaccount', inline: false }
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = {
  handleAutoBan
};
