const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addCustomResponse, getCustomResponsesForServer, deleteCustomResponse } = require('../database/trainingData');
const { db } = require('../database/db');
const { customEmbeds } = require('../database/schema');
const { eq, and } = require('drizzle-orm');

// /response add
async function handleResponseAddSlash(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Chỉ admin mới có thể thêm custom response!', ephemeral: true });
  }

  const trigger = interaction.options.getString('trigger');
  const response = interaction.options.getString('response');
  const isExact = interaction.options.getBoolean('exact') || false;
  const priority = interaction.options.getInteger('priority') || 0;
  const embedName = interaction.options.getString('embed') || null;

  // Validate embed exists if provided
  if (embedName) {
    const embedExists = await db.select()
      .from(customEmbeds)
      .where(and(
        eq(customEmbeds.serverId, interaction.guild.id),
        eq(customEmbeds.name, embedName)
      ))
      .limit(1);

    if (embedExists.length === 0) {
      return interaction.reply({ 
        content: `❌ Không tìm thấy embed với tên \`${embedName}\`!\n\nDùng \`/embed list\` để xem danh sách embed.`, 
        ephemeral: true 
      });
    }
  }

  const result = await addCustomResponse({
    serverId: interaction.guild.id,
    trigger,
    response,
    isExactMatch: isExact,
    priority: priority,
    embedName: embedName,
    createdBy: interaction.user.id
  });

  if (result) {
    const matchType = isExact ? 'Exact match' : 'Contains';
    const embedInfo = embedName ? `\n📎 Embed: \`${embedName}\`` : '';
    
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Đã thêm custom response')
      .setDescription(`**ID:** #${result.id}\n🔑 **Trigger:** "${trigger}"\n📊 **Type:** ${matchType}\n⭐ **Priority:** ${priority}${embedInfo}\n💬 **Response:** ${response}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else {
    await interaction.reply({ content: '❌ Lỗi khi thêm custom response!', ephemeral: true });
  }
}

// /response list
async function handleResponseListSlash(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Chỉ admin mới có thể xem custom responses!', ephemeral: true });
  }

  const responses = await getCustomResponsesForServer(interaction.guild.id);

  if (responses.length === 0) {
    return interaction.reply({ content: '📝 Chưa có custom response nào!', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(`📝 Custom Responses (${responses.length} items)`)
    .setTimestamp();

  const description = responses.slice(0, 10).map(resp => {
    const matchType = resp.isExactMatch ? '🎯 Exact' : '🔍 Contains';
    const embedInfo = resp.embedName ? `\n📎 Embed: \`${resp.embedName}\`` : '';
    return `**#${resp.id}** ${matchType}\n🔑 "${resp.trigger}"${embedInfo}\n💬 "${resp.response.substring(0, 60)}${resp.response.length > 60 ? '...' : ''}"`;
  }).join('\n\n');

  embed.setDescription(description);

  if (responses.length > 10) {
    embed.setFooter({ text: `... và ${responses.length - 10} items khác` });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// /response delete
async function handleResponseDeleteSlash(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Chỉ admin mới có thể xóa custom response!', ephemeral: true });
  }

  const id = interaction.options.getInteger('id');

  const success = await deleteCustomResponse(id, interaction.guild.id);

  if (success) {
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🗑️ Đã xóa custom response')
      .setDescription(`**ID:** #${id}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else {
    await interaction.reply({ content: `❌ Không tìm thấy custom response #${id} hoặc lỗi khi xóa!`, ephemeral: true });
  }
}

module.exports = {
  handleResponseAddSlash,
  handleResponseListSlash,
  handleResponseDeleteSlash
};
