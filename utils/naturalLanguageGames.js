// Natural Language Game Triggers
// Cho phép user kích hoạt games bằng cách nói chuyện tự nhiên

const gamePatterns = {
  whyQuestions: {
    patterns: [
      /\b(hỏi|cho|mình|em)\s*(vì\s*sao|tại\s*sao|why)/i,
      /\b(câu\s*hỏi|game|chơi)\s*(vì\s*sao|tại\s*sao)/i,
      /\bmuốn\s*(biết|học|nghe)\s*(vì\s*sao|tại\s*sao)/i,
      /\b(10|mười)\s*vạn\s*câu\s*hỏi/i,
      /\bhỏi\s*đáp\s*(vì\s*sao|tại\s*sao)/i,
      /\b(why\s*questions?|100k\s*why)/i,
      /\b(ask|tell)\s*me\s*why/i,
      /\bwhy\s*(game|quiz)/i
    ],
    description: '10 vạn câu hỏi vì sao / 100k Why Questions'
  },
  
  trivia: {
    patterns: [
      /\b(chơi|cho|mình)\s*(đố\s*vui|đố|câu\s*đố)/i,
      /\bđố\s*(em|mình|anh|chị)/i,
      /\b(game|chơi)\s*(trí\s*tuệ|iq|thông\s*minh)/i,
      /\b(muốn|thích)\s*chơi\s*(đố|đố\s*vui)/i,
      /\bhack\s*não/i,
      /\bđố\s*mẹo/i,
      /\b(brain\s*teaser|trivia|riddle|puzzle)/i,
      /\b(play|start)\s*(trivia|quiz|riddle)/i
    ],
    description: 'Đố vui trí tuệ / Brain Teasers'
  },
  
  wordGuess: {
    patterns: [
      /\b(chơi|game)\s*(đoán\s*từ|đoán\s*chữ)/i,
      /\b(muốn|cho)\s*(đoán\s*từ|đoán\s*chữ)/i,
      /\bđoán\s*từ\s*(đi|không|nhé)/i,
      /\b(vua\s*tiếng\s*việt|ghép\s*từ)/i,
      /\bword\s*guess/i,
      /\b(guess\s*the\s*word|word\s*game)/i,
      /\b(play|start)\s*word/i
    ],
    description: 'Game đoán từ / Word Guessing Game'
  },
  
  truthOrDare: {
    patterns: [
      /\b(chơi|game)\s*(truth|dare|thật|thách)/i,
      /\btruth\s*(or|hoặc)?\s*dare/i,
      /\bthật\s*hay\s*thách/i,
      /\b(cho|đưa)\s*(câu\s*hỏi|thử\s*thách|truth|dare)/i
    ],
    description: 'Truth or Dare'
  },
  
  rockPaperScissors: {
    patterns: [
      /\b(chơi|game)\s*(oẳn\s*tù\s*tì|kéo\s*búa\s*bao|rps)/i,
      /\boẳn\s*tù/i,
      /\bkéo\s*búa\s*bao/i,
      /\brock\s*paper\s*scissors/i,
      /\bsquid\s*game/i
    ],
    description: 'Rock Paper Scissors'
  },
  
  eightBall: {
    patterns: [
      /\b(hỏi|cho|mình)\s*(quả\s*cầu|8\s*ball|eight\s*ball)/i,
      /\bquả\s*cầu\s*thần/i,
      /\bsố\s*8/i,
      /\bmagic\s*8/i
    ],
    description: 'Magic 8-Ball'
  },
  
  gif: {
    patterns: [
      /\b(tìm|gửi|cho|mình)\s*(gif|ảnh\s*động)/i,
      /\bmuốn\s*xem\s*gif/i,
      /\bgif\s*(đi|nhé|không)/i
    ],
    description: 'GIF search'
  }
};

function detectGameIntent(messageContent) {
  const content = messageContent.toLowerCase();
  
  // Check each game pattern
  for (const [gameType, gameData] of Object.entries(gamePatterns)) {
    for (const pattern of gameData.patterns) {
      if (pattern.test(content)) {
        return {
          detected: true,
          gameType,
          description: gameData.description
        };
      }
    }
  }
  
  return { detected: false };
}

// Extract additional info from message if needed
function extractGameParams(messageContent, gameType) {
  const content = messageContent.toLowerCase();
  
  switch (gameType) {
    case 'eightBall':
      // Extract question after patterns like "hỏi quả cầu"
      const questionMatch = content.match(/(?:hỏi|cho|mình)(?:\s*quả\s*cầu)?[:\s]+(.+)/i);
      return questionMatch ? questionMatch[1].trim() : null;
      
    case 'gif':
      // Extract search term
      const gifMatch = content.match(/(?:tìm|gửi|cho)(?:\s*gif)?[:\s]+(.+)/i);
      return gifMatch ? gifMatch[1].trim() : null;
      
    default:
      return null;
  }
}

module.exports = {
  detectGameIntent,
  extractGameParams
};
