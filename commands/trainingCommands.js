// Training Data Admin Commands
const { 
  addTrainingData, 
  getTrainingDataForServer, 
  deleteTrainingData,
  toggleTrainingData,
  addCustomResponse,
  getCustomResponsesForServer,
  deleteCustomResponse,
  getConversationHistory
} = require('../database/trainingData');
const { checkServerPremium } = require('../utils/serverPremiumChecker');

// !train add <category> <question> | <answer>
async function handleTrainAdd(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể thêm training data!');
  }
  
  // Check premium
  const { isPremium } = await checkServerPremium(message.guild.id);
  if (!isPremium) {
    return message.reply('👑 **Premium Feature**\n\n❌ Training Lena là tính năng premium! Nâng cấp server lên premium để sử dụng.\n\n💡 Truy cập dashboard để upgrade.');
  }
  
  const fullText = args.join(' ');
  const parts = fullText.split('|');
  
  if (parts.length < 2) {
    return message.reply('❌ Format: `!train add <category> <question> | <answer>`\n\nVí dụ: `!train add code Closure là gì? | Closure là function có thể truy cập biến ngoài scope`');
  }
  
  const [questionPart, ...answerParts] = parts;
  const questionWords = questionPart.trim().split(' ');
  const category = questionWords[0];
  const question = questionWords.slice(1).join(' ').trim();
  const answer = answerParts.join('|').trim();
  
  if (!question || !answer) {
    return message.reply('❌ Câu hỏi và câu trả lời không được để trống!');
  }
  
  const result = await addTrainingData({
    serverId: message.guild.id,
    question,
    answer,
    category: category || 'general',
    createdBy: message.author.id,
    isActive: true
  });
  
  if (result) {
    await message.reply(`✅ **Đã thêm training data #${result.id}**\n\n📂 Category: ${category}\n❓ Question: ${question}\n💬 Answer: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}`);
  } else {
    await message.reply('❌ Lỗi khi thêm training data!');
  }
}

// !train list [category]
async function handleTrainList(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xem training data!');
  }
  
  // Check premium
  const { isPremium } = await checkServerPremium(message.guild.id);
  if (!isPremium) {
    return message.reply('👑 **Premium Feature**\n\n❌ Training Lena là tính năng premium!');
  }
  
  const data = await getTrainingDataForServer(message.guild.id);
  
  if (data.length === 0) {
    return message.reply('📚 Chưa có training data nào! Dùng `!train add` để thêm.');
  }
  
  const category = args[0]?.toLowerCase();
  const filtered = category ? data.filter(d => d.category?.toLowerCase() === category) : data;
  
  if (filtered.length === 0) {
    return message.reply(`📚 Không có training data cho category "${category}"`);
  }
  
  let response = `📚 **TRAINING DATA** (${filtered.length} items)\n\n`;
  
  filtered.slice(0, 10).forEach(item => {
    const status = item.isActive ? '✅' : '❌';
    response += `${status} **#${item.id}** [${item.category}]\n`;
    response += `❓ ${item.question.substring(0, 80)}${item.question.length > 80 ? '...' : ''}\n`;
    response += `💬 ${item.answer.substring(0, 80)}${item.answer.length > 80 ? '...' : ''}\n\n`;
  });
  
  if (filtered.length > 10) {
    response += `\n_... và ${filtered.length - 10} items khác_`;
  }
  
  response += `\n💡 Dùng \`!train delete <id>\` để xóa\n💡 Dùng \`!train toggle <id>\` để bật/tắt`;
  
  await message.reply(response);
}

// !train delete <id>
async function handleTrainDelete(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xóa training data!');
  }
  
  // Check premium
  const { isPremium } = await checkServerPremium(message.guild.id);
  if (!isPremium) {
    return message.reply('👑 **Premium Feature**\n\n❌ Training Lena là tính năng premium!');
  }
  
  const id = parseInt(args[0]);
  if (isNaN(id)) {
    return message.reply('❌ ID không hợp lệ! Dùng `!train list` để xem ID.');
  }
  
  const success = await deleteTrainingData(id, message.guild.id);
  if (success) {
    await message.reply(`✅ Đã xóa training data #${id}`);
  } else {
    await message.reply(`❌ Không tìm thấy training data #${id} hoặc lỗi khi xóa!`);
  }
}

// !train toggle <id>
async function handleTrainToggle(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể bật/tắt training data!');
  }
  
  // Check premium
  const { isPremium } = await checkServerPremium(message.guild.id);
  if (!isPremium) {
    return message.reply('👑 **Premium Feature**\n\n❌ Training Lena là tính năng premium!');
  }
  
  const id = parseInt(args[0]);
  if (isNaN(id)) {
    return message.reply('❌ ID không hợp lệ!');
  }
  
  const result = await toggleTrainingData(id, message.guild.id);
  if (result) {
    const status = result.isActive ? '✅ Đã bật' : '❌ Đã tắt';
    await message.reply(`${status} training data #${id}`);
  } else {
    await message.reply(`❌ Không tìm thấy training data #${id}!`);
  }
}

// !response add <trigger> | <response> [exact] [priority:N]
async function handleResponseAdd(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể thêm custom response!');
  }
  
  const fullText = args.join(' ');
  const parts = fullText.split('|');
  
  if (parts.length < 2) {
    return message.reply('❌ Format: `!response add <trigger> | <response> [exact] [priority:N]`\n\nVí dụ: `!response add hello | Xin chào! Tôi là Lena 🌸 priority:5`');
  }
  
  const trigger = parts[0].trim();
  let responseParts = parts[1].trim().split(' ');
  
  // Check for exact match flag
  const isExact = responseParts.includes('exact');
  if (isExact) {
    responseParts = responseParts.filter(p => p !== 'exact');
  }
  
  // Check for priority flag
  let priority = 0;
  const priorityIndex = responseParts.findIndex(p => p.startsWith('priority:'));
  if (priorityIndex !== -1) {
    const priorityStr = responseParts[priorityIndex].split(':')[1];
    priority = parseInt(priorityStr) || 0;
    responseParts.splice(priorityIndex, 1);
  }
  
  const response = responseParts.join(' ').trim();
  
  const result = await addCustomResponse({
    serverId: message.guild.id,
    trigger,
    response,
    isExactMatch: isExact,
    priority: priority,
    createdBy: message.author.id
  });
  
  if (result) {
    const matchType = isExact ? 'Exact match' : 'Contains';
    await message.reply(`✅ **Đã thêm custom response #${result.id}**\n\n🔑 Trigger: "${trigger}" (${matchType})\n⭐ Priority: ${priority}\n💬 Response: ${response}`);
  } else {
    await message.reply('❌ Lỗi khi thêm custom response!');
  }
}

// !response list
async function handleResponseList(message) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xem custom responses!');
  }
  
  const responses = await getCustomResponsesForServer(message.guild.id);
  
  if (responses.length === 0) {
    return message.reply('📝 Chưa có custom response nào!');
  }
  
  let reply = `📝 **CUSTOM RESPONSES** (${responses.length} items)\n\n`;
  
  responses.slice(0, 10).forEach(resp => {
    const matchType = resp.isExactMatch ? '🎯 Exact' : '🔍 Contains';
    reply += `**#${resp.id}** ${matchType}\n`;
    reply += `🔑 "${resp.trigger}"\n`;
    reply += `💬 "${resp.response.substring(0, 60)}${resp.response.length > 60 ? '...' : ''}"\n\n`;
  });
  
  if (responses.length > 10) {
    reply += `_... và ${responses.length - 10} items khác_\n\n`;
  }
  
  reply += `💡 Dùng \`!response delete <id>\` để xóa`;
  
  await message.reply(reply);
}

// !response delete <id>
async function handleResponseDelete(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xóa custom response!');
  }
  
  const id = parseInt(args[0]);
  if (isNaN(id)) {
    return message.reply('❌ ID không hợp lệ!');
  }
  
  const success = await deleteCustomResponse(id, message.guild.id);
  if (success) {
    await message.reply(`✅ Đã xóa custom response #${id}`);
  } else {
    await message.reply(`❌ Không tìm thấy response #${id}!`);
  }
}

// !logs [limit]
async function handleLogs(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xem logs!');
  }
  
  const limit = parseInt(args[0]) || 20;
  const logs = await getConversationHistory(message.guild.id, Math.min(limit, 50));
  
  if (logs.length === 0) {
    return message.reply('📊 Chưa có conversation logs!');
  }
  
  let reply = `📊 **CONVERSATION LOGS** (${logs.length} recent)\n\n`;
  
  logs.slice(0, 5).forEach(log => {
    const time = new Date(log.timestamp).toLocaleString('vi-VN');
    reply += `⏰ ${time}\n`;
    reply += `👤 <@${log.userId}>: ${log.userMessage.substring(0, 50)}...\n`;
    reply += `🤖 Bot: ${log.botResponse.substring(0, 50)}...\n\n`;
  });
  
  if (logs.length > 5) {
    reply += `_... và ${logs.length - 5} logs khác_`;
  }
  
  await message.reply(reply);
}

module.exports = {
  handleTrainAdd,
  handleTrainList,
  handleTrainDelete,
  handleTrainToggle,
  handleResponseAdd,
  handleResponseList,
  handleResponseDelete,
  handleLogs
};
