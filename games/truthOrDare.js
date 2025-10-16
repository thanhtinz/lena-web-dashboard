const truthQuestions = [
  "Điều gì bạn chưa bao giờ kể với ai?",
  "Người bạn thầm thích là ai?",
  "Việc xấu hổ nhất bạn từng làm là gì?",
  "Bí mật lớn nhất của bạn là gì?",
  "Điều gì khiến bạn sợ nhất?",
  "Bạn từng nói dối về điều gì?",
  "Crush đầu tiên của bạn là ai?",
  "Điều bạn hối hận nhất trong đời là gì?",
  "Giấc mơ kỳ lạ nhất bạn từng có?",
  "Nếu có thể biến mất 24h, bạn sẽ làm gì?",
  "Ai là người bạn ghen tị nhất?",
  "Bạn đã từng lén xem tin nhắn của ai?",
  "Thói quen xấu nhất của bạn là gì?",
  "Điều gì khiến bạn khóc gần đây nhất?",
  "Bạn có thích ai trong server này không?",
  "Kỷ niệm đáng xấu hổ nhất ở trường?",
  "Bạn từng ăn cắp gì chưa?",
  "Lời nói dối lớn nhất bạn từng nói?",
  "Nếu chỉ còn sống 1 ngày, bạn làm gì?",
  "Điều bạn ghét nhất ở bản thân?"
];

const dareChallenges = [
  "Đổi nickname thành 'Tôi yêu admin' trong 1 giờ",
  "Gửi một meme hài nhất bạn có",
  "Nói 'Tôi là người tuyệt vời nhất' bằng voice",
  "Spam 10 emoji liên tiếp",
  "Khen 3 người trong server",
  "Post một bức ảnh funny của bạn",
  "Hát 1 đoạn bài hát yêu thích",
  "Nói 'Lena là bot tốt nhất' 5 lần",
  "Tag random 3 người và nói họ cute",
  "Đổi avatar thành ảnh meme trong 1 giờ",
  "Nhảy một điệu trước camera (nếu có)",
  "Viết thơ tặng người phía trên bạn",
  "Livestream ăn một thứ gì đó trong 30s",
  "Nói ngược tên của 5 người liên tiếp",
  "Kể 1 câu chuyện cười (phải buồn cười!)",
  "Gọi điện cho crush và hỏi 'bạn ăn cơm chưa?'",
  "Chụp ảnh mặt mộc và gửi lên server",
  "Chia sẻ playlist nhạc của bạn",
  "Làm 10 cái hít đất (chứng minh bằng video)",
  "Reaction ❤️ cho 10 tin nhắn cuối cùng"
];

function getRandomTruth() {
  const random = Math.floor(Math.random() * truthQuestions.length);
  return truthQuestions[random];
}

function getRandomDare() {
  const random = Math.floor(Math.random() * dareChallenges.length);
  return dareChallenges[random];
}

async function playTruthOrDare(message) {
  const choice = Math.random() < 0.5 ? 'truth' : 'dare';
  
  if (choice === 'truth') {
    const question = getRandomTruth();
    await message.reply(`🤔 **TRUTH**\n\n${question}\n\n*Hãy trả lời thật lòng nhé!*`);
  } else {
    const challenge = getRandomDare();
    await message.reply(`😈 **DARE**\n\n${challenge}\n\n*Dám không?*`);
  }
}

async function askTruth(message) {
  const question = getRandomTruth();
  await message.reply(`🤔 **TRUTH**\n\n${question}\n\n*Hãy trả lời thật lòng nhé!*`);
}

async function giveDare(message) {
  const challenge = getRandomDare();
  await message.reply(`😈 **DARE**\n\n${challenge}\n\n*Dám không?*`);
}

module.exports = {
  playTruthOrDare,
  askTruth,
  giveDare
};
