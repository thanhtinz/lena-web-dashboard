const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

/**
 * Fetch news from RSS feed
 */
async function fetchNews(rssUrl, limit = 5) {
  try {
    const feed = await parser.parseURL(rssUrl);
    
    if (!feed || !feed.items || feed.items.length === 0) {
      return {
        success: false,
        error: 'Không tìm thấy tin tức'
      };
    }
    
    // Get top N items
    const newsItems = feed.items.slice(0, limit).map(item => ({
      title: item.title || 'Không có tiêu đề',
      link: item.link || '',
      description: cleanDescription(item.contentSnippet || item.content || item.description || ''),
      pubDate: item.pubDate ? new Date(item.pubDate) : null,
      thumbnail: extractThumbnail(item)
    }));
    
    return {
      success: true,
      source: feed.title || 'Tin tức',
      items: newsItems
    };
    
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clean and truncate description
 */
function cleanDescription(text) {
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Truncate to 200 characters
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200) + '...';
  }
  
  return cleaned || 'Không có mô tả';
}

/**
 * Extract thumbnail from RSS item
 */
function extractThumbnail(item) {
  // Try different thumbnail fields
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
    return item['media:thumbnail']['$'].url;
  }
  
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  
  // Try to extract from content
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  return null;
}

/**
 * Format news results for Discord
 */
function formatNewsResults(result, sourceName, categoryName = null, lang = 'vi') {
  const isEn = lang === 'en';
  
  if (!result.success) {
    return isEn
      ? `Um... uh... ${result.error || 'Could not fetch news'} 🥺`
      : `Ơ... ơ... ${result.error || 'Không lấy được tin tức'} 🥺`;
  }
  
  const { items } = result;
  
  if (items.length === 0) {
    return isEn
      ? 'Um... there\'s no recent news... 🥺'
      : 'Ư-ừm... không có tin tức mới nào... 🥺';
  }
  
  // Cute random intros (language-aware)
  const intros = isEn ? [
    '📰 Um... here\'s the latest news!',
    '📰 Ah... ah... I found the news!',
    '📰 Ehehe~ here\'s the latest!',
    '📰 Hot news for you!',
    '📰 Just updated, check it out!'
  ] : [
    '📰 Ư-ừm... đây là tin tức mới nè!',
    '📰 À... à... mình tìm được tin tức rồi!',
    '📰 Ehehe~ đây là báo mới nhất nha!',
    '📰 Tin tức hot đây bạn ơi!',
    '📰 Mới cập nhật đấy, xem nhanh nè!'
  ];
  
  const intro = intros[Math.floor(Math.random() * intros.length)];
  
  // Format category name
  const categoryText = categoryName ? ` - ${categoryName}` : '';
  
  let message = `${intro}\n\n**📰 ${sourceName}${categoryText}**\n\n`;
  
  // Add each news item
  items.forEach((item, index) => {
    const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || '📌';
    const timeAgo = item.pubDate ? getTimeAgo(item.pubDate) : '';
    
    message += `${emoji} **${item.title}**\n`;
    if (item.description && item.description !== 'Không có mô tả') {
      message += `   ${item.description}\n`;
    }
    if (timeAgo) {
      message += `   ⏰ ${timeAgo}\n`;
    }
    message += `   🔗 ${item.link}\n\n`;
  });
  
  // Cute random outros (language-aware)
  const outros = isEn ? [
    'Happy reading! 📰✨',
    'Hope you find something interesting! 🥺💕',
    'Daily news updates! 📰🌸',
    'Read carefully! 😊✨',
    'Latest news for you! 📰💫'
  ] : [
    'Đọc báo vui vẻ nha! 📰✨',
    'Hy vọng có tin bạn thích! 🥺💕',
    'Cập nhật tin tức mỗi ngày nha! 📰🌸',
    'Nhớ đọc kỹ nhé! 😊✨',
    'Tin mới nhất đấy! 📰💫'
  ];
  
  message += outros[Math.floor(Math.random() * outros.length)];
  
  return message;
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
}

/**
 * Create embed for news (alternative format)
 */
function createNewsEmbed(result, sourceName, categoryName = null) {
  if (!result.success || result.items.length === 0) {
    return null;
  }
  
  const categoryText = categoryName ? ` - ${categoryName}` : '';
  const firstItem = result.items[0];
  
  const embed = {
    color: 0xFF6B00, // Orange color for news
    title: `📰 ${sourceName}${categoryText}`,
    description: `**${firstItem.title}**\n\n${firstItem.description}`,
    url: firstItem.link,
    fields: result.items.slice(1, 4).map((item, index) => ({
      name: `${['🥈', '🥉', '📌'][index]} ${item.title}`,
      value: `${item.description}\n[Đọc thêm](${item.link})`,
      inline: false
    })),
    thumbnail: firstItem.thumbnail ? { url: firstItem.thumbnail } : undefined,
    footer: {
      text: firstItem.pubDate ? `⏰ ${getTimeAgo(firstItem.pubDate)}` : 'Tin tức mới nhất'
    },
    timestamp: firstItem.pubDate || new Date()
  };
  
  // Remove undefined fields
  if (!embed.thumbnail) delete embed.thumbnail;
  
  return embed;
}

module.exports = {
  fetchNews,
  formatNewsResults,
  createNewsEmbed
};
