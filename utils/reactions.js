const { getPersonalityMode } = require('../personalities/modes');

const SENTIMENT_REACTIONS = {
  positive: ['😊', '❤️', '🎉', '👍', '✨', '💖'],
  negative: ['😢', '😔', '🥺', '💔'],
  question: ['🤔', '❓', '💭'],
  excited: ['🎉', '🥳', '🌟', '✨', '🚀'],
  thanks: ['🙏', '💕', '😊', '✨'],
  code: ['💻', '🔧', '⚙️'],
  learning: ['📚', '💡', '🎓'],
  greeting: ['👋', '😊', '💕']
};

function analyzeMessageSentiment(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/cảm ơn|thank|thanks|cám ơn/)) {
    return 'thanks';
  }
  
  if (lowerMessage.match(/xin chào|hello|hi|chào|hey/)) {
    return 'greeting';
  }
  
  if (lowerMessage.match(/code|lập trình|program|function|class|debug/)) {
    return 'code';
  }
  
  if (lowerMessage.match(/học|study|bài tập|homework|giải thích|explain/)) {
    return 'learning';
  }
  
  if (lowerMessage.includes('?') || lowerMessage.match(/sao|tại sao|làm thế nào|how|why|what/)) {
    return 'question';
  }
  
  if (lowerMessage.match(/!+|wow|tuyệt|đỉnh|cool|amazing|awesome/)) {
    return 'excited';
  }
  
  if (lowerMessage.match(/buồn|sad|khóc|cry|tệ|bad/)) {
    return 'negative';
  }
  
  if (lowerMessage.match(/vui|happy|tốt|good|tuyệt|great|hay|nice/)) {
    return 'positive';
  }
  
  return 'positive';
}

function getReactionsForMessage(message, mode = 'lena') {
  const sentiment = analyzeMessageSentiment(message);
  const personalityMode = getPersonalityMode(mode);
  
  const sentimentEmojis = SENTIMENT_REACTIONS[sentiment] || SENTIMENT_REACTIONS.positive;
  const modeEmojis = personalityMode.defaultReactions || ['😊'];
  
  const allEmojis = [...new Set([...modeEmojis, ...sentimentEmojis])];
  
  const reactionCount = Math.min(2, allEmojis.length);
  const selectedReactions = [];
  
  for (let i = 0; i < reactionCount; i++) {
    const randomIndex = Math.floor(Math.random() * allEmojis.length);
    const emoji = allEmojis[randomIndex];
    if (!selectedReactions.includes(emoji)) {
      selectedReactions.push(emoji);
    }
  }
  
  return selectedReactions;
}

async function addReactionsToMessage(message, reactions) {
  try {
    for (const emoji of reactions) {
      await message.react(emoji);
    }
  } catch (error) {
    console.error('Error adding reactions:', error.message);
  }
}

module.exports = {
  getReactionsForMessage,
  addReactionsToMessage,
  analyzeMessageSentiment
};
