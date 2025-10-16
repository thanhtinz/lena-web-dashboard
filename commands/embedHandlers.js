const { db } = require('../database/db');
const { customEmbeds } = require('../database/schema');
const { eq, and } = require('drizzle-orm');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logger, LogLevel, LogCategory } = require('../utils/logger');

function isAdmin(member) {
  return member && member.permissions.has(PermissionFlagsBits.Administrator);
}

function parseColor(colorStr) {
  if (!colorStr) return null;
  
  // Remove # if present
  const hex = colorStr.replace('#', '');
  
  // Validate hex color
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return null;
  }
  
  return parseInt(hex, 16);
}

function buildEmbedFromData(embedData) {
  const embed = new EmbedBuilder();
  
  if (embedData.title) embed.setTitle(embedData.title);
  if (embedData.description) embed.setDescription(embedData.description);
  if (embedData.color) {
    const color = parseColor(embedData.color);
    if (color !== null) embed.setColor(color);
  }
  
  if (embedData.authorName) {
    embed.setAuthor({
      name: embedData.authorName,
      iconURL: embedData.authorIcon || undefined
    });
  }
  
  if (embedData.footerText) {
    embed.setFooter({
      text: embedData.footerText,
      iconURL: embedData.footerIcon || undefined
    });
  }
  
  if (embedData.imageUrl) embed.setImage(embedData.imageUrl);
  if (embedData.thumbnailUrl) embed.setThumbnail(embedData.thumbnailUrl);
  
  if (embedData.fields) {
    try {
      const fields = JSON.parse(embedData.fields);
      if (Array.isArray(fields)) {
        embed.addFields(fields);
      }
    } catch (err) {
      // Invalid fields JSON, skip
    }
  }
  
  return embed;
}

async function handleEmbedCreate(interaction) {
  if (!isAdmin(interaction.member)) {
    return await interaction.reply({ 
      content: '❌ Chỉ admin mới có thể tạo embed!', 
      ephemeral: true 
    });
  }

  const name = interaction.options.getString('name');
  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');
  const color = interaction.options.getString('color');
  const serverId = interaction.guild.id;

  // Check if embed name already exists
  const existing = await db.select()
    .from(customEmbeds)
    .where(and(
      eq(customEmbeds.serverId, serverId),
      eq(customEmbeds.name, name)
    ))
    .limit(1);

  if (existing.length > 0) {
    return await interaction.reply({ 
      content: `❌ Embed với tên **${name}** đã tồn tại! Dùng \`/embed delete\` để xóa hoặc chọn tên khác.`, 
      ephemeral: true 
    });
  }

  // Validate color if provided
  if (color && parseColor(color) === null) {
    return await interaction.reply({ 
      content: '❌ Màu không hợp lệ! Sử dụng format hex: #FF0000 (hoặc FF0000)', 
      ephemeral: true 
    });
  }

  // Create embed
  await db.insert(customEmbeds).values({
    serverId,
    name,
    title: title || null,
    description: description || null,
    color: color || null,
    createdBy: interaction.user.id
  });

  await interaction.reply({ 
    content: `✅ Đã tạo embed **${name}**!\n\nDùng \`/embed show ${name}\` để xem hoặc \`/embed edit*\` để chỉnh sửa.`, 
    ephemeral: true 
  });

  await logger.log(
    LogLevel.INFO,
    LogCategory.CONFIG,
    `📝 Embed Created`,
    interaction.guild,
    `Name: ${name}\nBy: ${interaction.user.tag}`
  );
}

async function handleEmbedDelete(interaction) {
  if (!isAdmin(interaction.member)) {
    return await interaction.reply({ 
      content: '❌ Chỉ admin mới có thể xóa embed!', 
      ephemeral: true 
    });
  }

  const name = interaction.options.getString('name');
  const serverId = interaction.guild.id;

  const result = await db.delete(customEmbeds)
    .where(and(
      eq(customEmbeds.serverId, serverId),
      eq(customEmbeds.name, name)
    ))
    .returning();

  if (result.length === 0) {
    return await interaction.reply({ 
      content: `❌ Không tìm thấy embed **${name}**!`, 
      ephemeral: true 
    });
  }

  await interaction.reply({ 
    content: `✅ Đã xóa embed **${name}**!`, 
    ephemeral: true 
  });

  await logger.log(
    LogLevel.INFO,
    LogCategory.CONFIG,
    `🗑️ Embed Deleted`,
    interaction.guild,
    `Name: ${name}\nBy: ${interaction.user.tag}`
  );
}

async function handleEmbedList(interaction) {
  const serverId = interaction.guild.id;

  const embeds = await db.select()
    .from(customEmbeds)
    .where(eq(customEmbeds.serverId, serverId));

  if (embeds.length === 0) {
    return await interaction.reply({ 
      content: '❌ Server chưa có embed nào! Dùng `/embed create` để tạo.', 
      ephemeral: true 
    });
  }

  const embedList = embeds.map((e, i) => {
    const preview = e.title || e.description || '(Chưa có nội dung)';
    const shortPreview = preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
    return `${i + 1}. **${e.name}** - ${shortPreview}`;
  }).join('\n');

  const listEmbed = new EmbedBuilder()
    .setTitle('📋 Danh sách Custom Embeds')
    .setDescription(embedList)
    .setColor(0x5865F2)
    .setFooter({ text: `Tổng: ${embeds.length} embeds | Dùng /embed show <name> để xem chi tiết` });

  await interaction.reply({ 
    embeds: [listEmbed], 
    ephemeral: true 
  });
}

async function handleEmbedShow(interaction) {
  const name = interaction.options.getString('name');
  const serverId = interaction.guild.id;

  const result = await db.select()
    .from(customEmbeds)
    .where(and(
      eq(customEmbeds.serverId, serverId),
      eq(customEmbeds.name, name)
    ))
    .limit(1);

  if (result.length === 0) {
    return await interaction.reply({ 
      content: `❌ Không tìm thấy embed **${name}**!`, 
      ephemeral: true 
    });
  }

  const embedData = result[0];
  const embed = buildEmbedFromData(embedData);

  const infoEmbed = new EmbedBuilder()
    .setTitle(`🔍 Embed: ${name}`)
    .setDescription(
      `**Title:** ${embedData.title || '(Trống)'}\n` +
      `**Description:** ${embedData.description || '(Trống)'}\n` +
      `**Color:** ${embedData.color || '(Trống)'}\n` +
      `**Author:** ${embedData.authorName || '(Trống)'}\n` +
      `**Footer:** ${embedData.footerText || '(Trống)'}\n` +
      `**Image:** ${embedData.imageUrl || '(Trống)'}\n` +
      `**Thumbnail:** ${embedData.thumbnailUrl || '(Trống)'}`
    )
    .setColor(0x5865F2)
    .setFooter({ text: `Tạo bởi: ${embedData.createdBy} | Dùng /embed send ${name} để gửi` });

  await interaction.reply({ 
    content: '**Preview embed:**',
    embeds: [embed, infoEmbed], 
    ephemeral: true 
  });
}

async function handleEmbedSend(interaction) {
  if (!isAdmin(interaction.member)) {
    return await interaction.reply({ 
      content: '❌ Chỉ admin mới có thể gửi embed!', 
      ephemeral: true 
    });
  }

  const name = interaction.options.getString('name');
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  const serverId = interaction.guild.id;

  const result = await db.select()
    .from(customEmbeds)
    .where(and(
      eq(customEmbeds.serverId, serverId),
      eq(customEmbeds.name, name)
    ))
    .limit(1);

  if (result.length === 0) {
    return await interaction.reply({ 
      content: `❌ Không tìm thấy embed **${name}**!`, 
      ephemeral: true 
    });
  }

  const embedData = result[0];
  const embed = buildEmbedFromData(embedData);

  try {
    await channel.send({ embeds: [embed] });
    await interaction.reply({ 
      content: `✅ Đã gửi embed **${name}** vào ${channel}!`, 
      ephemeral: true 
    });

    await logger.log(
      LogLevel.INFO,
      LogCategory.COMMAND,
      `📤 Embed Sent`,
      interaction.guild,
      `Name: ${name}\nChannel: ${channel.name}\nBy: ${interaction.user.tag}`
    );
  } catch (error) {
    console.error('Error sending embed:', error);
    await interaction.reply({ 
      content: '❌ Không thể gửi embed! Kiểm tra quyền của bot trong channel.', 
      ephemeral: true 
    });
  }
}

async function handleEmbedEdit(interaction) {
  if (!isAdmin(interaction.member)) {
    return await interaction.reply({ 
      content: '❌ Chỉ admin mới có thể chỉnh sửa embed!', 
      ephemeral: true 
    });
  }

  const subcommand = interaction.options.getSubcommand();
  const name = interaction.options.getString('name');
  const serverId = interaction.guild.id;

  // Check if embed exists
  const result = await db.select()
    .from(customEmbeds)
    .where(and(
      eq(customEmbeds.serverId, serverId),
      eq(customEmbeds.name, name)
    ))
    .limit(1);

  if (result.length === 0) {
    return await interaction.reply({ 
      content: `❌ Không tìm thấy embed **${name}**!`, 
      ephemeral: true 
    });
  }

  const embedData = result[0];
  const updates = { updatedAt: new Date() };

  switch (subcommand) {
    case 'editall': {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color');

      if (title) updates.title = title;
      if (description) updates.description = description;
      if (color) {
        if (parseColor(color) === null) {
          return await interaction.reply({ 
            content: '❌ Màu không hợp lệ! Sử dụng format hex: #FF0000', 
            ephemeral: true 
          });
        }
        updates.color = color;
      }
      break;
    }

    case 'editauthor': {
      const authorName = interaction.options.getString('author_name');
      const authorIcon = interaction.options.getString('author_icon');

      updates.authorName = authorName;
      if (authorIcon) updates.authorIcon = authorIcon;
      break;
    }

    case 'editcolor': {
      const color = interaction.options.getString('color');
      
      if (parseColor(color) === null) {
        return await interaction.reply({ 
          content: '❌ Màu không hợp lệ! Sử dụng format hex: #FF0000', 
          ephemeral: true 
        });
      }
      
      updates.color = color;
      break;
    }

    case 'editdescription': {
      const description = interaction.options.getString('description');
      updates.description = description;
      break;
    }

    case 'editfooter': {
      const footerText = interaction.options.getString('footer_text');
      const footerIcon = interaction.options.getString('footer_icon');

      updates.footerText = footerText;
      if (footerIcon) updates.footerIcon = footerIcon;
      break;
    }

    case 'editimage': {
      const imageUrl = interaction.options.getString('image_url');
      updates.imageUrl = imageUrl;
      break;
    }

    case 'editthumbnail': {
      const thumbnailUrl = interaction.options.getString('thumbnail_url');
      updates.thumbnailUrl = thumbnailUrl;
      break;
    }

    case 'addfield': {
      const fieldName = interaction.options.getString('field_name');
      const fieldValue = interaction.options.getString('field_value');
      const inline = interaction.options.getBoolean('inline') || false;

      // Get current fields or create empty array
      let fields = [];
      if (embedData.fields) {
        try {
          fields = JSON.parse(embedData.fields);
        } catch (err) {
          fields = [];
        }
      }

      // Add new field
      fields.push({
        name: fieldName,
        value: fieldValue,
        inline: inline
      });

      // Limit to 25 fields (Discord limit)
      if (fields.length > 25) {
        return await interaction.reply({
          content: '❌ Embed chỉ có thể có tối đa 25 fields!',
          ephemeral: true
        });
      }

      updates.fields = JSON.stringify(fields);
      break;
    }

    case 'clearfields': {
      updates.fields = null;
      break;
    }
  }

  await db.update(customEmbeds)
    .set(updates)
    .where(and(
      eq(customEmbeds.serverId, serverId),
      eq(customEmbeds.name, name)
    ));

  await interaction.reply({ 
    content: `✅ Đã cập nhật embed **${name}**!\n\nDùng \`/embed show ${name}\` để xem thay đổi.`, 
    ephemeral: true 
  });

  await logger.log(
    LogLevel.INFO,
    LogCategory.CONFIG,
    `✏️ Embed Edited`,
    interaction.guild,
    `Name: ${name}\nAction: ${subcommand}\nBy: ${interaction.user.tag}`
  );
}

module.exports = {
  handleEmbedCreate,
  handleEmbedDelete,
  handleEmbedList,
  handleEmbedShow,
  handleEmbedSend,
  handleEmbedEdit
};
