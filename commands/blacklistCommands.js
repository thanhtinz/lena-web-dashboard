// Blacklist Management Commands
const { getServerConfig, updateServerBlacklist } = require('../database/configService');
const { getDefaultBlacklist } = require('../utils/blacklistFilter');

// !blacklist add <keyword>
async function handleBlacklistAdd(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể thêm từ khóa blacklist!');
  }
  
  const keyword = args.join(' ').toLowerCase().trim();
  if (!keyword) {
    return message.reply('❌ Vui lòng nhập từ khóa cần thêm!\n\nVí dụ: `!blacklist add badword`');
  }
  
  const config = await getServerConfig(message.guild.id);
  const customBlacklist = config.customBlacklist || [];
  
  if (customBlacklist.includes(keyword)) {
    return message.reply(`⚠️ Từ khóa "${keyword}" đã có trong blacklist rồi!`);
  }
  
  customBlacklist.push(keyword);
  await updateServerBlacklist(message.guild.id, customBlacklist);
  
  await message.reply(`✅ Đã thêm "${keyword}" vào blacklist 18+!\n\n🔒 Bot sẽ tự động từ chối nhẹ nhàng khi phát hiện từ này.`);
}

// !blacklist remove <keyword>
async function handleBlacklistRemove(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xóa từ khóa blacklist!');
  }
  
  const keyword = args.join(' ').toLowerCase().trim();
  if (!keyword) {
    return message.reply('❌ Vui lòng nhập từ khóa cần xóa!');
  }
  
  const config = await getServerConfig(message.guild.id);
  const customBlacklist = config.customBlacklist || [];
  
  if (!customBlacklist.includes(keyword)) {
    return message.reply(`⚠️ Từ khóa "${keyword}" không có trong blacklist tùy chỉnh!`);
  }
  
  const newBlacklist = customBlacklist.filter(k => k !== keyword);
  await updateServerBlacklist(message.guild.id, newBlacklist);
  
  await message.reply(`✅ Đã xóa "${keyword}" khỏi blacklist!`);
}

// !blacklist list
async function handleBlacklistList(message) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xem blacklist!');
  }
  
  const config = await getServerConfig(message.guild.id);
  const serverPrefix = config.prefix || '!';
  const defaultList = getDefaultBlacklist();
  const customList = config.customBlacklist || [];
  
  let response = `🔒 **BLACKLIST 18+ FILTER**\n\n`;
  
  response += `**📋 Default Blacklist:** ${defaultList.length} từ khóa\n`;
  response += `_System có sẵn ${defaultList.length} từ khóa phổ biến (ẩn để tránh spam)_\n\n`;
  
  if (customList.length > 0) {
    response += `**➕ Custom Blacklist của server:** ${customList.length} từ khóa\n`;
    response += customList.map(k => `• ${k}`).join('\n');
  } else {
    response += `**➕ Custom Blacklist:** Chưa có\n`;
    response += `_Dùng \`${serverPrefix}blacklist add <keyword>\` để thêm_`;
  }
  
  response += `\n\n💡 Khi phát hiện từ khóa blacklist, bot sẽ từ chối nhẹ nhàng với phong cách cute! 🌸`;
  
  await message.reply(response);
}

// !blacklist toggle
async function handleBlacklistToggle(message) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể bật/tắt blacklist filter!');
  }
  
  const config = await getServerConfig(message.guild.id);
  const newEnabled = !(config.blacklistEnabled ?? true);
  
  const { toggleBlacklist } = require('../database/configService');
  await toggleBlacklist(message.guild.id, newEnabled);
  
  const status = newEnabled ? '✅ BẬT' : '❌ TẮT';
  const emoji = newEnabled ? '🔒' : '🔓';
  
  await message.reply(`${emoji} **Blacklist Filter: ${status}**\n\n${
    newEnabled 
      ? 'Bot sẽ tự động filter nội dung 18+!' 
      : 'Bot sẽ KHÔNG filter nội dung (cẩn thận!)'
  }`);
}

module.exports = {
  handleBlacklistAdd,
  handleBlacklistRemove,
  handleBlacklistList,
  handleBlacklistToggle
};
