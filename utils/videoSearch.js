// 🎵 Video & Music Search System
// Tự động tìm video YouTube, TikTok khi user muốn nghe nhạc hoặc xem video

// Detection patterns cho video/music search requests
const VIDEO_SEARCH_PATTERNS = [
  // YouTube Music/Video requests (Priority 9-10)
  { pattern: /(tìm|tìm\s+giúp|search|find)\s+.*\s+(bài\s+hát|nhạc|music|song|mv)/i, priority: 10 },
  { pattern: /(tìm|tìm\s+giúp|search|find)\s+.*\s+(video|clip)/i, priority: 10 },
  { pattern: /(nghe|play|phát|bật)\s+(bài|nhạc|music|song)/i, priority: 9 },
  { pattern: /(xem|watch|coi)\s+(video|clip|mv)/i, priority: 9 },
  { pattern: /cho\s+(mình|em|tớ)\s+(nghe|xem)\s+(bài|video)/i, priority: 9 },
  
  // Platform-specific (Priority 8-9)
  { pattern: /(tìm|search)\s+.*\s+(youtube|yt)/i, priority: 8 },
  { pattern: /(tìm|search)\s+.*\s+(tiktok|tt)/i, priority: 8 },
  { pattern: /link\s+(youtube|tiktok|video|nhạc)/i, priority: 9 },
  
  // Natural requests (Priority 7-8)
  { pattern: /có\s+(link|url)\s+(bài|video|nhạc)/i, priority: 8 },
  { pattern: /(gửi|share)\s+.*\s+(bài\s+hát|video|clip)/i, priority: 7 },
  { pattern: /muốn\s+(nghe|xem|coi)\s+(bài|video)/i, priority: 8 },
  { pattern: /(bài|video|nhạc)\s+(nào|gì)\s+(hay|ngon|trending)/i, priority: 7 },
  
  // Trending style (Priority 6-7)
  { pattern: /(tìm\s+ntn|search\s+ntn)\s+(bài|video)/i, priority: 7 },
  { pattern: /có\s+(bài|video)\s+.*\s+(ko|không|hem)/i, priority: 6 },
  { pattern: /(recommend|gợi\s+ý)\s+(bài|video|nhạc)/i, priority: 7 }
];

// Detect platform từ message
function detectPlatform(message) {
  const lowerMsg = message.toLowerCase();
  
  if (/\b(youtube|yt)\b/i.test(lowerMsg)) {
    return 'youtube';
  }
  if (/\b(tiktok|tt)\b/i.test(lowerMsg)) {
    return 'tiktok';
  }
  
  // Default: YouTube (phổ biến nhất)
  return 'youtube';
}

// Detect content type từ message
function detectContentType(message) {
  const lowerMsg = message.toLowerCase();
  
  if (/\b(bài\s+hát|nhạc|music|song|mv|audio)\b/i.test(lowerMsg)) {
    return 'music';
  }
  if (/\b(video|clip|vlog|tutorial|hướng\s+dẫn)\b/i.test(lowerMsg)) {
    return 'video';
  }
  
  // Default: video
  return 'video';
}

// Extract search query từ message
function extractVideoSearchQuery(message) {
  // Remove common prefixes
  let query = message
    .replace(/^(lena|ơi|này|,|!|\?|\s)+/gi, '')
    .replace(/(tìm|tìm\s+giúp|search|find|cho\s+mình|cho\s+em)\s+/gi, '')
    .replace(/(bài\s+hát|nhạc|video|clip|mv)\s+/gi, '')
    .replace(/(youtube|tiktok|yt|tt)\s+/gi, '')
    .replace(/(nghe|xem|coi|play|watch)\s+/gi, '')
    .replace(/\s+(đi|nha|nhé|với|vứi|zới)$/gi, '')
    .trim();
  
  return query || message;
}

// Kiểm tra xem message có phải video/music search request không
function isVideoSearchRequest(message) {
  let maxPriority = 0;
  
  for (const { pattern, priority } of VIDEO_SEARCH_PATTERNS) {
    if (pattern.test(message)) {
      maxPriority = Math.max(maxPriority, priority);
    }
  }
  
  // Increase threshold to reduce false positives - only trigger on priority >= 8
  return maxPriority >= 8;
}

// Search YouTube videos
async function searchYouTube(query, apiKey) {
  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message: 'YouTube API key chưa được cấu hình'
    };
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      return {
        success: false,
        error: 'API_ERROR',
        message: data.error.message
      };
    }
    
    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        error: 'NO_RESULTS',
        message: 'Không tìm thấy video nào phù hợp'
      };
    }
    
    const results = data.items.map(item => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description.substring(0, 100) + '...'
    }));
    
    return {
      success: true,
      results,
      platform: 'YouTube'
    };
  } catch (error) {
    console.error('❌ YouTube search error:', error);
    return {
      success: false,
      error: 'FETCH_ERROR',
      message: error.message
    };
  }
}

// Search TikTok via web search (fallback)
async function searchTikTok(query) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Use DuckDuckGo to search for TikTok videos
    const searchQuery = `${query} site:tiktok.com`;
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // DuckDuckGo instant answer API có thể không trả về kết quả tốt
    // Fallback: trả về search URL
    const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
    
    return {
      success: true,
      results: [{
        title: `Tìm "${query}" trên TikTok`,
        url: tiktokSearchUrl,
        description: 'Click để xem kết quả tìm kiếm trên TikTok'
      }],
      platform: 'TikTok',
      isSearchUrl: true
    };
  } catch (error) {
    console.error('❌ TikTok search error:', error);
    return {
      success: false,
      error: 'FETCH_ERROR',
      message: error.message
    };
  }
}

// Format kết quả thành Discord message
function formatVideoResults(searchResult, contentType) {
  if (!searchResult.success) {
    // Error responses với Lena style
    const errorMessages = {
      'NO_API_KEY': 'Ơ... ơ... m-mình chưa có YouTube API key nên không tìm được... 🥺\nBạn có thể tự search trên YouTube nhé! 🌸',
      'API_ERROR': `À... à... có lỗi xảy ra rồi... 😖\nLỗi: ${searchResult.message}`,
      'NO_RESULTS': `Ư-ừm... mình tìm mãi mà không thấy kết quả nào... 🥺\nThử search với từ khóa khác nhé! 💕`,
      'FETCH_ERROR': `Ehehe... có gì đó sai sai... 😳\nThử lại sau nhé! ✨`
    };
    
    return errorMessages[searchResult.error] || errorMessages['FETCH_ERROR'];
  }
  
  const { results, platform, isSearchUrl } = searchResult;
  
  // Cute intro
  const intros = [
    '🎵 Ư-ừm... mình tìm thấy rồi nè! ',
    '🎬 À... à... đây nè bạn! ',
    '✨ Ehehe~ mình tìm được những cái này! ',
    '🌸 Ơ... mình có mấy cái hay đây! '
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];
  
  if (isSearchUrl) {
    // TikTok search URL
    return `${intro}\n\n**${results[0].title}**\n🔗 ${results[0].url}\n\n${results[0].description} 💕`;
  }
  
  // YouTube results (top 3)
  let message = `${intro}\n\n`;
  
  results.forEach((result, index) => {
    const emoji = ['🥇', '🥈', '🥉'][index] || '⭐';
    message += `${emoji} **${result.title}**\n`;
    message += `   👤 ${result.channel}\n`;
    message += `   🔗 ${result.url}\n\n`;
  });
  
  // Cute outro
  const outros = [
    'Hy vọng có bài bạn thích nha! 🥺💕',
    'Nghe/xem vui vẻ nhé! 🌸✨',
    'Bài nào cũng hay hết á! 😊💖',
    'Chọn bài nào cũng được nha! 🎵✨'
  ];
  message += outros[Math.floor(Math.random() * outros.length)];
  
  return message;
}

module.exports = {
  isVideoSearchRequest,
  detectPlatform,
  detectContentType,
  extractVideoSearchQuery,
  searchYouTube,
  searchTikTok,
  formatVideoResults
};
