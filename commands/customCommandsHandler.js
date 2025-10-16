const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

async function handleCustomCommand(message, args, db) {
  const { customCommands } = require('../database/schema');
  const { eq, and } = require('drizzle-orm');
  
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return message.reply('❌ Bạn cần quyền Manage Server để quản lý custom commands!');
  }

  const subcommand = args[0]?.toLowerCase();
  const serverId = message.guild.id;

  if (subcommand === 'create' || subcommand === 'add') {
    const commandName = args[1]?.toLowerCase();
    const response = args.slice(2).join(' ');

    if (!commandName || !response) {
      return message.reply('❌ Cú pháp: `!customcmd create <tên_lệnh> <nội_dung>`');
    }

    // Check if command already exists
    const existing = await db.select()
      .from(customCommands)
      .where(and(
        eq(customCommands.serverId, serverId),
        eq(customCommands.commandName, commandName)
      ))
      .limit(1);

    if (existing.length > 0) {
      return message.reply(`❌ Command \`${commandName}\` đã tồn tại! Dùng \`!customcmd edit\` để chỉnh sửa.`);
    }

    await db.insert(customCommands).values({
      serverId: serverId,
      commandName: commandName,
      response: response,
      createdBy: message.author.id
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ Custom Command đã tạo')
      .setDescription(`Command: \`!${commandName}\`\nResponse: ${response}`)
      .setColor(0x57F287)
      .setFooter({ text: 'Dùng !customcmd list để xem tất cả commands' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'edit') {
    const commandName = args[1]?.toLowerCase();
    const newResponse = args.slice(2).join(' ');

    if (!commandName || !newResponse) {
      return message.reply('❌ Cú pháp: `!customcmd edit <tên_lệnh> <nội_dung_mới>`');
    }

    const result = await db.update(customCommands)
      .set({ response: newResponse, updatedAt: new Date() })
      .where(and(
        eq(customCommands.serverId, serverId),
        eq(customCommands.commandName, commandName)
      ));

    const embed = new EmbedBuilder()
      .setTitle('✅ Custom Command đã cập nhật')
      .setDescription(`Command: \`!${commandName}\`\nResponse mới: ${newResponse}`)
      .setColor(0x5865F2)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'delete' || subcommand === 'remove') {
    const commandName = args[1]?.toLowerCase();

    if (!commandName) {
      return message.reply('❌ Cú pháp: `!customcmd delete <tên_lệnh>`');
    }

    await db.delete(customCommands)
      .where(and(
        eq(customCommands.serverId, serverId),
        eq(customCommands.commandName, commandName)
      ));

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Custom Command đã xóa')
      .setDescription(`Command \`!${commandName}\` đã bị xóa`)
      .setColor(0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'list') {
    const commands = await db.select()
      .from(customCommands)
      .where(eq(customCommands.serverId, serverId));

    if (commands.length === 0) {
      return message.reply('❌ Server chưa có custom commands nào!');
    }

    const commandList = commands
      .map(cmd => `• \`!${cmd.commandName}\` - ${cmd.enabled ? '✅' : '❌'} (Dùng: ${cmd.useCount})`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📋 Custom Commands')
      .setDescription(commandList)
      .setColor(0x5865F2)
      .setFooter({ text: `Tổng: ${commands.length} commands | ⭐ Premium feature` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'toggle') {
    const commandName = args[1]?.toLowerCase();

    if (!commandName) {
      return message.reply('❌ Cú pháp: `!customcmd toggle <tên_lệnh>`');
    }

    const existing = await db.select()
      .from(customCommands)
      .where(and(
        eq(customCommands.serverId, serverId),
        eq(customCommands.commandName, commandName)
      ))
      .limit(1);

    if (existing.length === 0) {
      return message.reply(`❌ Command \`${commandName}\` không tồn tại!`);
    }

    const newStatus = !existing[0].enabled;

    await db.update(customCommands)
      .set({ enabled: newStatus, updatedAt: new Date() })
      .where(and(
        eq(customCommands.serverId, serverId),
        eq(customCommands.commandName, commandName)
      ));

    const embed = new EmbedBuilder()
      .setTitle(`${newStatus ? '✅' : '❌'} Command ${newStatus ? 'đã bật' : 'đã tắt'}`)
      .setDescription(`Command \`!${commandName}\` đã được ${newStatus ? 'bật' : 'tắt'}`)
      .setColor(newStatus ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Show help
  const embed = new EmbedBuilder()
    .setTitle('⚙️ Custom Commands Help')
    .setDescription('⭐ Tính năng Premium - Tạo commands tùy chỉnh của riêng bạn!')
    .setColor(0x5865F2)
    .addFields(
      { name: 'Tạo command', value: '`!customcmd create <tên> <nội_dung>`', inline: false },
      { name: 'Chỉnh sửa', value: '`!customcmd edit <tên> <nội_dung_mới>`', inline: false },
      { name: 'Xóa command', value: '`!customcmd delete <tên>`', inline: false },
      { name: 'Danh sách', value: '`!customcmd list`', inline: false },
      { name: 'Bật/tắt', value: '`!customcmd toggle <tên>`', inline: false },
      { name: 'Biến động', value: '{user}, {server}, {channel}, {random}', inline: false }
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

// Execute custom command
async function executeCustomCommand(message, commandName, db) {
  const { customCommands, customEmbeds } = require('../database/schema');
  const { eq, and } = require('drizzle-orm');

  const command = await db.select()
    .from(customCommands)
    .where(and(
      eq(customCommands.serverId, message.guild.id),
      eq(customCommands.commandName, commandName),
      eq(customCommands.enabled, true)
    ))
    .limit(1);

  if (command.length === 0) {
    return null;
  }

  const cmd = command[0];

  // Check permissions (channels, roles)
  if (cmd.allowedChannels && cmd.allowedChannels.length > 0) {
    if (!cmd.allowedChannels.includes(message.channel.id)) {
      return null;
    }
  }

  if (cmd.allowedRoles && cmd.allowedRoles.length > 0) {
    const hasRole = message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.id));
    if (!hasRole) {
      return message.reply('❌ Bạn không có quyền sử dụng command này!');
    }
  }

  // Update use count
  await db.update(customCommands)
    .set({ useCount: cmd.useCount + 1 })
    .where(eq(customCommands.id, cmd.id));

  // Replace variables
  let response = cmd.response;
  response = response.replace(/{user}/g, message.author.toString());
  response = response.replace(/{server}/g, message.guild.name);
  response = response.replace(/{channel}/g, message.channel.toString());
  response = response.replace(/{random}/g, Math.floor(Math.random() * 100));

  // If has embed
  if (cmd.embedName) {
    const embed = await db.select()
      .from(customEmbeds)
      .where(and(
        eq(customEmbeds.serverId, message.guild.id),
        eq(customEmbeds.name, cmd.embedName)
      ))
      .limit(1);

    if (embed.length > 0) {
      const e = embed[0];
      const customEmbed = new EmbedBuilder()
        .setColor(parseInt(e.color?.replace('#', '') || '5865F2', 16));

      if (e.title) customEmbed.setTitle(e.title);
      if (e.description) customEmbed.setDescription(e.description);
      if (e.authorName) {
        const authorData = { name: e.authorName };
        if (e.authorIcon) authorData.iconURL = e.authorIcon;
        customEmbed.setAuthor(authorData);
      }
      if (e.footerText) {
        const footerData = { text: e.footerText };
        if (e.footerIcon) footerData.iconURL = e.footerIcon;
        customEmbed.setFooter(footerData);
      }
      if (e.thumbnailUrl) customEmbed.setThumbnail(e.thumbnailUrl);
      if (e.imageUrl) customEmbed.setImage(e.imageUrl);

      return message.reply({ content: response || null, embeds: [customEmbed] });
    }
  }

  return message.reply(response);
}

module.exports = {
  handleCustomCommand,
  executeCustomCommand
};
