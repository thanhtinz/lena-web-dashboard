// News detection patterns for Vietnamese and English news requests

const newsPatterns = [
  // VIETNAMESE PATTERNS
  // Priority 10 - Specific news requests
  { pattern: /cho\s+(mình|tôi|em|t|m)\s+(xem|đọc|biết)\s+tin\s+tức/i, priority: 10, lang: 'vi' },
  { pattern: /cho\s+(mình|tôi|em|t|m)\s+(xem|đọc|biết)\s+báo/i, priority: 10, lang: 'vi' },
  { pattern: /muốn\s+(xem|đọc|biết)\s+tin\s+tức/i, priority: 10, lang: 'vi' },
  
  // Priority 9 - Direct news commands
  { pattern: /^(xem|đọc)\s+(tin\s+tức|báo)/i, priority: 9, lang: 'vi' },
  { pattern: /^tin\s+(tức|tuc)\s+(mới|hôm\s+nay)/i, priority: 9, lang: 'vi' },
  { pattern: /^báo\s+(mới|hôm\s+nay)/i, priority: 9, lang: 'vi' },
  
  // Priority 8 - News with category
  { pattern: /tin\s+(tức|tuc)\s+(thế\s+giới|kinh\s+tế|giải\s+trí|thể\s+thao|công\s+nghệ|khoa\s+học|sức\s+khỏe|giáo\s+dục)/i, priority: 8, lang: 'vi' },
  { pattern: /báo\s+(thế\s+giới|kinh\s+tế|giải\s+trí|thể\s+thao|công\s+nghệ|khoa\s+học|sức\s+khỏe|giáo\s+dục)/i, priority: 8, lang: 'vi' },
  { pattern: /(vnexpress|tuoitre|tuổi\s+trẻ|thanhnien|thanh\s+niên|dantri|dân\s+trí|vietnamnet)\s+(mới|hôm\s+nay)/i, priority: 8, lang: 'vi' },
  
  // Priority 7 - General news inquiry
  { pattern: /có\s+tin\s+(gì\s+mới|tức\s+gì)/i, priority: 7, lang: 'vi' },
  { pattern: /có\s+báo\s+gì\s+mới/i, priority: 7, lang: 'vi' },
  { pattern: /tin\s+hot\s+(hôm\s+nay)?/i, priority: 7, lang: 'vi' },
  { pattern: /báo\s+hot\s+(hôm\s+nay)?/i, priority: 7, lang: 'vi' },
  
  // Priority 6 - Casual news requests
  { pattern: /xem\s+tin/i, priority: 6, lang: 'vi' },
  { pattern: /đọc\s+báo/i, priority: 6, lang: 'vi' },
  { pattern: /tin\s+(gì|j)\s+(không|ko|k)/i, priority: 6, lang: 'vi' },
  { pattern: /báo\s+(gì|j)\s+(không|ko|k)/i, priority: 6, lang: 'vi' },
  { pattern: /cập\s+nhật\s+tin/i, priority: 6, lang: 'vi' },
  { pattern: /tin\s+tức\s+trong\s+ngày/i, priority: 6, lang: 'vi' },
  
  // ENGLISH PATTERNS
  // Priority 10 - Specific news requests
  { pattern: /(show|tell|give)\s+me\s+(the\s+)?(latest\s+)?news/i, priority: 10, lang: 'en' },
  { pattern: /i\s+want\s+to\s+(see|read|know)\s+(the\s+)?news/i, priority: 10, lang: 'en' },
  
  // Priority 9 - Direct news commands
  { pattern: /^(latest|recent|today\'?s?)\s+news/i, priority: 9, lang: 'en' },
  { pattern: /^news\s+(today|now|latest)/i, priority: 9, lang: 'en' },
  { pattern: /^(read|check)\s+(the\s+)?news/i, priority: 9, lang: 'en' },
  
  // Priority 8 - News with category
  { pattern: /news\s+(about\s+)?(world|business|entertainment|sports?|tech(nology)?|science|health)/i, priority: 8, lang: 'en' },
  { pattern: /(world|business|entertainment|sports?|tech(nology)?|science|health)\s+news/i, priority: 8, lang: 'en' },
  { pattern: /(cnn|bbc|reuters)\s+(latest|news|today)/i, priority: 8, lang: 'en' },
  
  // Priority 7 - General news inquiry
  { pattern: /what\'?s\s+(the\s+)?(latest|new)\s+news/i, priority: 7, lang: 'en' },
  { pattern: /any\s+(new\s+)?news/i, priority: 7, lang: 'en' },
  { pattern: /what\'?s\s+happening\s+(in\s+the\s+world)?/i, priority: 7, lang: 'en' },
  
  // Priority 6 - Casual news requests
  { pattern: /check\s+news/i, priority: 6, lang: 'en' },
  { pattern: /news\s+update/i, priority: 6, lang: 'en' },
  { pattern: /breaking\s+news/i, priority: 6, lang: 'en' },
];

// News categories
const newsCategories = [
  { 
    keywords: ['thế giới', 'quốc tế', 'world'], 
    category: 'the-gioi', 
    name: { vi: 'Thế Giới', en: 'World' }
  },
  { 
    keywords: ['kinh tế', 'kinh-te', 'economy', 'business'], 
    category: 'kinh-te', 
    name: { vi: 'Kinh Tế', en: 'Business' }
  },
  { 
    keywords: ['giải trí', 'giai-tri', 'entertainment'], 
    category: 'giai-tri', 
    name: { vi: 'Giải Trí', en: 'Entertainment' }
  },
  { 
    keywords: ['thể thao', 'the-thao', 'sports', 'sport'], 
    category: 'the-thao', 
    name: { vi: 'Thể Thao', en: 'Sports' }
  },
  { 
    keywords: ['công nghệ', 'cong-nghe', 'technology', 'tech'], 
    category: 'cong-nghe', 
    name: { vi: 'Công Nghệ', en: 'Technology' }
  },
  { 
    keywords: ['khoa học', 'khoa-hoc', 'science'], 
    category: 'khoa-hoc', 
    name: { vi: 'Khoa Học', en: 'Science' }
  },
  { 
    keywords: ['sức khỏe', 'suc-khoe', 'health'], 
    category: 'suc-khoe', 
    name: { vi: 'Sức Khỏe', en: 'Health' }
  },
  { 
    keywords: ['giáo dục', 'giao-duc', 'education'], 
    category: 'giao-duc', 
    name: { vi: 'Giáo Dục', en: 'Education' }
  },
];

// News sources
const newsSources = [
  { 
    id: 'vnexpress', 
    name: 'VnExpress',
    keywords: ['vnexpress', 'vne'],
    rss: 'https://vnexpress.net/rss/tin-moi-nhat.rss',
    categories: {
      'the-gioi': 'https://vnexpress.net/rss/the-gioi.rss',
      'kinh-te': 'https://vnexpress.net/rss/kinh-doanh.rss',
      'giai-tri': 'https://vnexpress.net/rss/giai-tri.rss',
      'the-thao': 'https://vnexpress.net/rss/the-thao.rss',
      'cong-nghe': 'https://vnexpress.net/rss/so-hoa.rss',
      'khoa-hoc': 'https://vnexpress.net/rss/khoa-hoc.rss',
      'suc-khoe': 'https://vnexpress.net/rss/suc-khoe.rss',
      'giao-duc': 'https://vnexpress.net/rss/giao-duc.rss',
    }
  },
  { 
    id: 'tuoitre', 
    name: 'Tuổi Trẻ',
    keywords: ['tuoitre', 'tuổi trẻ', 'tuoi tre'],
    rss: 'https://tuoitre.vn/rss/tin-moi-nhat.rss',
    categories: {
      'the-gioi': 'https://tuoitre.vn/rss/the-gioi.rss',
      'kinh-te': 'https://tuoitre.vn/rss/kinh-doanh.rss',
      'giai-tri': 'https://tuoitre.vn/rss/giai-tri.rss',
      'the-thao': 'https://tuoitre.vn/rss/the-thao.rss',
      'cong-nghe': 'https://tuoitre.vn/rss/cong-nghe.rss',
    }
  },
  { 
    id: 'thanhnien', 
    name: 'Thanh Niên',
    keywords: ['thanhnien', 'thanh niên', 'thanh nien'],
    rss: 'https://thanhnien.vn/rss/home.rss',
    categories: {
      'the-gioi': 'https://thanhnien.vn/rss/the-gioi.rss',
      'kinh-te': 'https://thanhnien.vn/rss/tai-chinh-kinh-doanh.rss',
      'giai-tri': 'https://thanhnien.vn/rss/giai-tri.rss',
      'the-thao': 'https://thanhnien.vn/rss/the-thao.rss',
      'cong-nghe': 'https://thanhnien.vn/rss/cong-nghe.rss',
    }
  },
  { 
    id: 'dantri', 
    name: 'Dân Trí',
    keywords: ['dantri', 'dân trí', 'dan tri'],
    rss: 'https://dantri.com.vn/rss/trang-nhat.rss',
    categories: {
      'the-gioi': 'https://dantri.com.vn/rss/the-gioi.rss',
      'kinh-te': 'https://dantri.com.vn/rss/kinh-doanh.rss',
      'giai-tri': 'https://dantri.com.vn/rss/giai-tri.rss',
      'the-thao': 'https://dantri.com.vn/rss/the-thao.rss',
      'cong-nghe': 'https://dantri.com.vn/rss/suc-manh-so.rss',
      'suc-khoe': 'https://dantri.com.vn/rss/suc-khoe.rss',
      'giao-duc': 'https://dantri.com.vn/rss/giao-duc.rss',
    }
  },
  { 
    id: 'vietnamnet', 
    name: 'VietnamNet',
    keywords: ['vietnamnet', 'vnn'],
    rss: 'https://vietnamnet.vn/rss/tin-moi-nhat.rss',
    categories: {
      'the-gioi': 'https://vietnamnet.vn/rss/the-gioi.rss',
      'kinh-te': 'https://vietnamnet.vn/rss/kinh-te.rss',
      'giai-tri': 'https://vietnamnet.vn/rss/giai-tri.rss',
      'the-thao': 'https://vietnamnet.vn/rss/the-thao.rss',
      'cong-nghe': 'https://vietnamnet.vn/rss/cong-nghe.rss',
      'suc-khoe': 'https://vietnamnet.vn/rss/suc-khoe.rss',
      'giao-duc': 'https://vietnamnet.vn/rss/giao-duc.rss',
    },
    lang: 'vi'
  },
  // ENGLISH NEWS SOURCES
  { 
    id: 'cnn', 
    name: 'CNN',
    keywords: ['cnn'],
    rss: 'http://rss.cnn.com/rss/edition.rss',
    categories: {
      'the-gioi': 'http://rss.cnn.com/rss/edition_world.rss',
      'kinh-te': 'http://rss.cnn.com/rss/money_news_international.rss',
      'giai-tri': 'http://rss.cnn.com/rss/edition_entertainment.rss',
      'the-thao': 'http://rss.cnn.com/rss/edition_sport.rss',
      'cong-nghe': 'http://rss.cnn.com/rss/edition_technology.rss',
      'khoa-hoc': 'http://rss.cnn.com/rss/edition_space.rss',
      'suc-khoe': 'http://rss.cnn.com/rss/edition_health.rss',
    },
    lang: 'en'
  },
];

/**
 * Check if message is a news request
 */
function isNewsRequest(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const { pattern, priority } of newsPatterns) {
    if (pattern.test(lowerMessage)) {
      return { isNews: true, priority };
    }
  }
  
  return { isNews: false, priority: 0 };
}

/**
 * Detect news category from message
 */
function detectCategory(message, lang = 'vi') {
  const lowerMessage = message.toLowerCase();
  
  for (const { keywords, category, name } of newsCategories) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return { 
        category, 
        name: typeof name === 'object' ? name[lang] : name 
      };
    }
  }
  
  return null;
}

/**
 * Detect news source from message
 */
function detectSource(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const source of newsSources) {
    if (source.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return source;
    }
  }
  
  return null;
}

/**
 * Get RSS URL based on source and category, language-aware
 */
function getRssUrl(source = null, category = null, lang = 'vi') {
  // If specific source requested
  if (source) {
    // If category specified and source has that category
    if (category && source.categories[category]) {
      return source.categories[category];
    }
    // Default RSS for that source
    return source.rss;
  }
  
  // If only category specified, use default source based on language
  if (category) {
    const defaultSource = lang === 'en' 
      ? newsSources.find(s => s.id === 'cnn')
      : newsSources.find(s => s.id === 'vnexpress');
    
    if (defaultSource && defaultSource.categories[category]) {
      return defaultSource.categories[category];
    }
  }
  
  // Default: Language-specific default source
  if (lang === 'en') {
    const cnn = newsSources.find(s => s.id === 'cnn');
    return cnn ? cnn.rss : newsSources[0].rss;
  }
  
  // Default Vietnamese: VnExpress tin mới nhất
  return newsSources[0].rss;
}

/**
 * Get source name for display, language-aware
 */
function getSourceName(source = null, lang = 'vi') {
  if (source) {
    return source.name;
  }
  // Default based on language
  return lang === 'en' ? 'CNN' : 'VnExpress';
}

module.exports = {
  isNewsRequest,
  detectCategory,
  detectSource,
  getRssUrl,
  getSourceName,
  newsSources,
  newsCategories
};
