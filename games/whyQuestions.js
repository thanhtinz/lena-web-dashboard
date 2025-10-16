// 10 vạn câu hỏi vì sao - Câu hỏi tri thức cho trẻ em và người lớn
// Nguồn: Tổng hợp từ bộ sách "10 vạn câu hỏi vì sao" và các nguồn giáo dục Việt Nam

const activeGames = new Map();

const whyQuestions = [
  // Thiên nhiên & Khoa học
  { q: "Vì sao trời lại mưa?", a: "Vì nước trên mặt đất bốc hơi lên trời, gặp lạnh ngưng tụ thành giọt nước rơi xuống." },
  { q: "Vì sao bầu trời có màu xanh?", a: "Vì ánh sáng mặt trời khi đi qua khí quyển, ánh sáng xanh bị tán xạ nhiều nhất nên ta nhìn thấy bầu trời màu xanh." },
  { q: "Vì sao có sấm chớp?", a: "Vì các đám mây va chạm tạo ra điện tích lớn, khi phóng điện tạo ra tia lửa (chớp) và tiếng nổ lớn (sấm)." },
  { q: "Vì sao có cầu vồng?", a: "Vì ánh sáng mặt trời xuyên qua giọt nước mưa bị khúc xạ và phân tán thành 7 màu." },
  { q: "Vì sao biển lại mặn?", a: "Vì nước sông đổ ra biển mang theo muối khoáng từ đất đá, qua hàng triệu năm biển trở nên mặn." },
  { q: "Vì sao có ngày và đêm?", a: "Vì Trái Đất tự quay quanh trục của nó, phần quay về phía Mặt Trời là ban ngày, phần khuất là ban đêm." },
  { q: "Vì sao có 4 mùa trong năm?", a: "Vì trục Trái Đất nghiêng 23.5 độ, khi quay quanh Mặt Trời tạo ra sự thay đổi nhiệt độ và ánh sáng." },
  { q: "Vì sao lá cây có màu xanh?", a: "Vì lá cây có chất diệp lục (chlorophyll) màu xanh giúp quang hợp." },
  { q: "Vì sao lá cây rụng vào mùa thu?", a: "Vì thiếu ánh sáng mặt trời, cây ngừng sản xuất diệp lục, lá chuyển màu vàng đỏ rồi rụng." },
  { q: "Vì sao núi lửa phun trào?", a: "Vì magma nóng chảy dưới lòng đất bị ép lên với áp suất lớn, vượt qua lớp vỏ Trái Đất phun ra ngoài." },
  
  // Vũ trụ & Thiên văn
  { q: "Vì sao Mặt Trăng sáng vào ban đêm?", a: "Vì Mặt Trăng phản chiếu ánh sáng của Mặt Trời." },
  { q: "Vì sao các vì sao nhấp nháy?", a: "Vì ánh sáng của ngôi sao đi qua khí quyển Trái Đất bị giao động làm ánh sáng nhấp nháy." },
  { q: "Vì sao Mặt Trời mọc đằng Đông và lặn ở phía Tây?", a: "Vì Trái Đất tự quay quanh trục từ Tây sang Đông, nên ta thấy Mặt Trời di chuyển từ Đông sang Tây." },
  { q: "Vì sao có nguyệt thực và nhật thực?", a: "Nguyệt thực: Trái Đất che Mặt Trăng. Nhật thực: Mặt Trăng che Mặt Trời." },
  { q: "Vì sao Trái Đất quay mà ta không cảm thấy?", a: "Vì Trái Đất quay đều đặn, ta và mọi vật xung quanh chuyển động cùng tốc độ nên không cảm thấy." },
  
  // Động vật
  { q: "Vì sao chó hay vẫy đuôi?", a: "Để thể hiện cảm xúc vui vẻ, thân thiện hoặc hào hứng." },
  { q: "Vì sao mèo kêu meo meo?", a: "Để giao tiếp với người, xin ăn hoặc thu hút sự chú ý." },
  { q: "Vì sao gà trống gáy vào sáng sớm?", a: "Vì đồng hồ sinh học của gà phản ứng với ánh sáng ban mai để báo hiệu lãnh địa." },
  { q: "Vì sao ong có thể bay?", a: "Vì đôi cánh của ong vỗ rất nhanh (200 lần/giây) tạo lực nâng." },
  { q: "Vì sao tắc kè hoa đổi màu?", a: "Để ngụy trang, điều hòa nhiệt độ hoặc thể hiện cảm xúc." },
  { q: "Vì sao chim có thể bay?", a: "Vì chim có xương rỗng nhẹ, bộ lông và cánh tạo lực nâng khi vỗ." },
  { q: "Vì sao cá hô hấp dưới nước?", a: "Vì cá có mang lọc oxy hòa tan trong nước." },
  { q: "Vì sao rắn lột xác?", a: "Để lớn lên, da cũ không co giãn được nên phải lột bỏ da mới phát triển." },
  { q: "Vì sao dơi bay vào ban đêm?", a: "Vì dơi dùng sóng siêu âm để định vị trong bóng tối, ban đêm ít kẻ thù hơn." },
  { q: "Vì sao voi có vòi dài?", a: "Để hút nước uống, lấy thức ăn, tắm rửa và giao tiếp." },
  
  // Cơ thể con người
  { q: "Vì sao ta có hai mắt?", a: "Để nhìn được chiều sâu (3D) và có tầm nhìn rộng hơn." },
  { q: "Vì sao ta thấy đói?", a: "Vì mức đường trong máu giảm, dạ dày trống, não gửi tín hiệu đói." },
  { q: "Vì sao ta đổ mồ hôi?", a: "Để điều hòa nhiệt độ cơ thể, khi nóng mồ hôi bốc hơi làm mát." },
  { q: "Vì sao ta phải ngủ?", a: "Để cơ thể nghỉ ngơi, phục hồi năng lượng, não củng cố trí nhớ." },
  { q: "Vì sao ta nấc?", a: "Vì cơ hoành co thắt đột ngột, dây thanh âm đóng lại tạo tiếng nấc." },
  { q: "Vì sao ta đau khi bị thương?", a: "Vì các dây thần kinh gửi tín hiệu cảnh báo đến não rằng cơ thể bị tổn thương." },
  { q: "Vì sao răng sữa rụng?", a: "Để nhường chỗ cho răng vĩnh viễn lớn hơn, chắc khỏe hơn mọc lên." },
  { q: "Vì sao ta có móng tay?", a: "Để bảo vệ đầu ngón tay, giúp cầm nắm vật nhỏ và gãi ngứa." },
  { q: "Vì sao máu có màu đỏ?", a: "Vì máu có hemoglobin chứa sắt, khi gặp oxy tạo màu đỏ." },
  { q: "Vì sao ta có lưỡi?", a: "Để nếm vị, nhai thức ăn, nuốt và phát âm." },
  
  // Công nghệ & Đời sống
  { q: "Vì sao máy bay bay được trên trời?", a: "Vì cánh máy bay tạo lực nâng khi không khí chảy qua, lớn hơn trọng lực kéo xuống." },
  { q: "Vì sao tàu thủy không chìm?", a: "Vì lực đẩy Archimedes của nước lớn hơn trọng lượng tàu." },
  { q: "Vì sao điện thoại gọi được cho nhau?", a: "Vì tín hiệu điện chuyển thành sóng vô tuyến, truyền qua trạm phát sóng đến điện thoại khác." },
  { q: "Vì sao tủ lạnh làm lạnh được?", a: "Vì chất làm lạnh hấp thụ nhiệt khi bay hơi, sau đó được nén và thải nhiệt ra ngoài." },
  { q: "Vì sao đèn huỳnh quang sáng?", a: "Vì dòng điện kích thích hơi thủy ngân phát ra tia UV, tia này đập vào lớp bột huỳnh quang phát sáng." },
  { q: "Vì sao nam châm hút sắt?", a: "Vì nam châm tạo từ trường, các electron trong sắt xếp thành cực từ bị hút về." },
  { q: "Vì sao pin hết điện?", a: "Vì phản ứng hóa học trong pin tạo ra điện, khi chất phản ứng hết thì pin cạn." },
  { q: "Vì sao xe đạp đứng được khi chạy?", a: "Vì bánh xe quay tạo mômen quán tính giúp giữ thăng bằng." },
  { q: "Vì sao micro thu được âm thanh?", a: "Vì sóng âm làm rung màng micro, chuyển thành tín hiệu điện." },
  { q: "Vì sao máy tính hoạt động?", a: "Vì CPU xử lý tín hiệu điện nhị phân (0 và 1) theo chương trình để thực hiện tác vụ." }
];

async function askWhyQuestion(message) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  const gameKey = `${channelId}_${userId}`;
  
  // Check if user already has an active game
  if (activeGames.has(gameKey)) {
    return message.reply('❌ Bạn đang có một câu hỏi chưa trả lời! Hãy trả lời hoặc đợi hết giờ nhé! 😊');
  }
  
  const randomQuestion = whyQuestions[Math.floor(Math.random() * whyQuestions.length)];
  
  // Store game state
  activeGames.set(gameKey, {
    question: randomQuestion.q,
    answer: randomQuestion.a,
    askedAt: Date.now()
  });
  
  const response = `
<:lena_book:1427372004289286184> **10 VẠN CÂU HỎI VÌ SAO**

**Câu hỏi:** ${randomQuestion.q}

💡 *Gợi ý: Suy nghĩ và trả lời xem! Sau 25 giây bot sẽ công bố đáp án...*
  `.trim();

  await message.reply(response);
  
  // Auto reveal answer after 25 seconds
  setTimeout(async () => {
    if (activeGames.has(gameKey)) {
      const game = activeGames.get(gameKey);
      activeGames.delete(gameKey);
      await message.reply(`⏰ **Hết giờ rồi!** Đáp án là: **${game.answer}**\n\nChơi lại bằng lệnh vì sao nhé! 🎮`);
    }
  }, 25000);
}

function checkWhyAnswer(userId, channelId, userAnswer) {
  const gameKey = `${channelId}_${userId}`;
  
  if (!activeGames.has(gameKey)) {
    return null;
  }
  
  const game = activeGames.get(gameKey);
  activeGames.delete(gameKey);
  
  // Normalize answers for comparison
  const normalizedUserAnswer = userAnswer.toLowerCase().trim();
  const normalizedCorrectAnswer = game.answer.toLowerCase().trim();
  
  // Extract key concepts from the correct answer
  const keyWords = ['vì', 'do', 'bởi', 'là', 'có', 'được', 'khi', 'nên'];
  const correctAnswerWords = normalizedCorrectAnswer
    .split(' ')
    .filter(word => word.length > 3 && !keyWords.includes(word));
  
  // Check if user answer contains key concepts
  let matchCount = 0;
  for (const word of correctAnswerWords) {
    if (normalizedUserAnswer.includes(word)) {
      matchCount++;
    }
  }
  
  // Consider correct if at least 40% of key words match
  const isCorrect = matchCount >= Math.ceil(correctAnswerWords.length * 0.4);
  
  return {
    correct: isCorrect,
    answer: game.answer,
    question: game.question
  };
}

function hasActiveWhyGame(userId, channelId) {
  return activeGames.has(`${channelId}_${userId}`);
}

module.exports = {
  askWhyQuestion,
  checkWhyAnswer,
  hasActiveWhyGame
};
