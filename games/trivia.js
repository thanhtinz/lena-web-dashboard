// Đố vui - Câu đố trí tuệ tiếng Việt
// Nguồn: Tổng hợp từ các website đố vui Việt Nam

const activeGames = new Map();

const triviaQuestions = [
  // Câu đố hack não
  { q: "Có ba quả táo trên bàn và bạn lấy đi hai quả. Hỏi bạn còn bao nhiêu quả táo?", a: "2 quả (vì bạn đã lấy đi 2 quả rồi)" },
  { q: "Bố mẹ có sáu người con trai, mỗi người con trai có một em gái. Hỏi gia đình đó có bao nhiêu người?", a: "9 người (bố, mẹ, 6 con trai, 1 con gái)" },
  { q: "Đường thì ngọt hơn cát. Nhưng từ nào dài hơn?", a: "Từ 'đường' có 5 chữ cái, còn 'cát' chỉ có 3 chữ cái" },
  { q: "Cái gì luôn chạy không chờ ta bao giờ, nhưng chúng ta vẫn có thể đứng một chỗ để chờ nó?", a: "Thời gian / Đồng hồ" },
  { q: "Cây nhang càng đốt càng ngắn. Vậy cây gì càng đốt nhiều càng dài?", a: "Cây số" },
  { q: "Nếu chỉ có một que diêm, trong một ngày mùa đông giá rét, bạn bước vào căn phòng có một cây đèn, một bếp dầu, và một bếp củi, bạn thắp gì trước tiên?", a: "Que diêm" },
  { q: "30 chia 1/2, và cộng thêm 10, bằng bao nhiêu?", a: "70 (vì 30 chia cho 1/2 = 60, cộng 10 = 70)" },
  
  // Câu đố dân gian
  { q: "Đuôi thì chẳng thấy, mà có hai đầu?", a: "Con đường" },
  { q: "Tuổi thơ tôi nhọn như sừng. Lớn lên cởi áo lưng chừng quăng đi. Thân cao vun vút lạ kỳ?", a: "Cây tre" },
  { q: "Hoa gì mọc chốn bùn nhơ?", a: "Hoa sen" },
  { q: "Tròn tròn mà chẳng lăn đâu, bên trong nhân ngọt, ăn lâu nhớ hoài?", a: "Bánh trung thu" },
  { q: "Quả gì ôm lấy nỗi niềm?", a: "Quả sầu riêng" },
  
  // Câu đố toán học
  { q: "Tôi là một số, khi bạn thêm tôi với chính tôi, tôi trở thành 10. Tôi là số nào?", a: "Số 5" },
  { q: "Một cuộc đua xe có 8 người tham gia thi đấu, 1 xe tông vào 1 xe khác và bị hư, vậy còn mấy xe thi đấu?", a: "6 xe (vì xe bị tông cũng sẽ rời đường đua)" },
  { q: "Trong 5 phút, 5 máy tạo ra được 5 chi tiết. Hỏi trong bao nhiêu phút, 100 máy tạo ra được 100 chi tiết?", a: "5 phút (mỗi máy làm 1 chi tiết trong 5 phút)" },
  
  // Câu đố động vật
  { q: "Con gì hai mắt trong veo, thích nằm sưởi nắng, thích trèo cây cau?", a: "Con mèo" },
  { q: "Con gì đi không mỏi, đứng không mỏi, khi nằm là mỏi?", a: "Con cá" },
  { q: "Con gì không ăn không uống?", a: "Con số" },
  { q: "Một con hổ bị xích vào gốc cây, sợi xích dài 30m. Có 1 bụi cỏ cách gốc cây 31m, đố bạn làm sao con hổ ăn được bụi cỏ?", a: "Hổ đâu có ăn cỏ" },
  
  // Câu đố đồ vật
  { q: "Răng thì nhiều nhưng không nhai được là gì?", a: "Cái lược" },
  { q: "Có cổ nhưng không có miệng là gì?", a: "Cái áo / Cái chai" },
  { q: "Cái gì khi xài thì quăng đi, nhưng khi không xài thì lấy lại?", a: "Mỏ neo" },
  { q: "Cái gì tay trái cầm được còn tay phải có muốn cầm cũng không được?", a: "Cùi chỏ tay phải" },
  
  // Câu đố troll
  { q: "Nhà Nam có 4 anh chị em, 3 người lớn tên là Xuân, Hạ, Thu. Đố bạn người em út tên gì?", a: "Tên Nam" },
  { q: "Đố bạn khi Beckham thực hiện quả đá phạt đền, anh ta sẽ sút vào đâu?", a: "Vào quả bóng" },
  { q: "Trong một năm tháng nào có 28 ngày?", a: "Tháng nào cũng có 28 ngày" },
  { q: "Con mèo nào cực kỳ sợ chuột?", a: "Đô rê mon" },
  { q: "Sở thú bị cháy, đố bạn con gì chạy ra đầu tiên?", a: "Con người" },
  
  // Câu đố IQ
  { q: "Một người đàn ông có 8 quả táo, ông chia đều cho 10 đứa trẻ mà không cần cắt táo. Làm thế nào?", a: "Làm táo nghiền / nước ép táo chia đều" },
  { q: "Có thứ gì đi qua cửa sổ mà không làm vỡ kính?", a: "Ánh sáng / Âm thanh" },
  { q: "Bạn đang chạy đua và vượt qua người thứ 2. Vậy bạn đang ở vị trí nào?", a: "Vị trí thứ 2" },
  { q: "Cái gì có chân mà không đi được?", a: "Bàn, ghế" },
  { q: "Ai luôn nằm mà không bao giờ ngủ?", a: "Con sông" },
  
  // Câu đố văn hóa Việt
  { q: "Thành phố nào của Việt Nam được gọi là 'Thành phố mang tên Bác'?", a: "Thành phố Hồ Chí Minh" },
  { q: "Con sông nào dài nhất Việt Nam?", a: "Sông Mê Kông" },
  { q: "Món ăn nào được UNESCO công nhận là di sản văn hóa phi vật thể của Việt Nam?", a: "Phở / Bánh mì" },
  { q: "Quốc hoa của Việt Nam là gì?", a: "Hoa sen" },
  { q: "Vịnh nào của Việt Nam được UNESCO công nhận là di sản thiên nhiên thế giới?", a: "Vịnh Hạ Long" }
];

async function askTriviaQuestion(message) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  const gameKey = `${channelId}_${userId}`;
  
  // Check if user already has an active game
  if (activeGames.has(gameKey)) {
    return message.reply('❌ Bạn đang có một câu đố chưa trả lời! Hãy trả lời hoặc đợi hết giờ nhé! 😊');
  }
  
  const randomTrivia = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
  
  // Store game state
  activeGames.set(gameKey, {
    question: randomTrivia.q,
    answer: randomTrivia.a,
    askedAt: Date.now()
  });
  
  const response = `
<:lena_book:1427372004289286184> **ĐỐ VUI TRÍ TUỆ**

${randomTrivia.q}

💭 *Hãy suy nghĩ và trả lời ngay nhé! Sau 30 giây bot sẽ công bố đáp án...*
  `.trim();

  await message.reply(response);
  
  // Auto reveal answer after 30 seconds
  setTimeout(async () => {
    if (activeGames.has(gameKey)) {
      const game = activeGames.get(gameKey);
      activeGames.delete(gameKey);
      await message.reply(`⏰ **Hết giờ rồi!** Đáp án là: **${game.answer}**\n\nChơi lại bằng lệnh đố vui nhé! 🎮`);
    }
  }, 30000);
}

function checkTriviaAnswer(userId, channelId, userAnswer) {
  const gameKey = `${channelId}_${userId}`;
  
  if (!activeGames.has(gameKey)) {
    return null;
  }
  
  const game = activeGames.get(gameKey);
  activeGames.delete(gameKey);
  
  // Normalize answers for comparison
  const normalizedUserAnswer = userAnswer.toLowerCase().trim();
  const normalizedCorrectAnswer = game.answer.toLowerCase().trim();
  
  // Check if user answer contains key parts of correct answer
  const isCorrect = normalizedCorrectAnswer.includes(normalizedUserAnswer) || 
                    normalizedUserAnswer.includes(normalizedCorrectAnswer) ||
                    normalizedUserAnswer === normalizedCorrectAnswer;
  
  return {
    correct: isCorrect,
    answer: game.answer,
    question: game.question
  };
}

function hasActiveTriviaGame(userId, channelId) {
  return activeGames.has(`${channelId}_${userId}`);
}

module.exports = {
  askTriviaQuestion,
  checkTriviaAnswer,
  hasActiveTriviaGame
};
