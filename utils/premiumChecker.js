const { checkUserPremium, hasFeatureAccess } = require('./premiumService');
const { EmbedBuilder } = require('discord.js');

/**
 * Check if user has premium and show error message if not
 * @param {Message|Interaction} messageOrInteraction
 * @param {string} featureName - Optional specific feature to check
 * @returns {Promise<{isPremium: boolean, subscription: object|null, plan: object|null}>}
 */
async function requirePremium(messageOrInteraction, featureName = null) {
  const userId = messageOrInteraction.author?.id || messageOrInteraction.user?.id;
  const premiumStatus = await checkUserPremium(userId);

  if (!premiumStatus.isPremium) {
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('⭐ Tính năng Premium')
      .setDescription('Tính năng này chỉ dành cho thành viên Premium!')
      .addFields(
        { 
          name: '💎 Lợi ích Premium', 
          value: '• Custom Bot riêng\n• Lệnh tùy chỉnh không giới hạn\n• Giveaway không giới hạn\n• Ưu tiên phản hồi nhanh\n• Hỗ trợ VIP 24/7' 
        },
        { 
          name: '🚀 Nâng cấp ngay', 
          value: 'Truy cập [Website](https://lunabot.net/pricing) để nâng cấp Premium' 
        }
      )
      .setFooter({ text: 'Chỉ từ 49,000đ/tháng' })
      .setTimestamp();

    if (messageOrInteraction.reply) {
      await messageOrInteraction.reply({ embeds: [embed], ephemeral: true });
    } else if (messageOrInteraction.editReply) {
      await messageOrInteraction.editReply({ embeds: [embed] });
    }
  }

  // If specific feature is required, check for it
  if (featureName && premiumStatus.isPremium) {
    const hasAccess = await hasFeatureAccess(userId, featureName);
    if (!hasAccess) {
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('⭐ Nâng cấp gói Premium')
        .setDescription(`Tính năng **${featureName}** yêu cầu gói Premium cao hơn!`)
        .addFields({
          name: '📦 Gói hiện tại',
          value: premiumStatus.plan?.name || 'Premium',
          inline: true
        })
        .setFooter({ text: 'Nâng cấp tại: lunabot.net/pricing' })
        .setTimestamp();

      if (messageOrInteraction.reply) {
        await messageOrInteraction.reply({ embeds: [embed], ephemeral: true });
      }

      return { ...premiumStatus, hasFeatureAccess: false };
    }
  }

  return { ...premiumStatus, hasFeatureAccess: true };
}

/**
 * Show premium upgrade message
 */
async function showPremiumUpgrade(messageOrInteraction, feature = null) {
  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('⭐ Nâng cấp lên Premium')
    .setDescription(feature ? `Tính năng **${feature}** chỉ dành cho Premium members!` : 'Mở khóa tất cả tính năng với Premium!')
    .addFields(
      {
        name: '💎 Basic - 49,000đ/tháng',
        value: '• 1 Custom Bot\n• 50 Custom Commands\n• 10 Giveaways/tháng',
        inline: true
      },
      {
        name: '🚀 Pro - 99,000đ/tháng',
        value: '• 3 Custom Bots\n• 200 Custom Commands\n• Giveaways không giới hạn',
        inline: true
      },
      {
        name: '💼 Business - 199,000đ/tháng',
        value: '• 10 Custom Bots\n• Commands không giới hạn\n• API Access',
        inline: true
      }
    )
    .setFooter({ text: 'Nâng cấp ngay tại lunabot.net/pricing 🌸' })
    .setTimestamp();

  if (messageOrInteraction.reply) {
    await messageOrInteraction.reply({ embeds: [embed] });
  } else if (messageOrInteraction.editReply) {
    await messageOrInteraction.editReply({ embeds: [embed] });
  }
}

/**
 * Premium-only command wrapper
 */
function premiumOnly(commandHandler, featureName = null) {
  return async function(message, args) {
    const premiumCheck = await requirePremium(message, featureName);
    
    if (!premiumCheck.isPremium || (featureName && !premiumCheck.hasFeatureAccess)) {
      return; // Error message already shown
    }

    // Execute the actual command
    return await commandHandler(message, args);
  };
}

module.exports = {
  requirePremium,
  showPremiumUpgrade,
  premiumOnly
};
