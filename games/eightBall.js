const responses = {
  positive: [
    "Chắc chắn rồi! ✨",
    "Tất nhiên là có! 💯",
    "Không còn nghi ngờ gì nữa! 🎯",
    "Mình tin là vậy! 😊",
    "Có vẻ khả quan đấy! 🌟",
    "Dấu hiệu cho thấy là có! 💫",
    "Hầu như chắc chắn! ⭐",
    "Triển vọng tốt lắm! 🎉",
    "Có, chắc chắn! ✅",
    "Bạn có thể tin tưởng vào điều đó! 💪"
  ],
  negative: [
    "Đừng mơ nữa! ❌",
    "Câu trả lời của mình là không! 🚫",
    "Nguồn tin của mình nói là không! 😅",
    "Không khả quan lắm... 😔",
    "Rất nghi ngờ... 🤔",
    "Đừng đặt cược vào điều đó! 🎲",
    "Mình nghĩ là không đâu... 😬",
    "Không, không bao giờ! 🙅",
    "Quên đi! 💔",
    "Triển vọng không tốt... 📉"
  ],
  uncertain: [
    "Hỏi lại sau đi... 🔮",
    "Không thể dự đoán được bây giờ... 🌫️",
    "Tập trung rồi hỏi lại! 🧘",
    "Đừng tin vào điều đó quá... ⚠️",
    "Không rõ lắm... 😐",
    "Mình cũng không chắc... 🤷",
    "Hơi mù mờ, hỏi lại sau nhé! 💭",
    "Có thể có, có thể không... 🎭",
    "Thời điểm chưa phải! ⏰",
    "Mình cần suy nghĩ thêm... 💡"
  ]
};

function getRandomResponse() {
  const categories = ['positive', 'negative', 'uncertain'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const categoryResponses = responses[randomCategory];
  const randomIndex = Math.floor(Math.random() * categoryResponses.length);
  
  return {
    response: categoryResponses[randomIndex],
    category: randomCategory
  };
}

async function ask8Ball(message, question) {
  if (!question || question.trim() === '') {
    return message.reply('💡 Hãy đặt một câu hỏi cho 8-Ball!\n\nVí dụ: `!8ball Hôm nay tôi có may mắn không?`');
  }
  
  const { response, category } = getRandomResponse();
  
  let emoji = '🔮';
  if (category === 'positive') emoji = '💚';
  if (category === 'negative') emoji = '💔';
  if (category === 'uncertain') emoji = '💭';
  
  const replyText = `${emoji} **Magic 8-Ball**\n\n**Câu hỏi:** ${question}\n\n**Trả lời:** ${response}`;
  
  await message.reply(replyText);
}

module.exports = {
  ask8Ball,
  getRandomResponse
};
