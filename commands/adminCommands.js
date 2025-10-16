const { PermissionFlagsBits } = require('discord.js');
const { 
  setServerMode,
  setServerPrefix,
  addAllowedChannel, 
  removeAllowedChannel,
  clearAllowedChannels,
  getServerConfig,
  updateServerKeywords
} = require('../database/configService');
const { getAllModes } = require('../personalities/modes');
const { getCreatorInfo, isOwner, getSleepConfirmation, getRestartMessage } = require('../config/creatorInfo');

function isAdmin(member) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

async function handleSetPrefix(message, args) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  
  if (!isAdmin(message.member)) {
    return message.reply(isEn 
      ? '❌ Only admins can change the prefix!' 
      : '❌ Chỉ admin mới có thể thay đổi prefix!');
  }

  const newPrefix = args[0];
  
  if (!newPrefix) {
    const msg = isEn
      ? `📋 **Current Prefix:** \`${config.prefix}\`\n\n💡 Usage: \`${config.prefix}setprefix <new prefix>\`\n\n**Examples:**\n• \`${config.prefix}setprefix !\`\n• \`${config.prefix}setprefix ?\`\n• \`${config.prefix}setprefix lena\``
      : `📋 **Prefix hiện tại:** \`${config.prefix}\`\n\n💡 Sử dụng: \`${config.prefix}setprefix <prefix mới>\`\n\n**Ví dụ:**\n• \`${config.prefix}setprefix !\`\n• \`${config.prefix}setprefix ?\`\n• \`${config.prefix}setprefix lena\``;
    return message.reply(msg);
  }

  if (newPrefix.length > 5) {
    return message.reply(isEn 
      ? '❌ Prefix cannot be longer than 5 characters!' 
      : '❌ Prefix không được dài quá 5 ký tự!');
  }

  await setServerPrefix(message.guild.id, newPrefix);
  const successMsg = isEn
    ? `✅ Changed prefix to \`${newPrefix}\`!\n\n💡 Use commands with new prefix: \`${newPrefix}help\``
    : `✅ Đã đổi prefix thành \`${newPrefix}\`!\n\n💡 Từ giờ dùng lệnh với prefix mới: \`${newPrefix}help\``;
  message.reply(successMsg);
}

async function handleSetMode(message, args, conversationHistory) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  
  if (!isAdmin(message.member)) {
    return message.reply(isEn 
      ? '❌ Only admins can change the mode!' 
      : '❌ Chỉ admin mới có thể thay đổi mode!');
  }

  const mode = args[0]?.toLowerCase();
  const availableModes = getAllModes();
  
  if (!mode) {
    const modeList = availableModes.map(m => `• \`${m.key}\` - ${m.name}: ${m.description}`).join('\n');
    const msg = isEn
      ? `📋 **Available modes:**\n${modeList}\n\n💡 Usage: \`!setmode <mode>\``
      : `📋 **Các mode hiện có:**\n${modeList}\n\n💡 Sử dụng: \`!setmode <mode>\``;
    return message.reply(msg);
  }

  const modeExists = availableModes.find(m => m.key === mode);
  if (!modeExists) {
    return message.reply(isEn 
      ? `❌ Mode does not exist! Use \`!setmode\` to see the list.` 
      : `❌ Mode không tồn tại! Dùng \`!setmode\` để xem danh sách mode.`);
  }

  await setServerMode(message.guild.id, mode);
  
  const serverId = message.guild.id;
  conversationHistory.forEach((value, key) => {
    if (key.startsWith(serverId)) {
      conversationHistory.delete(key);
    }
  });
  
  const successMsg = isEn
    ? `✅ Switched to **${modeExists.name}** mode!\n${modeExists.description}\n\n💡 Conversation history has been reset to apply the new mode.`
    : `✅ Đã chuyển sang mode **${modeExists.name}**!\n${modeExists.description}\n\n💡 Lịch sử trò chuyện đã được reset để áp dụng mode mới.`;
  message.reply(successMsg);
}

async function handleSetChannel(message, args) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  
  if (!isAdmin(message.member)) {
    return message.reply(isEn 
      ? '❌ Only admins can set channels!' 
      : '❌ Chỉ admin mới có thể thiết lập kênh!');
  }

  const action = args[0]?.toLowerCase();
  let channelId = args[1] || message.channel.id;
  
  // Extract pure channel ID from mention format <#123456789>
  if (channelId.startsWith('<#') && channelId.endsWith('>')) {
    channelId = channelId.slice(2, -1);
  }

  if (action === 'add') {
    await addAllowedChannel(message.guild.id, channelId);
    message.reply(isEn 
      ? `✅ Added <#${channelId}> to allowed channels!` 
      : `✅ Đã thêm <#${channelId}> vào danh sách kênh được phép!`);
  } else if (action === 'remove') {
    await removeAllowedChannel(message.guild.id, channelId);
    message.reply(isEn 
      ? `✅ Removed <#${channelId}> from allowed channels!` 
      : `✅ Đã xóa <#${channelId}> khỏi danh sách kênh được phép!`);
  } else if (action === 'clear') {
    await clearAllowedChannels(message.guild.id);
    message.reply(isEn 
      ? `✅ Cleared all channel restrictions. Bot will work in all channels!` 
      : `✅ Đã xóa tất cả giới hạn kênh. Bot sẽ hoạt động ở mọi kênh!`);
  } else if (action === 'list') {
    const currentConfig = await getServerConfig(message.guild.id);
    if (currentConfig.allowedChannels.length === 0) {
      return message.reply(isEn 
        ? '📋 Bot is working in all channels.' 
        : '📋 Bot đang hoạt động ở tất cả các kênh.');
    }
    const channelList = currentConfig.allowedChannels.map(id => `• <#${id}>`).join('\n');
    message.reply(isEn 
      ? `📋 **Allowed channels:**\n${channelList}` 
      : `📋 **Các kênh được phép:**\n${channelList}`);
  } else {
    const usage = isEn
      ? '💡 **Usage:**\n• `!setchannel add [id]` - Add channel\n• `!setchannel remove [id]` - Remove channel\n• `!setchannel clear` - Clear all restrictions\n• `!setchannel list` - View list\n\n*If [id] is not provided, current channel will be used*'
      : '💡 **Sử dụng:**\n• `!setchannel add [id]` - Thêm kênh\n• `!setchannel remove [id]` - Xóa kênh\n• `!setchannel clear` - Xóa tất cả giới hạn\n• `!setchannel list` - Xem danh sách\n\n*Nếu không có [id], sẽ dùng kênh hiện tại*';
    message.reply(usage);
  }
}

async function handleAddKeyword(message, args) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  
  if (!isAdmin(message.member)) {
    return message.reply(isEn 
      ? '❌ Only admins can add keywords!' 
      : '❌ Chỉ admin mới có thể thêm keyword!');
  }

  if (args.length < 2) {
    const usage = isEn
      ? '💡 **Usage:** `!addkeyword <keyword> <response>`\n\n**Example:** `!addkeyword price Bot is 100% free! 🎉`'
      : '💡 **Sử dụng:** `!addkeyword <từ khóa> <câu trả lời>`\n\n**Ví dụ:** `!addkeyword giá Bot miễn phí 100%! 🎉`';
    return message.reply(usage);
  }

  const keyword = args[0].toLowerCase();
  const response = args.slice(1).join(' ');

  const keywords = config.keywords || {};
  keywords[keyword] = response;
  
  await updateServerKeywords(message.guild.id, keywords);
  const successMsg = isEn
    ? `✅ Added keyword **${keyword}**!\nWhen a message contains "${keyword}", bot will reply: "${response}"`
    : `✅ Đã thêm keyword **${keyword}**!\nKhi tin nhắn chứa "${keyword}", bot sẽ trả lời: "${response}"`;
  message.reply(successMsg);
}

async function handleRemoveKeyword(message, args) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  
  if (!isAdmin(message.member)) {
    return message.reply(isEn 
      ? '❌ Only admins can remove keywords!' 
      : '❌ Chỉ admin mới có thể xóa keyword!');
  }

  const keyword = args[0]?.toLowerCase();
  if (!keyword) {
    return message.reply(isEn 
      ? '💡 **Usage:** `!removekeyword <keyword>`' 
      : '💡 **Sử dụng:** `!removekeyword <từ khóa>`');
  }

  const keywords = config.keywords || {};
  delete keywords[keyword];
  
  await updateServerKeywords(message.guild.id, keywords);
  message.reply(isEn 
    ? `✅ Removed keyword **${keyword}**!` 
    : `✅ Đã xóa keyword **${keyword}**!`);
}

async function handleListKeywords(message) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  const keywords = config.keywords || {};
  
  if (Object.keys(keywords).length === 0) {
    return message.reply(isEn 
      ? '📋 No keywords have been set up yet.' 
      : '📋 Chưa có keyword nào được thiết lập.');
  }

  const keywordList = Object.entries(keywords)
    .map(([key, value]) => `• **${key}** → "${value}"`)
    .join('\n');
  
  message.reply(isEn 
    ? `📋 **Keywords list:**\n${keywordList}` 
    : `📋 **Danh sách keywords:**\n${keywordList}`);
}

async function handleReset(message, conversationHistory) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  
  if (!isAdmin(message.member)) {
    return message.reply(isEn 
      ? '❌ Only admins can reset the bot!' 
      : '❌ Chỉ admin mới có thể reset bot!');
  }

  const serverId = message.guild.id;
  conversationHistory.forEach((value, key) => {
    if (key.startsWith(serverId)) {
      conversationHistory.delete(key);
    }
  });

  message.reply(isEn 
    ? '✅ Reset all conversation history for this server!' 
    : '✅ Đã reset tất cả lịch sử trò chuyện của server này!');
}

async function handleClearHistory(message, conversationHistory) {
  const config = await getServerConfig(message.guild.id);
  const lang = config?.language || 'vi';
  const isEn = lang === 'en';
  
  if (!isAdmin(message.member)) {
    return message.reply(isEn 
      ? '❌ Only admins can clear history!' 
      : '❌ Chỉ admin mới có thể xóa lịch sử!');
  }

  const serverId = message.guild.id;
  const channelId = message.channel.id;
  const conversationKey = `${serverId}_${channelId}`;
  
  conversationHistory.delete(conversationKey);
  
  message.reply(isEn 
    ? '✅ Cleared conversation history for this channel!' 
    : '✅ Đã xóa lịch sử trò chuyện của kênh này!');
}

// Help command now uses the new help system
async function handleHelp(message, args) {
  const { handleHelp: newHandleHelp } = require('./helpSystem');
  return newHandleHelp(message, args);
}

async function handleConfig(message) {
  const config = getServerConfig(message.guild.id);
  const modes = getAllModes();
  const currentMode = modes.find(m => m.key === config.mode);

  let configText = `⚙️ **Cấu hình Server**\n\n`;
  configText += `**Mode hiện tại:** ${currentMode?.name || 'Lena'}\n`;
  configText += `*${currentMode?.description || 'Mặc định'}*\n\n`;
  configText += `**Prefix:** \`${config.prefix}\`\n`;
  
  if (config.allowedChannels.length > 0) {
    configText += `**Kênh được phép:** ${config.allowedChannels.map(id => `<#${id}>`).join(', ')}\n`;
  } else {
    configText += `**Kênh được phép:** Tất cả\n`;
  }
  
  const keywordCount = config.customResponses ? Object.keys(config.customResponses).length : 0;
  configText += `**Số keywords:** ${keywordCount}`;

  message.reply(configText);
}

async function handleCreator(message) {
  const creator = getCreatorInfo();
  
  const creatorText = `
👨‍💻 **THÔNG TIN NGƯỜI THIẾT KẾ BOT**

**🌟 Tên:** ${creator.name}
**💬 Discord:** ${creator.discord.username}
**🆔 User ID:** ${creator.discord.id}
**📘 Facebook:** ${creator.facebook}

**📜 Bản quyền:**
${creator.copyright}

---
*Cảm ơn bạn đã sử dụng bot! Nếu có vấn đề hoặc góp ý, hãy liên hệ ${creator.name} nhé! 💕*
  `.trim();

  message.reply(creatorText);
}

async function handleSleep(message) {
  if (!isOwner(message.author.id)) {
    return message.reply('❌ Chỉ chủ nhân mới có thể cho Lena nghỉ ngơi! 🥺');
  }

  const confirmMsg = await message.reply(getSleepConfirmation() + '\n\n**React ✅ để xác nhận hoặc ❌ để hủy**');
  
  await confirmMsg.react('✅');
  await confirmMsg.react('❌');

  const filter = (reaction, user) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
  };

  try {
    const collected = await confirmMsg.awaitReactions({ 
      filter, 
      max: 1, 
      time: 15000, 
      errors: ['time'] 
    });

    const reaction = collected.first();
    
    if (reaction.emoji.name === '✅') {
      await confirmMsg.reply('💤 Lena đi ngủ đây... zzz~ 😴✨');
      
      // Save channel ID to wake up in the same channel
      const fs = require('fs');
      const sleepData = {
        wakeUpChannel: message.channel.id,
        wakeUpServer: message.guild?.id || 'DM'
      };
      fs.writeFileSync('./data/sleep.json', JSON.stringify(sleepData, null, 2));
      
      console.log('😴 Bot going to sleep... Shell script will restart in 3 seconds!');
      console.log(`💤 Will wake up in channel: ${message.channel.id}`);
      
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } else {
      await confirmMsg.reply('😊 Ehehe~ Lena sẽ tiếp tục làm việc! 💕');
    }
  } catch (error) {
    await confirmMsg.reply('⏰ Hết thời gian! Lena sẽ tiếp tục làm việc nhé~ 😊');
  }
}

module.exports = {
  handleSetMode,
  handleSetPrefix,
  handleSetChannel,
  handleAddKeyword,
  handleRemoveKeyword,
  handleListKeywords,
  handleReset,
  handleClearHistory,
  handleHelp,
  handleConfig,
  handleCreator,
  handleSleep,
  isAdmin
};
