const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkUserPremium, getUserSubscriptions, getPricingPlans } = require('../utils/premiumService');

/**
 * Premium status command - Shows user's premium subscription status
 */
async function handlePremiumCommand(message) {
  try {
    const userId = message.author.id;
    const { isPremium, subscription, plan } = await checkUserPremium(userId);

    const embed = new EmbedBuilder()
      .setColor(isPremium ? '#FFD700' : '#3B82F6')
      .setAuthor({
        name: `${message.author.username} - Trạng thái Premium`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    if (isPremium && subscription && plan) {
      const startDate = subscription.startsAt ? new Date(subscription.startsAt).toLocaleDateString('vi-VN') : 'N/A';
      const endDate = subscription.endsAt ? new Date(subscription.endsAt).toLocaleDateString('vi-VN') : 'Không giới hạn';
      
      // Ensure features is an array
      let features = plan.features || [];
      if (!Array.isArray(features)) {
        console.error('Features is not an array:', features);
        features = [];
      }
      
      const featuresList = features.length > 0 
        ? features.map(f => `✨ ${f}`).join('\n')
        : 'Không có thông tin';

      embed
        .setTitle('⭐ Bạn đang là thành viên Premium!')
        .setDescription('Cảm ơn bạn đã ủng hộ Lena! 💖')
        .addFields(
          { 
            name: '📦 Gói Premium', 
            value: `**${plan.name || 'Premium'}**\n${plan.billingCycle === 'monthly' ? '📅 Hàng tháng' : '📅 Hàng năm'}`, 
            inline: true 
          },
          { 
            name: '💳 Trạng thái', 
            value: subscription.status === 'active' ? '✅ Đang hoạt động' : subscription.status, 
            inline: true 
          },
          { 
            name: '💰 Giá', 
            value: `${plan.priceVnd?.toLocaleString('vi-VN') || 'N/A'}đ`, 
            inline: true 
          },
          { 
            name: '📅 Ngày bắt đầu', 
            value: startDate, 
            inline: true 
          },
          { 
            name: '📅 Ngày hết hạn', 
            value: endDate, 
            inline: true 
          },
          { 
            name: '💎 Tính năng Premium', 
            value: featuresList 
          }
        )
        .setFooter({ text: 'Cảm ơn bạn đã ủng hộ Lena! 🌸' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🌐 Quản lý gói')
            .setStyle(ButtonStyle.Link)
            .setURL(process.env.WEBSITE_URL || 'https://lunabot.net/dashboard'),
          new ButtonBuilder()
            .setLabel('💬 Hỗ trợ')
            .setStyle(ButtonStyle.Link)
            .setURL(process.env.SUPPORT_SERVER || 'https://discord.gg/lunabot')
        );

      await message.reply({ embeds: [embed], components: [row] });
    } else {
      // Get pricing plans from database
      const pricingPlans = await getPricingPlans();
      
      // Build premium benefits list (combine features from all paid plans)
      const allFeatures = new Set();
      pricingPlans.forEach(plan => {
        if (plan.priceVnd > 0 && Array.isArray(plan.features)) {
          plan.features.forEach(feature => allFeatures.add(feature));
        }
      });
      
      const benefitsList = Array.from(allFeatures).slice(0, 6).map(f => `✨ ${f}`).join('\n') || 
        '🎁 Custom Bot riêng\n🎨 Custom Commands không giới hạn\n⚡ Ưu tiên phản hồi nhanh\n🎮 Giveaway không giới hạn\n💾 Lưu trữ tăng gấp đôi\n🛡️ Hỗ trợ VIP 24/7';
      
      // Build pricing plans list from database
      const pricingList = pricingPlans
        .filter(plan => plan.priceVnd > 0) // Only show paid plans
        .map(plan => {
          const badge = plan.badge ? ` ${plan.badge}` : '';
          const price = (plan.priceVnd || 0).toLocaleString('vi-VN');
          const cycle = plan.billingCycle === 'monthly' ? 'tháng' : 'năm';
          return `**${plan.name}**${badge} - ${price}đ/${cycle}`;
        })
        .join('\n') || '**Premium** - 100,000đ/tháng\n**Enterprise** - 300,000đ/tháng';
      
      embed
        .setTitle('🔓 Bạn chưa có Premium')
        .setDescription('Nâng cấp lên Premium để mở khóa nhiều tính năng đặc biệt!')
        .addFields(
          { 
            name: '✨ Lợi ích Premium', 
            value: benefitsList
          },
          { 
            name: '💳 Các gói Premium', 
            value: pricingList
          }
        )
        .setFooter({ text: 'Nâng cấp ngay để trải nghiệm đầy đủ! 🚀' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🛒 Nâng cấp Premium')
            .setStyle(ButtonStyle.Link)
            .setURL(process.env.WEBSITE_URL || 'https://lunabot.net/pricing'),
          new ButtonBuilder()
            .setLabel('📖 Xem thêm')
            .setStyle(ButtonStyle.Link)
            .setURL(process.env.WEBSITE_URL || 'https://lunabot.net/features')
        );

      await message.reply({ embeds: [embed], components: [row] });
    }
  } catch (error) {
    console.error('Error in premium command:', error);
    await message.reply('❌ Đã xảy ra lỗi khi kiểm tra trạng thái Premium. Vui lòng thử lại sau!');
  }
}

/**
 * Premium subscriptions list command - Shows all user subscriptions
 */
async function handleSubscriptionsCommand(message) {
  try {
    const userId = message.author.id;
    const subscriptions = await getUserSubscriptions(userId);

    const embed = new EmbedBuilder()
      .setColor('#3B82F6')
      .setAuthor({
        name: `${message.author.username} - Lịch sử gói Premium`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    if (subscriptions.length === 0) {
      embed
        .setTitle('📋 Chưa có gói Premium nào')
        .setDescription('Bạn chưa từng đăng ký gói Premium. Hãy nâng cấp ngay để trải nghiệm!')
        .setFooter({ text: 'Nâng cấp tại: lunabot.net/pricing' });

      return await message.reply({ embeds: [embed] });
    }

    embed
      .setTitle(`📋 Lịch sử gói Premium (${subscriptions.length})`)
      .setDescription('Danh sách tất cả các gói Premium của bạn:');

    subscriptions.forEach((sub, index) => {
      const status = sub.status === 'active' ? '✅ Hoạt động' : 
                     sub.status === 'expired' ? '⏰ Hết hạn' :
                     sub.status === 'cancelled' ? '❌ Đã hủy' : sub.status;
      
      const startDate = sub.starts_at ? new Date(sub.starts_at).toLocaleDateString('vi-VN') : 'N/A';
      const endDate = sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('vi-VN') : 'Không giới hạn';

      embed.addFields({
        name: `${index + 1}. ${sub.plan_name || 'Premium'} - ${status}`,
        value: `📅 **Từ:** ${startDate}\n📅 **Đến:** ${endDate}\n💳 **Thanh toán:** ${sub.payment_method || 'N/A'}`,
        inline: false
      });
    });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in subscriptions command:', error);
    await message.reply('❌ Đã xảy ra lỗi khi tải lịch sử Premium. Vui lòng thử lại sau!');
  }
}

/**
 * Premium features showcase command
 */
async function handlePremiumFeaturesCommand(message) {
  try {
    // Get pricing plans from database
    const pricingPlans = await getPricingPlans();
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⭐ Tính năng Premium của Lena')
      .setDescription('Nâng cấp lên Premium để mở khóa tất cả tính năng đặc biệt!')
      .setThumbnail('https://i.imgur.com/lena-premium.png');

    // Add features from all paid plans
    const featuresAdded = new Set();
    pricingPlans.forEach(plan => {
      if (plan.priceVnd > 0 && Array.isArray(plan.features)) {
        plan.features.forEach(feature => {
          if (!featuresAdded.has(feature)) {
            embed.addFields({
              name: `✨ ${feature}`,
              value: `Tính năng Premium từ gói ${plan.name}`
            });
            featuresAdded.add(feature);
          }
        });
      }
    });

    // If no features in database, use fallback
    if (featuresAdded.size === 0) {
      embed.addFields(
        { name: '🤖 Custom Bot riêng', value: 'Tạo bot Discord riêng với tên, avatar và prefix tùy chỉnh' },
        { name: '🎨 Custom Commands', value: 'Tạo lệnh tùy chỉnh không giới hạn với embed, button, và automation' },
        { name: '🎁 Giveaway Pro', value: 'Tạo giveaway không giới hạn với nhiều tùy chọn nâng cao' }
      );
    }

    // Build pricing plans details from database
    let pricingDetails = '';
    const paidPlans = pricingPlans.filter(plan => plan.priceVnd > 0);
    
    if (paidPlans.length > 0) {
      pricingDetails = paidPlans.map(plan => {
        const badge = plan.badge ? ` (${plan.badge})` : '';
        const price = (plan.priceVnd || 0).toLocaleString('vi-VN');
        const cycle = plan.billingCycle === 'monthly' ? 'tháng' : 'năm';
        const features = Array.isArray(plan.features) ? plan.features.slice(0, 3).map(f => `• ${f}`).join('\n') : '';
        
        return `**${plan.name}**${badge} - ${price}đ/${cycle}\n${features}`;
      }).join('\n\n');
    } else {
      // Fallback if no plans in database
      pricingDetails = '**Premium** - 100,000đ/tháng\n• Unlimited giveaways\n• Advanced analytics\n• Priority support\n\n**Enterprise** - 300,000đ/tháng\n• Everything in Premium\n• White-label option\n• API access';
    }

    embed.addFields({
      name: '💳 Các gói Premium',
      value: pricingDetails
    })
    .setFooter({ text: 'Nâng cấp ngay tại lunabot.net/pricing 🚀' })
    .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('🛒 Nâng cấp ngay')
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.WEBSITE_URL || 'https://lunabot.net/pricing'),
        new ButtonBuilder()
          .setLabel('💬 Liên hệ')
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.SUPPORT_SERVER || 'https://discord.gg/lunabot')
      );

    await message.reply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error in premium-features command:', error);
    await message.reply('❌ Đã xảy ra lỗi khi tải thông tin Premium. Vui lòng thử lại sau!');
  }
}

module.exports = {
  handlePremiumCommand,
  handleSubscriptionsCommand,
  handlePremiumFeaturesCommand
};
