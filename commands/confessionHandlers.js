const { db, pool } = require('../database/db');
const { confessionConfigs, confessions, confessionReplies } = require('../database/schema');
const { eq, and } = require('drizzle-orm');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { logger, LogLevel, LogCategory } = require('../utils/logger');
const { containsBlacklistedContent } = require('../utils/blacklistFilter');
const cron = require('node-cron');

function isAdmin(member) {
  return member && member.permissions.has('Administrator');
}

// Random màu cho confession embed (giống trong hình)
function getRandomConfessionColor() {
  const colors = [
    0x57F287, // Green
    0x5865F2, // Blue  
    0xEB459E, // Pink
    0x9B59B6, // Purple
    0xE67E22, // Orange
    0x1ABC9C  // Teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

async function handleConfession(interaction) {
  try {
    const content = interaction.options.getString('content');
    const serverId = interaction.guild?.id;
    const userId = interaction.user.id;

    if (!serverId) {
      return await interaction.reply({ 
        content: '❌ Lệnh này chỉ có thể dùng trong server!', 
        ephemeral: true 
      });
    }

    const blacklistResult = containsBlacklistedContent(content);
    if (blacklistResult.blocked) {
      return await interaction.reply({ 
        content: `🔒 Confession của bạn chứa nội dung không phù hợp: **${blacklistResult.keyword}**\nVui lòng chỉnh sửa và thử lại!`, 
        ephemeral: true 
      });
    }

    const config = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);

    if (!config.length || !config[0].channelId || !config[0].isActive) {
      return await interaction.reply({ 
        content: '❌ Hệ thống confession chưa được setup! Admin vui lòng dùng `/confessionsetup channel` để cài đặt.', 
        ephemeral: true 
      });
    }

    const confessionChannel = await interaction.guild.channels.fetch(config[0].channelId);
    if (!confessionChannel) {
      return await interaction.reply({ 
        content: '❌ Kênh confession không tồn tại! Admin vui lòng setup lại.', 
        ephemeral: true 
      });
    }

    const result = await db.insert(confessions).values({
      serverId,
      userId,
      username: interaction.user.tag,
      content,
      status: 'active'
    }).returning();

    const confessionId = result[0].id;

    const replyButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confession_reply_${confessionId}`)
          .setLabel(config[0].replyButtonLabel || '💬 Trả lời')
          .setStyle(ButtonStyle.Primary)
      );

    // Tạo embed đẹp cho confession
    const confessionEmbed = new EmbedBuilder()
      .setTitle(`Anonymous Confession (#${confessionId})`)
      .setDescription(content)
      .setColor(getRandomConfessionColor())
      .setTimestamp();

    // Post confession vào channel trước
    const confessionMessage = await confessionChannel.send({
      embeds: [confessionEmbed],
      components: [replyButton]
    });

    // Tạo thread từ message đó
    const thread = await confessionMessage.startThread({
      name: `Confession #${confessionId}`,
      autoArchiveDuration: 1440,
      reason: 'Confession thread'
    });

    await db.update(confessions)
      .set({ 
        threadId: thread.id,
        threadUrl: thread.url 
      })
      .where(eq(confessions.id, confessionId));

    await thread.send({
      content: `💡 **Hướng dẫn trả lời:**\n• Dùng nút "💬 Trả lời" hoặc lệnh \`/reply confession_id:${confessionId}\`\n• Mọi reply sẽ được kiểm duyệt để tránh spam và nội dung 18+\n• Hãy tôn trọng người gửi confession và giữ thái độ lịch sự! 💕`
    });

    // Premium Feature: Log confession author to Discord channel (if configured)
    if (config[0].logConfessions && config[0].logChannelId) {
      try {
        const logChannel = await interaction.guild.channels.fetch(config[0].logChannelId);
        if (logChannel && logChannel.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setTitle(`🔒 Confession Author Log`)
            .setDescription(`**Confession #${confessionId}**`)
            .addFields(
              { name: '👤 Author', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
              { name: '📍 Thread', value: `[View Thread](${thread.url})`, inline: true },
              { name: '📝 Content Preview', value: content.substring(0, 200) + (content.length > 200 ? '...' : ''), inline: false }
            )
            .setColor(0x9B59B6)
            .setTimestamp()
            .setFooter({ text: '🔒 Moderator Only - Keep Private' });
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        console.error('Error logging confession author to Discord:', error);
      }
    }

    await interaction.reply({ 
      content: `✅ Confession của bạn đã được gửi! ID: #${confessionId}\n📍 Xem tại: ${thread.url}`, 
      ephemeral: true 
    });

    await logger.log(
      LogLevel.INFO,
      LogCategory.COMMAND,
      `📝 Confession Sent`,
      interaction.guild,
      `ID: #${confessionId}\nUser: ${interaction.user.tag}\nThread: ${thread.url}`
    );

  } catch (error) {
    console.error('Error handling confession:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi gửi confession! Vui lòng thử lại sau.', 
      ephemeral: true 
    });
  }
}

async function handleReply(interaction) {
  try {
    const confessionId = interaction.options.getInteger('confession_id');
    const content = interaction.options.getString('content');
    const userId = interaction.user.id;
    const serverId = interaction.guild?.id;

    if (!serverId) {
      return await interaction.reply({ 
        content: '❌ Lệnh này chỉ có thể dùng trong server!', 
        ephemeral: true 
      });
    }

    const blacklistResult = containsBlacklistedContent(content);
    if (blacklistResult.blocked) {
      return await interaction.reply({ 
        content: `🔒 Reply của bạn chứa nội dung không phù hợp: **${blacklistResult.keyword}**\nVui lòng chỉnh sửa và thử lại!`, 
        ephemeral: true 
      });
    }

    const confession = await db.select()
      .from(confessions)
      .where(and(
        eq(confessions.id, confessionId),
        eq(confessions.serverId, serverId)
      ))
      .limit(1);

    if (!confession.length) {
      return await interaction.reply({ 
        content: `❌ Không tìm thấy confession #${confessionId} trong server này!`, 
        ephemeral: true 
      });
    }

    if (confession[0].status !== 'active') {
      return await interaction.reply({ 
        content: `❌ Confession #${confessionId} đã bị xóa hoặc ẩn!`, 
        ephemeral: true 
      });
    }

    // Get confession config to check reply approval setting
    const config = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);

    const requireApproval = config.length > 0 ? config[0].requireReplyApproval : false;

    // Insert reply with appropriate status based on setting
    await db.insert(confessionReplies).values({
      confessionId,
      userId,
      content,
      status: requireApproval ? 'pending' : 'approved',
      isModerated: !requireApproval,
      moderatedBy: requireApproval ? null : 'auto'
    });

    // Only post to thread if auto-approved
    let threadUrl = null;
    if (!requireApproval && confession[0].threadId) {
      try {
        // Tạo embed đẹp cho reply (ẩn danh)
        const replyEmbed = new EmbedBuilder()
          .setTitle(`💬 Confession Reply (#${confessionId})`)
          .setDescription(content)
          .setColor(0xFEE75C) // Màu vàng nhẹ để phân biệt với confession
          .setFooter({ text: 'Reply ẩn danh' })
          .setTimestamp();

        if (config.length && config[0].channelId) {
          const channel = await interaction.guild.channels.fetch(config[0].channelId);
          const thread = await channel.threads.fetch(confession[0].threadId);
          
          await thread.send({
            embeds: [replyEmbed]
          });
          
          threadUrl = thread.url;
        }
      } catch (error) {
        console.error('Error posting reply to thread:', error);
      }
    }

    // Reply ephemeral với thông báo phù hợp
    const successMessage = requireApproval
      ? `⏳ Reply của bạn đã được gửi và đang chờ admin duyệt cho Confession #${confessionId}!`
      : `✅ Reply của bạn đã được gửi vào Confession #${confessionId}!${threadUrl ? `\n📍 Xem tại: ${threadUrl}` : ''}`;

    await interaction.reply({ 
      content: successMessage, 
      ephemeral: true 
    });

    await logger.log(
      LogLevel.INFO,
      LogCategory.COMMAND,
      `💬 Confession Reply`,
      interaction.guild,
      `Confession #${confessionId}\nUser: ${interaction.user.tag}`
    );

  } catch (error) {
    console.error('Error handling reply:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi gửi reply! Vui lòng thử lại sau.', 
      ephemeral: true 
    });
  }
}

async function handleConfessionSetup(interaction) {
  try {
    if (!isAdmin(interaction.member)) {
      return await interaction.reply({ 
        content: '❌ Chỉ admin mới có thể cài đặt confession!', 
        ephemeral: true 
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;

    switch (subcommand) {
      case 'channel': {
        const channel = interaction.options.getChannel('target');
        
        if (channel.type !== ChannelType.GuildText) {
          return await interaction.reply({ 
            content: '❌ Vui lòng chọn một text channel!', 
            ephemeral: true 
          });
        }

        const existing = await db.select()
          .from(confessionConfigs)
          .where(eq(confessionConfigs.serverId, serverId))
          .limit(1);

        if (existing.length) {
          await db.update(confessionConfigs)
            .set({ 
              channelId: channel.id, 
              isActive: true,
              updatedAt: new Date()
            })
            .where(eq(confessionConfigs.serverId, serverId));
        } else {
          await db.insert(confessionConfigs).values({
            serverId,
            channelId: channel.id,
            isActive: true
          });
        }

        await interaction.reply({ 
          content: `✅ Đã đặt kênh confession thành ${channel}!\n\nNgười dùng có thể gửi confession bằng:\n• \`/confession\`\n• DM bot với: \`confession <nội dung>\`\n• Button (dùng \`/confessionsetup buttons\` để tùy chỉnh)`, 
          ephemeral: true 
        });

        await logger.log(
          LogLevel.INFO,
          LogCategory.CONFIG,
          `⚙️ Confession Setup`,
          interaction.guild,
          `Channel set to: ${channel.name}\nBy: ${interaction.user.tag}`
        );
        break;
      }

      case 'remove': {
        await db.update(confessionConfigs)
          .set({ 
            channelId: null, 
            isActive: false,
            updatedAt: new Date()
          })
          .where(eq(confessionConfigs.serverId, serverId));

        await interaction.reply({ 
          content: `✅ Đã xóa cấu hình confession!`, 
          ephemeral: true 
        });

        await logger.log(
          LogLevel.INFO,
          LogCategory.CONFIG,
          `⚙️ Confession Removed`,
          interaction.guild,
          `By: ${interaction.user.tag}`
        );
        break;
      }

      case 'buttons': {
        const confessionButton = interaction.options.getString('confession_button');
        const replyButton = interaction.options.getString('reply_button');

        if (!confessionButton && !replyButton) {
          return await interaction.reply({ 
            content: '❌ Vui lòng cung cấp ít nhất một tên nút!', 
            ephemeral: true 
          });
        }

        const updates = {};
        if (confessionButton) updates.buttonLabel = confessionButton;
        if (replyButton) updates.replyButtonLabel = replyButton;
        updates.updatedAt = new Date();

        await db.update(confessionConfigs)
          .set(updates)
          .where(eq(confessionConfigs.serverId, serverId));

        let message = '✅ Đã cập nhật tên nút:\n';
        if (confessionButton) message += `• Nút Confession: ${confessionButton}\n`;
        if (replyButton) message += `• Nút Reply: ${replyButton}\n`;

        await interaction.reply({ 
          content: message, 
          ephemeral: true 
        });
        break;
      }

      case 'status': {
        const config = await db.select()
          .from(confessionConfigs)
          .where(eq(confessionConfigs.serverId, serverId))
          .limit(1);

        if (!config.length) {
          return await interaction.reply({ 
            content: '❌ Chưa có cấu hình confession! Dùng `/confessionsetup channel` để setup.', 
            ephemeral: true 
          });
        }

        const channel = config[0].channelId 
          ? await interaction.guild.channels.fetch(config[0].channelId).catch(() => null)
          : null;

        const totalConfessions = await db.select()
          .from(confessions)
          .where(eq(confessions.serverId, serverId));

        const status = `📊 **Trạng thái Confession System**\n\n` +
          `**Kênh:** ${channel ? channel.toString() : '❌ Chưa setup'}\n` +
          `**Trạng thái:** ${config[0].isActive ? '✅ Hoạt động' : '❌ Tắt'}\n` +
          `**Nút Confession:** ${config[0].buttonLabel}\n` +
          `**Nút Reply:** ${config[0].replyButtonLabel}\n` +
          `**Tổng confessions:** ${totalConfessions.length}\n\n` +
          `*Cập nhật lần cuối: <t:${Math.floor(new Date(config[0].updatedAt).getTime() / 1000)}:R>*`;

        await interaction.reply({ 
          content: status, 
          ephemeral: true 
        });
        break;
      }

      case 'clear': {
        const confessionsToDelete = await db.select()
          .from(confessions)
          .where(eq(confessions.serverId, serverId));

        if (confessionsToDelete.length === 0) {
          return await interaction.reply({ 
            content: '❌ Không có confession nào để xóa!', 
            ephemeral: true 
          });
        }

        const confirmMessage = `⚠️ **CẢNH BÁO: Hành động này không thể hoàn tác!**\n\n` +
          `Bạn có chắc muốn **XÓA TOÀN BỘ ${confessionsToDelete.length} confession** và reply của server này?`;

        const confirmButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`confession_clear_confirm_${serverId}`)
              .setLabel('✅ Xác nhận xóa')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(`confession_clear_cancel_${serverId}`)
              .setLabel('❌ Hủy bỏ')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.reply({ 
          content: confirmMessage, 
          components: [confirmButton],
          ephemeral: true 
        });
        break;
      }
    }

  } catch (error) {
    console.error('Error in confession setup:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra! Vui lòng thử lại sau.', 
      ephemeral: true 
    });
  }
}

async function handleConfessionButton(interaction) {
  const customId = interaction.customId;
  
  // Button: Gửi Confession (mở modal)
  if (customId === 'send_confession') {
    const serverId = interaction.guild?.id;
    
    if (!serverId) {
      return await interaction.reply({ 
        content: '❌ Button này chỉ hoạt động trong server!', 
        ephemeral: true 
      });
    }

    // Kiểm tra xem confession có được setup chưa
    const config = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);

    if (!config.length || !config[0].channelId || !config[0].isActive) {
      return await interaction.reply({ 
        content: '❌ Hệ thống confession chưa được setup! Admin vui lòng dùng `/confessionsetup channel` để cài đặt.', 
        ephemeral: true 
      });
    }

    // Mở modal để gửi confession
    const modal = new ModalBuilder()
      .setCustomId('send_confession_modal')
      .setTitle('📝 Gửi Confession Ẩn Danh');

    const confessionInput = new TextInputBuilder()
      .setCustomId('confession_content')
      .setLabel('Nội dung confession')
      .setPlaceholder('Viết điều bạn muốn chia sẻ một cách ẩn danh...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(2000);

    const actionRow = new ActionRowBuilder().addComponents(confessionInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  } 
  // Button: Reply Confession (mở modal)
  else if (customId.startsWith('confession_reply_')) {
    const confessionId = parseInt(customId.replace('confession_reply_', ''));
    
    const modal = new ModalBuilder()
      .setCustomId(`confession_reply_modal_${confessionId}`)
      .setTitle(`Trả lời Confession #${confessionId}`);

    const replyInput = new TextInputBuilder()
      .setCustomId('reply_content')
      .setLabel('Nội dung trả lời')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1000);

    const actionRow = new ActionRowBuilder().addComponents(replyInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  } else if (customId.startsWith('confession_clear_confirm_')) {
    const serverId = customId.replace('confession_clear_confirm_', '');
    
    if (!isAdmin(interaction.member)) {
      return await interaction.update({ 
        content: '❌ Chỉ admin mới có thể xóa confession!', 
        components: [],
        ephemeral: true 
      });
    }

    try {
      const confessionsToDelete = await db.select()
        .from(confessions)
        .where(eq(confessions.serverId, serverId));

      const confessionIds = confessionsToDelete.map(c => c.id);

      if (confessionIds.length > 0) {
        for (const confessionId of confessionIds) {
          await db.delete(confessionReplies)
            .where(eq(confessionReplies.confessionId, confessionId));
        }
      }

      await db.delete(confessions)
        .where(eq(confessions.serverId, serverId));

      await interaction.update({ 
        content: `✅ Đã xóa **${confessionsToDelete.length}** confession và tất cả reply liên quan!`, 
        components: [],
        ephemeral: true 
      });

      await logger.log(
        LogLevel.WARN,
        LogCategory.CONFIG,
        `🗑️ Confession History Cleared`,
        interaction.guild,
        `Deleted: ${confessionsToDelete.length} confessions\nBy: ${interaction.user.tag}`
      );
    } catch (error) {
      console.error('Error clearing confessions:', error);
      await interaction.update({ 
        content: '❌ Có lỗi xảy ra khi xóa confession!', 
        components: [],
        ephemeral: true 
      });
    }
  } else if (customId.startsWith('confession_clear_cancel_')) {
    await interaction.update({ 
      content: '❌ Đã hủy bỏ thao tác xóa confession.', 
      components: [],
      ephemeral: true 
    });
  }
}

async function handleConfessionModal(interaction) {
  try {
    const customId = interaction.customId;
    
    // Modal: Gửi Confession từ button
    if (customId === 'send_confession_modal') {
      const content = interaction.fields.getTextInputValue('confession_content');
      const serverId = interaction.guild?.id;
      const userId = interaction.user.id;

      if (!serverId) {
        return await interaction.reply({ 
          content: '❌ Lệnh này chỉ có thể dùng trong server!', 
          ephemeral: true 
        });
      }

      const blacklistResult = containsBlacklistedContent(content);
      if (blacklistResult.blocked) {
        return await interaction.reply({ 
          content: `🔒 Confession của bạn chứa nội dung không phù hợp: **${blacklistResult.keyword}**\nVui lòng chỉnh sửa và thử lại!`, 
          ephemeral: true 
        });
      }

      const config = await db.select()
        .from(confessionConfigs)
        .where(eq(confessionConfigs.serverId, serverId))
        .limit(1);

      if (!config.length || !config[0].channelId || !config[0].isActive) {
        return await interaction.reply({ 
          content: '❌ Hệ thống confession chưa được setup! Admin vui lòng dùng `/confessionsetup channel` để cài đặt.', 
          ephemeral: true 
        });
      }

      const confessionChannel = await interaction.guild.channels.fetch(config[0].channelId);
      if (!confessionChannel) {
        return await interaction.reply({ 
          content: '❌ Kênh confession không tồn tại! Admin vui lòng setup lại.', 
          ephemeral: true 
        });
      }

      const result = await db.insert(confessions).values({
        serverId,
        userId,
        content,
        status: 'active'
      }).returning();

      const confessionId = result[0].id;

      const replyButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`confession_reply_${confessionId}`)
            .setLabel(config[0].replyButtonLabel || '💬 Trả lời')
            .setStyle(ButtonStyle.Primary)
        );

      const confessionEmbed = new EmbedBuilder()
        .setTitle(`Anonymous Confession (#${confessionId})`)
        .setDescription(content)
        .setColor(getRandomConfessionColor())
        .setTimestamp();

      const confessionMessage = await confessionChannel.send({
        embeds: [confessionEmbed],
        components: [replyButton]
      });

      const thread = await confessionMessage.startThread({
        name: `Confession #${confessionId}`,
        autoArchiveDuration: 1440,
        reason: 'Confession thread'
      });

      await db.update(confessions)
        .set({ threadId: thread.id })
        .where(eq(confessions.id, confessionId));

      await thread.send({
        content: `💡 **Hướng dẫn trả lời:**\n• Dùng nút "💬 Trả lời" hoặc lệnh \`/reply confession_id:${confessionId}\`\n• Mọi reply sẽ được kiểm duyệt để tránh spam và nội dung 18+\n• Hãy tôn trọng người gửi confession và giữ thái độ lịch sự! 💕`
      });

      await interaction.reply({ 
        content: `✅ Confession của bạn đã được gửi! ID: #${confessionId}\n📍 Xem tại: ${thread.url}`, 
        ephemeral: true 
      });

      await logger.log(
        LogLevel.INFO,
        LogCategory.COMMAND,
        `📝 Confession Sent (Button)`,
        interaction.guild,
        `ID: #${confessionId}\nUser: ${interaction.user.tag}\nThread: ${thread.url}`
      );
    }
    // Modal: Reply Confession
    else if (customId.startsWith('confession_reply_modal_')) {
      const confessionId = parseInt(customId.replace('confession_reply_modal_', ''));
      const content = interaction.fields.getTextInputValue('reply_content');
      const userId = interaction.user.id;
      const serverId = interaction.guild.id;

      const blacklistResult = containsBlacklistedContent(content);
      if (blacklistResult.blocked) {
        return await interaction.reply({ 
          content: `🔒 Reply của bạn chứa nội dung không phù hợp: **${blacklistResult.keyword}**\nVui lòng chỉnh sửa và thử lại!`, 
          ephemeral: true 
        });
      }

      const confession = await db.select()
        .from(confessions)
        .where(and(
          eq(confessions.id, confessionId),
          eq(confessions.serverId, serverId)
        ))
        .limit(1);

      if (!confession.length || confession[0].status !== 'active') {
        return await interaction.reply({ 
          content: `❌ Confession không tồn tại hoặc đã bị xóa!`, 
          ephemeral: true 
        });
      }

      await db.insert(confessionReplies).values({
        confessionId,
        userId,
        content,
        status: 'approved',
        isModerated: true,
        moderatedBy: 'auto'
      });

      // Tạo embed đẹp cho reply (ẩn danh)
      const replyEmbed = new EmbedBuilder()
        .setTitle(`💬 Confession Reply (#${confessionId})`)
        .setDescription(content)
        .setColor(0xFEE75C) // Màu vàng nhẹ để phân biệt với confession
        .setFooter({ text: 'Reply ẩn danh' })
        .setTimestamp();

      // Gửi reply vào thread confession
      let threadUrl = null;
      if (confession[0].threadId) {
        try {
          const config = await db.select()
            .from(confessionConfigs)
            .where(eq(confessionConfigs.serverId, serverId))
            .limit(1);

          if (config.length && config[0].channelId) {
            const channel = await interaction.guild.channels.fetch(config[0].channelId);
            const thread = await channel.threads.fetch(confession[0].threadId);
            
            await thread.send({
              embeds: [replyEmbed]
            });
            
            threadUrl = thread.url;
          }
        } catch (error) {
          console.error('Error posting reply to thread:', error);
        }
      }

      // Reply ephemeral để thông báo thành công
      await interaction.reply({ 
        content: `✅ Reply của bạn đã được gửi vào Confession #${confessionId}!${threadUrl ? `\n📍 Xem tại: ${threadUrl}` : ''}`, 
        ephemeral: true 
      });

      await logger.log(
        LogLevel.INFO,
        LogCategory.COMMAND,
        `💬 Confession Reply (Button)`,
        interaction.guild,
        `Confession #${confessionId}\nUser: ${interaction.user.tag}`
      );
    }
  } catch (error) {
    console.error('Error handling confession modal:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra! Vui lòng thử lại sau.', 
      ephemeral: true 
    });
  }
}

async function handleConfessionPanel(interaction) {
  try {
    if (!isAdmin(interaction.member)) {
      return await interaction.reply({ 
        content: '❌ Chỉ admin mới có thể tạo confession panel!', 
        ephemeral: true 
      });
    }

    const serverId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    // Kiểm tra xem confession có được setup chưa
    const config = await db.select()
      .from(confessionConfigs)
      .where(eq(confessionConfigs.serverId, serverId))
      .limit(1);

    if (!config.length || !config[0].channelId || !config[0].isActive) {
      return await interaction.reply({ 
        content: '❌ Hệ thống confession chưa được setup! Admin vui lòng dùng `/confessionsetup channel` để cài đặt trước.', 
        ephemeral: true 
      });
    }

    const buttonLabel = config[0].buttonLabel || '📝 Gửi Confession';

    const confessionButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('send_confession')
          .setLabel(buttonLabel)
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📝')
      );

    const panelEmbed = new EmbedBuilder()
      .setTitle('📮 Anonymous Confession')
      .setDescription(
        '**Gửi confession ẩn danh của bạn!**\n\n' +
        '• Click nút bên dưới để mở form gửi confession\n' +
        '• Mọi confession đều hoàn toàn ẩn danh\n' +
        '• Tôn trọng người khác và tránh nội dung 18+\n' +
        '• Admin có quyền xóa confession vi phạm quy tắc\n\n' +
        `💡 Confession sẽ được gửi đến: <#${config[0].channelId}>`
      )
      .setColor(0x5865F2)
      .setFooter({ text: 'Hãy cẩn thận với lời nói của bạn! 💕' })
      .setTimestamp();

    await channel.send({
      embeds: [panelEmbed],
      components: [confessionButton]
    });

    await interaction.reply({ 
      content: `✅ Đã tạo Confession Panel tại ${channel}!\nUser có thể click button để gửi confession ẩn danh.`, 
      ephemeral: true 
    });

    await logger.log(
      LogLevel.INFO,
      LogCategory.CONFIG,
      `📮 Confession Panel Created`,
      interaction.guild,
      `Channel: ${channel.name}\nBy: ${interaction.user.tag}`
    );

  } catch (error) {
    console.error('Error creating confession panel:', error);
    await interaction.reply({ 
      content: '❌ Có lỗi xảy ra khi tạo confession panel!', 
      ephemeral: true 
    });
  }
}

// Check and post approved confession replies
async function checkAndPostApprovedReplies(client) {
  try {
    // Get all approved but not posted replies
    const approvedReplies = await db.select({
      replyId: confessionReplies.id,
      confessionId: confessionReplies.confessionId,
      userId: confessionReplies.userId,
      content: confessionReplies.content,
      threadId: confessions.threadId,
      threadUrl: confessions.threadUrl,
      serverId: confessions.serverId
    })
      .from(confessionReplies)
      .innerJoin(confessions, eq(confessionReplies.confessionId, confessions.id))
      .where(and(
        eq(confessionReplies.status, 'approved'),
        eq(confessionReplies.isPosted, false)
      ));

    for (const reply of approvedReplies) {
      try {
        if (!reply.threadId) continue;

        const guild = await client.guilds.fetch(reply.serverId).catch(() => null);
        if (!guild) continue;

        const thread = await guild.channels.fetch(reply.threadId).catch(() => null);
        if (!thread) continue;

        // Post reply to thread
        const replyEmbed = new EmbedBuilder()
          .setColor(0x00D9FF)
          .setDescription(reply.content)
          .setFooter({ text: `Reply #${reply.replyId} • Approved by Admin` })
          .setTimestamp();

        await thread.send({ embeds: [replyEmbed] });

        // Mark as posted
        await db.update(confessionReplies)
          .set({ isPosted: true })
          .where(eq(confessionReplies.id, reply.replyId));

        console.log(`✅ Posted approved reply #${reply.replyId} to thread ${reply.threadId}`);
      } catch (error) {
        console.error(`❌ Failed to post approved reply #${reply.replyId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error checking approved replies:', error.message);
  }
}

// Start cron job to check approved replies every minute
function startApprovedRepliesChecker(client) {
  cron.schedule('*/1 * * * *', () => {
    checkAndPostApprovedReplies(client);
  });
  
  console.log('✅ Started approved replies checker (runs every minute)');
}

module.exports = {
  handleConfession,
  handleReply,
  handleConfessionSetup,
  handleConfessionPanel,
  handleConfessionButton,
  handleConfessionModal,
  getRandomConfessionColor,
  checkAndPostApprovedReplies,
  startApprovedRepliesChecker
};
