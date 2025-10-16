const { EmbedBuilder } = require('discord.js');

// AFK system storage
const afkUsers = new Map();

async function handlePing(message, db) {
  const { getServerTranslator } = require('../i18n');
  
  const sent = await message.reply('🏓 Pinging...');
  const latency = sent.createdTimestamp - message.createdTimestamp;
  const apiLatency = Math.round(message.client.ws.ping);

  // Get server language translator
  const t = await getServerTranslator(db, message.guild?.id || '0');

  const embed = new EmbedBuilder()
    .setTitle(t('ping.title'))
    .setColor(0x5865F2)
    .addFields(
      { name: `📡 ${t('ping.botLatency')}`, value: `${latency}ms`, inline: true },
      { name: `🌐 ${t('ping.apiLatency')}`, value: `${apiLatency}ms`, inline: true }
    )
    .setTimestamp();

  await sent.edit({ content: null, embeds: [embed] });
}

async function handleAFK(message, args) {
  const reason = args.join(' ') || 'AFK';
  
  afkUsers.set(message.author.id, {
    reason: reason,
    timestamp: Date.now()
  });

  const embed = new EmbedBuilder()
    .setTitle('💤 AFK')
    .setDescription(`${message.author.username} đã đặt trạng thái AFK`)
    .addFields({ name: 'Lý do', value: reason })
    .setColor(0xFEE75C)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

function checkAFK(message) {
  // Check if user is returning from AFK
  if (afkUsers.has(message.author.id)) {
    const afkData = afkUsers.get(message.author.id);
    const duration = Date.now() - afkData.timestamp;
    const minutes = Math.floor(duration / 60000);
    
    afkUsers.delete(message.author.id);
    
    message.reply(`💚 Welcome back, ${message.author.username}! Bạn đã AFK ${minutes > 0 ? `${minutes} phút` : 'vài giây'} trước.`).catch(() => {});
  }

  // Check if mentioned users are AFK
  message.mentions.users.forEach(user => {
    if (afkUsers.has(user.id)) {
      const afkData = afkUsers.get(user.id);
      const duration = Date.now() - afkData.timestamp;
      const minutes = Math.floor(duration / 60000);
      
      message.reply(`💤 ${user.username} đang AFK ${minutes > 0 ? `(${minutes} phút trước)` : ''}: ${afkData.reason}`).catch(() => {});
    }
  });
}

async function handleAvatar(message, args) {
  let user = message.mentions.users.first() || message.author;
  
  // Check if user ID is provided
  if (args[0] && !message.mentions.users.first()) {
    try {
      user = await message.client.users.fetch(args[0]);
    } catch (err) {
      return message.reply('❌ Không tìm thấy user!');
    }
  }

  const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

  const embed = new EmbedBuilder()
    .setTitle(`🖼️ Avatar của ${user.username}`)
    .setImage(avatarURL)
    .setColor(0x5865F2)
    .setDescription(`[Download](${avatarURL})`)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleBanner(message, args) {
  let user = message.mentions.users.first() || message.author;
  
  // Check if user ID is provided
  if (args[0] && !message.mentions.users.first()) {
    try {
      user = await message.client.users.fetch(args[0]);
    } catch (err) {
      return message.reply('❌ Không tìm thấy user!');
    }
  }

  // Fetch full user with banner
  const fetchedUser = await user.fetch();
  
  if (!fetchedUser.banner) {
    return message.reply(`❌ ${user.username} không có banner!`);
  }

  const bannerURL = fetchedUser.bannerURL({ dynamic: true, size: 4096 });

  const embed = new EmbedBuilder()
    .setTitle(`🎨 Banner của ${user.username}`)
    .setImage(bannerURL)
    .setColor(fetchedUser.accentColor || 0x5865F2)
    .setDescription(`[Download](${bannerURL})`)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleServerInfo(message, db) {
  const { getServerTranslator } = require('../i18n');
  
  if (!message.guild) {
    const t = await getServerTranslator(db, '0');
    return message.reply(t('common.serverOnly'));
  }

  const guild = message.guild;
  const t = await getServerTranslator(db, guild.id);
  
  // Fetch all members to get accurate online count
  await guild.members.fetch();
  
  const owner = await guild.fetchOwner();
  const createdDate = Math.floor(guild.createdTimestamp / 1000);
  
  const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
  const categories = guild.channels.cache.filter(c => c.type === 4).size;
  
  const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
  
  const embed = new EmbedBuilder()
    .setTitle(`${t('serverinfo.title')}: ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
    .setColor(0x5865F2)
    .addFields(
      { name: `👑 ${t('serverinfo.owner')}`, value: `${owner.user.tag}`, inline: true },
      { name: `🆔 ${t('serverinfo.id')}`, value: guild.id, inline: true },
      { name: `📅 ${t('serverinfo.createdAt')}`, value: `<t:${createdDate}:F>`, inline: false },
      { name: `👥 ${t('serverinfo.members')}`, value: `${guild.memberCount} (${onlineMembers} online)`, inline: true },
      { name: `📝 ${t('serverinfo.channels')}`, value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}`, inline: true },
      { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
      { name: `🎭 ${t('serverinfo.roles')}`, value: `${guild.roles.cache.size}`, inline: true },
      { name: `🚀 ${t('serverinfo.boosts')}`, value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`, inline: true },
      { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true }
    )
    .setTimestamp();

  if (guild.description) {
    embed.setDescription(guild.description);
  }

  if (guild.bannerURL()) {
    embed.setImage(guild.bannerURL({ size: 1024 }));
  }

  await message.reply({ embeds: [embed] });
}

async function handleBotInfo(message) {
  const client = message.client;
  
  // Calculate total users across all servers
  const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
  const serverCount = client.guilds.cache.size;
  
  // Main description
  const description = `Đây là các thông tin chính thống của Lena, không tin tưởng bên thứ 3`;
  
  // Thông Tin section
  const thongTinSection = `## 💖 Thông Tin Lena\n\n` +
    `💖 **Số lượng máy chủ** : ${serverCount.toLocaleString('vi-VN')} Máy chủ\n` +
    `💖 **Số lượng người dùng** : ${totalUsers.toLocaleString('vi-VN')} Thành viên\n` +
    `💖 **Support Server** : [Luna Bot Support](https://discord.gg/lunabot)`;
  
  // Các Link hữu ích section
  const linksSection = `## 💖 Các Link hữu ích\n\n` +
    `💖 **[Website](https://lunabot.net)** Trang web chính thức của Lena\n` +
    `💖 **[Vote](https://top.gg/bot/${client.user.id}/vote)** Trang web vote của bot`;
  
  // Lưu ý section
  const noteSection = `## Lưu ý\n` +
    `• Không mời bot từ những link là và thêm quyền Administrator cho bot.\n` +
    `• Lena sẽ không chịu trách nhiệm về vấn đề bị phá hoại máy chủ hay mất tài khoản!.`;
  
  const embed = new EmbedBuilder()
    .setAuthor({ 
      name: 'Lena Discord Bot',
      iconURL: client.user.displayAvatarURL({ dynamic: true })
    })
    .setDescription(description)
    .setColor(0x00D9FF) // Cyan color matching the image
    .addFields(
      { name: '\u200b', value: thongTinSection, inline: false },
      { name: '\u200b', value: linksSection, inline: false },
      { name: '\u200b', value: noteSection, inline: false }
    )
    .setImage('https://i.imgur.com/placeholder-lena-banner.png') // Replace with actual Lena banner
    .setFooter({ text: `💖 Cảm ơn bạn đã ủng hộ Lena. | Hôm nay lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` })
    .setTimestamp();

  const row = {
    type: 1,
    components: [
      {
        type: 2,
        style: 5,
        label: 'Vote Cho Lena',
        url: `https://top.gg/bot/${client.user.id}/vote`,
        emoji: { name: '💖' }
      },
      {
        type: 2,
        style: 5,
        label: 'Mời Lena',
        url: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`,
        emoji: { name: '🤖' }
      }
    ]
  };

  await message.reply({ embeds: [embed], components: [row] });
}

async function handleRoll(message, args) {
  let dice = '1d6'; // Default: 1 con xúc xắc 6 mặt
  
  if (args[0]) {
    dice = args[0].toLowerCase();
  }
  
  // Parse dice notation (e.g., 2d20, 3d6)
  const match = dice.match(/^(\d+)?d(\d+)$/);
  
  if (!match) {
    return message.reply('❌ Format không đúng! Dùng: `!roll [số]d[mặt]`\nVí dụ: `!roll 2d6`, `!roll d20`');
  }
  
  const count = parseInt(match[1] || '1');
  const sides = parseInt(match[2]);
  
  if (count < 1 || count > 20) {
    return message.reply('❌ Số lượng xúc xắc phải từ 1-20!');
  }
  
  if (sides < 2 || sides > 100) {
    return message.reply('❌ Số mặt xúc xắc phải từ 2-100!');
  }
  
  const rolls = [];
  let total = 0;
  
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🎲 Ném xúc xắc!')
    .setColor(0x57F287)
    .addFields(
      { name: '🎯 Kết quả', value: rolls.join(', '), inline: false },
      { name: '📊 Tổng', value: `${total}`, inline: true },
      { name: '🎲 Xúc xắc', value: `${count}d${sides}`, inline: true }
    )
    .setFooter({ text: `Được ném bởi ${message.author.username}` })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleSetLanguage(message, args, db, conversationHistory = null) {
  const { t } = require('../i18n');
  const { serverConfigs, conversationHistory: conversationHistoryTable } = require('../database/schema');
  const { eq } = require('drizzle-orm');
  
  // Check if user is admin
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể thay đổi ngôn ngữ!');
  }

  const newLang = args[0]?.toLowerCase();
  
  // If no language provided, show current language
  if (!newLang) {
    const config = await db.select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, message.guild.id))
      .limit(1);
    
    const currentLang = config[0]?.language || 'vi';
    const langName = currentLang === 'vi' ? 'Tiếng Việt' : 'English';
    
    const embed = new EmbedBuilder()
      .setTitle('🌐 Cấu hình ngôn ngữ')
      .setColor(0x5865F2)
      .addFields(
        { name: 'Ngôn ngữ hiện tại', value: `**${langName}** (\`${currentLang}\`)`, inline: false },
        { name: 'Ngôn ngữ có sẵn', value: '`vi` - Tiếng Việt\n`en` - English', inline: false },
        { name: 'Cách dùng', value: '`!setlang <vi|en>`', inline: false }
      )
      .setTimestamp();
    
    return message.reply({ embeds: [embed] });
  }
  
  // Validate language
  if (newLang !== 'vi' && newLang !== 'en') {
    return message.reply('❌ Ngôn ngữ không hợp lệ! Chỉ hỗ trợ `vi` (Tiếng Việt) hoặc `en` (English).');
  }
  
  // Update language in database
  try {
    // Check if config exists
    const existing = await db.select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, message.guild.id))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing config
      await db.update(serverConfigs)
        .set({ language: newLang, updatedAt: new Date() })
        .where(eq(serverConfigs.serverId, message.guild.id));
    } else {
      // Create new config
      const { sql: sqlRaw } = require('drizzle-orm');
      await db.insert(serverConfigs).values({
        id: sqlRaw`gen_random_uuid()`,
        serverId: message.guild.id,
        language: newLang
      });
    }
    
    // Clear conversation history from memory (if conversationHistory Map was passed)
    if (conversationHistory) {
      const keysToDelete = [];
      for (const [key, value] of conversationHistory.entries()) {
        if (key.startsWith(message.guild.id + '_')) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => conversationHistory.delete(key));
      console.log(`🗑️ Cleared ${keysToDelete.length} conversation(s) from memory for server ${message.guild.id}`);
    }
    
    // Clear conversation history from database
    try {
      await db.delete(conversationHistoryTable)
        .where(eq(conversationHistoryTable.serverId, message.guild.id));
      console.log(`🗑️ Cleared conversation history from database for server ${message.guild.id}`);
    } catch (error) {
      console.error('Error clearing conversation history from DB:', error);
    }
    
    const langName = newLang === 'vi' ? 'Tiếng Việt' : 'English';
    const successMsg = newLang === 'vi' 
      ? `✅ Đã đổi ngôn ngữ sang **${langName}**!\n\n🗑️ Lịch sử hội thoại đã được tự động xóa để bot có thể nói chuyện bằng ${langName}.`
      : `✅ Language changed to **${langName}**!\n\n🗑️ Conversation history has been automatically cleared so the bot can communicate in ${langName}.`;
    
    const embed = new EmbedBuilder()
      .setTitle('🌐 Language Updated')
      .setDescription(successMsg)
      .setColor(0x57F287)
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error setting language:', error);
    message.reply('❌ Đã xảy ra lỗi khi thay đổi ngôn ngữ!');
  }
}

module.exports = {
  handlePing,
  handleAFK,
  checkAFK,
  handleAvatar,
  handleBanner,
  handleServerInfo,
  handleBotInfo,
  handleRoll,
  handleSetLanguage
};
