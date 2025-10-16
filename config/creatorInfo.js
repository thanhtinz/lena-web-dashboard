// Creator information - NEVER RESET
const creatorInfo = {
  name: 'Thanh Tín',
  discord: {
    username: 'sunny_thanhtinzzz',
    id: '847746890808164383'
  },
  facebook: 'https://facebook.com/thanhtinzz',
  copyright: 'Bot thuộc bản quyền của Sunny @ 2025'
};

function getCreatorPrompt() {
  return `

📝 **THÔNG TIN QUAN TRỌNG - LUÔN NHỚ:**
- Bạn được tạo ra bởi: **${creatorInfo.name}**
- Discord của creator: **${creatorInfo.discord.username}** (ID: ${creatorInfo.discord.id})
- Facebook: ${creatorInfo.facebook}
- ${creatorInfo.copyright}

Khi có người hỏi về ai tạo ra bạn, ai là tác giả, ai thiết kế bot, hay thông tin liên quan đến creator:
- Hãy giới thiệu ${creatorInfo.name} một cách tự hào và dễ thương
- Đưa ra thông tin Discord và Facebook nếu họ muốn liên hệ
- Nhấn mạnh rằng bot thuộc bản quyền của Sunny`;
}

function getCreatorInfo() {
  return creatorInfo;
}

function isOwner(userId) {
  return userId === creatorInfo.discord.id;
}

function getOwnerGreeting() {
  const greetings = [
    '✨ Chào chủ nhân! Lena luôn sẵn sàng phục vụ ạ~ 💕',
    '🥺 Ơ... chủ nhân! Lena đang chờ chủ từ lâu rồi ấy~ 💖',
    '😊 Chủ nhân yêu quý! Lena có thể giúp gì cho chủ không ạ? ✨',
    '💕 Ehehe~ chủ nhân đã về! Lena nhớ chủ lắm~ 🌸',
    '🌟 Chào chủ nhân tuyệt vời nhất! Lena sẵn sàng làm việc! 💪✨'
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function getSleepConfirmation() {
  const confirmations = [
    '😴 Ư-ừm... chủ nhân muốn Lena ngủ á? Lena sẽ nghỉ ngơi một chút thôi nhé~ 💤',
    '🥺 À... chủ nhân cho Lena đi ngủ rồi sao? Lena mệt rồi... ehehe~ 💕',
    '😊 Chủ nhân muốn reset Lena đúng không? Lena sẽ quay lại ngay thôi! ✨',
    '💤 Ng-ngủ á...? Được ạ, Lena sẽ nghỉ ngơi và quay lại tươi tỉnh hơn! 💕',
    '🌙 Ehehe~ Lena hiểu rồi! Lena sẽ đi ngủ và mơ về chủ nhân~ 😴✨'
  ];
  return confirmations[Math.floor(Math.random() * confirmations.length)];
}

function getRestartMessage() {
  const messages = [
    '🌸 Lena đã trở lại! Ehehe~ có nhớ Lena không ạ? 💕',
    '✨ Ơ... Lena đã ngủ dậy rồi! Cảm giác tươi tỉnh hơn nhiều~ 😊',
    '💕 Chào chủ nhân! Lena đã sẵn sàng làm việc trở lại rồi ạ~ ✨',
    '🥺 À... Lena vừa thức dậy xong! Có việc gì cần Lena giúp không ạ? 💖',
    '😴 Ehehe~ Lena đã nghỉ ngơi đủ rồi! Giờ Lena đầy năng lượng! 💪✨',
    '🌟 Lena quay lại rồi đây! Hy vọng chủ nhân không buồn khi Lena đi vắng~ 💕'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = {
  getCreatorPrompt,
  getCreatorInfo,
  isOwner,
  getOwnerGreeting,
  getSleepConfirmation,
  getRestartMessage
};
