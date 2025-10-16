// Đoán từ - Word guessing game tiếng Việt
// Lấy cảm hứng từ "Vua Tiếng Việt" và "Đuổi Hình Bắt Chữ"

const wordCategories = {
  animals: {
    name: "Động vật",
    words: [
      { word: "VOI", hint: "Động vật có vòi dài, tai lớn, sống ở rừng" },
      { word: "CÁ MẬP", hint: "Loài cá săn mồi hung dữ dưới biển, răng sắc nhọn" },
      { word: "KANGAROO", hint: "Động vật có túi, nhảy bằng 2 chân sau, sống ở Úc" },
      { word: "DƠI", hint: "Bay được nhưng không phải chim, sống trong hang" },
      { word: "RẮN", hint: "Bò không chân, một số loài có nọc độc" },
      { word: "BẠN CHUỘT", hint: "Động vật gặm nhấm, có cặp răng cửa dài, sống trong nhà" },
      { word: "BÁO", hint: "Mèo hoang lớn, chạy rất nhanh, có đốm đen" },
      { word: "CHIM CÚ", hint: "Chim săn mồi ban đêm, đầu xoay 270 độ" },
      { word: "CÁ VOI", hint: "Động vật biển lớn nhất, có lỗ phun nước" },
      { word: "THỎ", hint: "Tai dài, nhảy lò cò, ăn cà rốt" }
    ]
  },
  fruits: {
    name: "Trái cây",
    words: [
      { word: "SẦU RIÊNG", hint: "Vua của các loại trái cây, vỏ gai, mùi đặc trưng" },
      { word: "XOÀI", hint: "Trái cây nhiệt đới, chua ngọt, múi vàng" },
      { word: "CAM", hint: "Trái tròn màu cam, nhiều vitamin C" },
      { word: "DƯA HẤU", hint: "Trái to, ruột đỏ, hạt đen, giải khát mùa hè" },
      { word: "MĂNG CỤT", hint: "Nữ hoàng trái cây, vỏ tím, ruột trắng ngọt" },
      { word: "CHÔM CHÔM", hint: "Vỏ gai mềm màu đỏ, ruột trắng ngọt" },
      { word: "DỪA", hint: "Có nước uống, ruột làm bánh, vỏ làm chổi" },
      { word: "KÉ", hint: "Trái dài, vỏ vàng, múi mềm ngọt" },
      { word: "DÂU TÂY", hint: "Trái đỏ nhỏ, hạt bên ngoài, vị chua ngọt" },
      { word: "LÊ", hint: "Trái tròn có cuống, giòn ngọt, màu xanh vàng" }
    ]
  },
  places: {
    name: "Địa danh",
    words: [
      { word: "VỊNH HẠ LONG", hint: "Di sản thiên nhiên thế giới, có hàng nghìn đảo đá vôi" },
      { word: "PHỐ CỔ HỘI AN", hint: "Phố cổ miền Trung, đèn lồng, di sản văn hóa" },
      { word: "SAPA", hint: "Thị trấn miền núi, ruộng bậc thang, sương mù" },
      { word: "PHAN THIẾT", hint: "Thành phố biển, mũi Né, đồi cát" },
      { word: "ĐÀ NẴNG", hint: "Thành phố đáng sống, cầu Rồng, biển Mỹ Khê" },
      { word: "NHA TRANG", hint: "Vịnh đẹp nhất thế giới, hòn Tre, tháp Chàm" },
      { word: "HUẾ", hint: "Cố đô, Đại Nội, sông Hương" },
      { word: "CÀ MAU", hint: "Mũi đất cực Nam Việt Nam" },
      { word: "HÀ NỘI", hint: "Thủ đô Việt Nam, hồ Gươm, 36 phố phường" },
      { word: "PHÚ QUỐC", hint: "Đảo ngọc, nước mắm, biển đẹp" }
    ]
  },
  food: {
    name: "Món ăn",
    words: [
      { word: "PHỞ", hint: "Món ăn quốc hồn quốc túy, nước dùng xương, bánh phở" },
      { word: "BÁNH MÌ", hint: "Bánh giòn, nhân thịt rau, di sản UNESCO" },
      { word: "BÚN CHẢ", hint: "Món Hà Nội, bún tươi, chả nướng, nước mắm chua ngọt" },
      { word: "GỎI CUỐN", hint: "Bánh tráng cuốn tôm thịt, rau sống, chấm tương" },
      { word: "CƠM TẤM", hint: "Cơm hạt nhỏ, sườn nướng, chả trứng" },
      { word: "BÁNH XÈO", hint: "Bánh màu vàng, giòn, nhân tôm thịt giá đỗ" },
      { word: "BÒ KHO", hint: "Thịt bò hầm, nước sốt đỏ, ăn với bánh mì" },
      { word: "BÁNH CHƯNG", hint: "Bánh Tết truyền thống, vuông, lá dong, đậu xanh" },
      { word: "CHẢ GIÒ", hint: "Chiên giòn, nhân thịt miến, chấm nước mắm" },
      { word: "XÔI XÉOÀI", hint: "Xôi vàng, đậu xanh, hành phi" }
    ]
  },
  objects: {
    name: "Đồ vật",
    words: [
      { word: "ĐIỆN THOẠI", hint: "Thiết bị gọi điện, nhắn tin, lướt mạng" },
      { word: "TỦ LẠNH", hint: "Bảo quản thức ăn, làm đá, giữ lạnh" },
      { word: "MÁY TÍNH", hint: "Thiết bị điện tử, làm việc, giải trí, học tập" },
      { word: "BÀN CHẢI ĐÁNH RĂNG", hint: "Dụng cụ vệ sinh răng miệng hàng ngày" },
      { word: "KÉO", hint: "Dụng cụ cắt giấy, vải, có 2 lưỡi" },
      { word: "LỌ HOA", hint: "Đựng hoa, trang trí bàn, làm bằng thủy tinh" },
      { word: "ĐÈN PIN", hint: "Chiếu sáng di động, dùng pin hoặc sạc điện" },
      { word: "GƯƠNG", hint: "Phản chiếu hình ảnh, soi mặt" },
      { word: "ÔDÙ", hint: "Che mưa, che nắng, gấp gọn được" },
      { word: "ĐỒNG HỒ", hint: "Xem giờ, báo thức, đeo tay hoặc treo tường" }
    ]
  }
};

const activeGames = new Map();

function getRandomWord() {
  const categories = Object.keys(wordCategories);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const category = wordCategories[randomCategory];
  const randomWord = category.words[Math.floor(Math.random() * category.words.length)];
  
  return {
    category: category.name,
    ...randomWord
  };
}

function createHiddenWord(word) {
  // Hiển thị một số chữ cái ngẫu nhiên
  const letters = word.split('');
  const revealCount = Math.max(1, Math.floor(letters.length * 0.3));
  const revealed = new Set();
  
  while (revealed.size < revealCount) {
    revealed.add(Math.floor(Math.random() * letters.length));
  }
  
  return letters.map((char, i) => {
    if (char === ' ') return ' ';
    return revealed.has(i) ? char : '_';
  }).join(' ');
}

async function startWordGuess(message) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  
  // Check if user already has an active game in this channel
  const gameKey = `${channelId}_${userId}`;
  if (activeGames.has(gameKey)) {
    return message.reply('❌ Bạn đang có một game đoán từ đang chơi! Dùng `!guess <từ>` để đoán hoặc `!giveup` để bỏ cuộc.');
  }
  
  const wordData = getRandomWord();
  const hiddenWord = createHiddenWord(wordData.word);
  
  activeGames.set(gameKey, {
    word: wordData.word.toUpperCase(),
    attempts: 0,
    maxAttempts: 5
  });
  
  const response = `
🎯 **GAME ĐOÁN TỪ**

**Chủ đề:** ${wordData.category}
**Gợi ý:** ${wordData.hint}

**Từ cần đoán:** \`${hiddenWord}\`
**Số lần đoán:** 5 lần

💡 *Dùng \`!guess <từ của bạn>\` để đoán!*
💡 *Dùng \`!giveup\` để bỏ cuộc và xem đáp án*
  `.trim();

  await message.reply(response);
  
  // Auto end game after 2 minutes
  setTimeout(() => {
    if (activeGames.has(gameKey)) {
      const game = activeGames.get(gameKey);
      activeGames.delete(gameKey);
      message.reply(`⏰ **Hết giờ!** Đáp án là: **${game.word}**`);
    }
  }, 120000);
}

async function guessWord(message, args) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  const gameKey = `${channelId}_${userId}`;
  
  if (!activeGames.has(gameKey)) {
    return message.reply('❌ Bạn chưa bắt đầu game! Dùng `!wordguess` để chơi.');
  }
  
  const guess = args.join(' ').toUpperCase().trim();
  if (!guess) {
    return message.reply('❌ Vui lòng nhập từ bạn đoán! VD: `!guess con voi`');
  }
  
  const game = activeGames.get(gameKey);
  game.attempts++;
  
  if (guess === game.word) {
    activeGames.delete(gameKey);
    return message.reply(`🎉 **CHÍNH XÁC!** Bạn đã đoán đúng sau ${game.attempts} lần thử! 🏆`);
  }
  
  if (game.attempts >= game.maxAttempts) {
    activeGames.delete(gameKey);
    return message.reply(`❌ **HẾT LƯỢT!** Đáp án đúng là: **${game.word}**\n\nChơi lại bằng \`!wordguess\` nhé! 😊`);
  }
  
  const remaining = game.maxAttempts - game.attempts;
  await message.reply(`❌ Sai rồi! Còn **${remaining}** lượt thử.\n💡 *Thử lại bằng \`!guess <từ của bạn>\`*`);
}

async function giveUpGame(message) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  const gameKey = `${channelId}_${userId}`;
  
  if (!activeGames.has(gameKey)) {
    return message.reply('❌ Bạn chưa có game nào đang chơi!');
  }
  
  const game = activeGames.get(gameKey);
  activeGames.delete(gameKey);
  
  await message.reply(`🏳️ **Bỏ cuộc!** Đáp án là: **${game.word}**\n\nĐừng bỏ cuộc lần sau nhé! Chơi lại bằng \`!wordguess\` 💪`);
}

module.exports = {
  startWordGuess,
  guessWord,
  giveUpGame
};
