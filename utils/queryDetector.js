// Deterministic detector to identify queries that need real-time search
// This ensures we FORCE search before asking AI, instead of relying on unreliable function_call: 'auto'

function needsRealTimeSearch(message) {
  const lowerMessage = message.toLowerCase();
  
  // 0. Blacklist: Questions about the bot itself should NEVER trigger search
  const botQuestionPatterns = [
    /^(bot|bạn|lena|mày|em|cậu)\s+(là|làm|đang làm|tên|biết|hiểu|có thể|giúp|hỗ trợ)/i,
    /^(what|who|how|where)\s+(are|is)\s+(you|lena)/i,
    /(bạn|em|bot|lena)\s+(tên|là)\s+gì/i,
    /(bạn|em|bot|lena)\s+đang\s+làm\s+gì/i
  ];
  
  for (const pattern of botQuestionPatterns) {
    if (pattern.test(lowerMessage)) {
      return false; // Never search for bot-related questions
    }
  }
  
  // 1. Detect year mentions (2024, 2025, 2026, etc.)
  const yearPattern = /\b(202[4-9]|20[3-9]\d)\b/;
  if (yearPattern.test(lowerMessage)) {
    return true; // Year mentions usually need real-time info
  }
  
  // 2. Detect time-sensitive keywords in Vietnamese
  const vietnameseKeywords = [
    'hiện tại', 'bây giờ', 'hôm nay', 'ngày nay', 'mới nhất', 'gần đây',
    'tuần này', 'tháng này', 'năm nay', 'hiện nay', 'vừa mới',
    'cập nhật', 'tin tức', 'thời tiết', 'nhiệt độ', 'dự báo',
    'tỷ giá', 'bitcoin', 'chứng khoán', 'vn-index',
    'bão', 'lũ lụt', 'thiên tai', 'covid', 'dịch bệnh', 'chiến tranh',
    'bầu cử', 'tổng thống', 'thủ tướng', 'quốc hội', 'lịch thi đấu'
  ];
  
  for (const keyword of vietnameseKeywords) {
    if (lowerMessage.includes(keyword)) {
      return true;
    }
  }
  
  // 3. Detect time-sensitive keywords in English
  const englishKeywords = [
    'right now', 'today', 'current', 'currently', 'latest', 'recent', 'recently',
    'this week', 'this month', 'this year', 'update', 'breaking news', 'news today',
    'weather', 'temperature', 'forecast', 'exchange rate', 'stock price',
    'bitcoin', 'crypto', 'typhoon', 'flood', 'disaster',
    'covid', 'pandemic', 'war', 'election', 'president', 'schedule'
  ];
  
  for (const keyword of englishKeywords) {
    if (lowerMessage.includes(keyword)) {
      return true;
    }
  }
  
  // 4. Detect specific patterns with context (Vietnamese + English)
  const contextPatterns = [
    // Vietnamese patterns
    /mấy giờ/i,
    /ngày mấy/i,
    /\bgiá\s+(vàng|bạc|dầu|xăng|bitcoin|btc|eth|usd)/i,
    /\bra\s+(mắt\s+)?chưa/i, // "ra chưa", "ra mắt chưa"
    /\bphát hành\s+chưa/i,
    /tin tức.*gì/i,
    /thời tiết.*thế nào/i,
    /tỷ giá.*thế nào/i,
    
    // English patterns
    /\b(price|rate)\s+(of|for)\s+/i, // price of/for X
    /\b(gold|silver|oil|bitcoin|btc|eth|usd|stock)\s+(price|rate)/i, // X price/rate
    /\b(has|have)\s+.*(released|launched)/i, // has X released
    /(released|launched)\s+yet/i, // released yet
    /\bnews\s+(about|on|for)/i, // news about X
    /(japan|china|vietnam|korea|usa|us)\s+news/i // X news
  ];
  
  for (const pattern of contextPatterns) {
    if (pattern.test(lowerMessage)) {
      return true;
    }
  }
  
  return false;
}

function extractSearchQuery(message) {
  // Extract the core query from user message
  // Remove bot mentions and clean up
  let query = message
    .replace(/<@!?\d+>/g, '') // Remove Discord mentions
    .replace(/lena\s*,?\s*/gi, '') // Remove "Lena"
    .replace(/ơi/gi, '') // Remove Vietnamese interjections
    .replace(/ạ/gi, '')
    .trim();
  
  // If query is too short, use original
  if (query.length < 5) {
    query = message.replace(/<@!?\d+>/g, '').trim();
  }
  
  return query;
}

module.exports = {
  needsRealTimeSearch,
  extractSearchQuery
};
