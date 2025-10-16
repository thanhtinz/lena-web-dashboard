// 18+ Content Blacklist Filter
// Bot sẽ từ chối nhẹ nhàng khi phát hiện nội dung nhạy cảm

const DEFAULT_BLACKLIST = [
  // 18+ keywords (tiếng Việt và tiếng Anh) - using word boundaries to avoid false positives
  'porn', 'xxx', 'nude', 'naked', 'hentai', 'nsfw',
  'địt', 'đụ', 'lồn', 'cặc', 'buồi', 'chịch', 'đéo', 'đĩ',
  'dâm dục', 'phim người lớn', 'phim 18+', 'phim sex',
  'onlyfans', 'jav', 'av idol', 'gravure',
  // Phrases to avoid false positives
  'watch porn', 'xem sex', 'tìm porn', 'find sex',
  // Violence/Gore
  'gore', 'máu me', 'bạo lực', 'giết người', 'tự tử',
  // Drugs
  'ma túy', 'ma tuý', 'cocaine', 'heroin', 'meth',
  // Gambling
  'cờ bạc', 'cá độ', 'đánh bạc'
];

// Single-word keywords that need word boundary matching
const WORD_BOUNDARY_KEYWORDS = ['sex'];

const CUTE_REJECTION_RESPONSES = [
  "Ư-ừm... m-mình không thể nói về chủ đề đó được... 🥺 Nó hơi... nhạy cảm quá... Bạn hỏi mình điều gì khác đi nhé! 💕",
  "À... à... chủ đề này không phù hợp lắm... 😳 M-mình ngại nói về nó... Chúng ta nói chuyện về điều gì vui vẻ hơn đi! ✨",
  "Ehehe... m-mình không được phép trả lời câu hỏi này... 🙈 Nó hơi... ấy ấy... Bạn thử hỏi điều gì khác nhé! 🌸",
  "Ơ... ơ... cái này mình không thể giúp được... 🥺💦 Nó không phù hợp với mình lắm... Hỏi mình về chủ đề khác đi bạn! 💕",
  "M-mình xin lỗi nhé... 😖 Chủ đề này hơi... không phù hợp... Mình không thể trò chuyện về nó được... Hãy hỏi mình điều gì dễ thương hơn đi! 🌺",
  "À... à... đ-đề này không được đâu bạn... 🙊 Mình sẽ bị... ấy mà... Chúng ta nói về điều gì vui vẻ hơn nhé! ✨",
  "Ư... ừm... m-mình thấy chủ đề này không phù hợp lắm... 😳 Bạn có thể hỏi mình điều gì khác không? Mình sẽ cố gắng giúp! 💖",
  "Ehehe... cái này... không được nói đâu... 🥺 M-mình hơi ngại... Chúng ta trò chuyện về thứ gì đó vui vẻ hơn đi bạn! 🌸"
];

function containsBlacklistedContent(message, customBlacklist = []) {
  const fullBlacklist = [...DEFAULT_BLACKLIST, ...customBlacklist];
  const lowerMessage = message.toLowerCase();
  
  // Check phrase-based keywords first (more specific)
  for (const keyword of fullBlacklist) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return {
        blocked: true,
        keyword: keyword
      };
    }
  }
  
  // Check word-boundary keywords (single words that need exact matching)
  for (const keyword of WORD_BOUNDARY_KEYWORDS) {
    // Create regex with word boundaries: \bsex\b will match "sex" but not "sexual" or "Essex"
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
    if (regex.test(message)) {
      return {
        blocked: true,
        keyword: keyword
      };
    }
  }
  
  return { blocked: false };
}

function getCuteRejectionResponse() {
  return CUTE_REJECTION_RESPONSES[Math.floor(Math.random() * CUTE_REJECTION_RESPONSES.length)];
}

function getDefaultBlacklist() {
  return [...DEFAULT_BLACKLIST];
}

module.exports = {
  containsBlacklistedContent,
  getCuteRejectionResponse,
  getDefaultBlacklist
};
