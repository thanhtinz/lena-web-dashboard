const https = require('https');

async function searchWeb(query, lang = 'vi') {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  // Use Google Custom Search API if available
  if (apiKey && searchEngineId) {
    return searchWithGoogle(query, apiKey, searchEngineId, lang);
  }
  
  // Fallback to DuckDuckGo
  return searchWithDuckDuckGo(query, lang);
}

async function searchWithGoogle(query, apiKey, searchEngineId, lang = 'vi') {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    // Set geolocation and language based on server language
    const gl = lang === 'en' ? 'us' : 'vn'; // Geolocation: US for English, Vietnam for Vietnamese
    const lr = lang === 'en' ? 'lang_en' : 'lang_vi'; // Language restriction
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodedQuery}&num=5&gl=${gl}&lr=${lr}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (json.error) {
            console.error('Google Search API error:', json.error.message);
            console.log('🔄 Fallback to DuckDuckGo...');
            // Fallback to DuckDuckGo when Google fails
            searchWithDuckDuckGo(query, lang).then(resolve).catch(reject);
            return;
          }
          
          if (!json.items || json.items.length === 0) {
            console.log('Google: No results found. 🔄 Fallback to DuckDuckGo...');
            searchWithDuckDuckGo(query, lang).then(resolve).catch(reject);
            return;
          }
          
          const resultHeader = lang === 'en' 
            ? '🔍 **Google Search Results:**\n\n'
            : '🔍 **Kết quả tìm kiếm từ Google:**\n\n';
          let result = resultHeader;
          
          // Display top 3 results with snippets
          json.items.slice(0, 3).forEach((item, index) => {
            result += `**${index + 1}. ${item.title}**\n`;
            result += `${item.snippet}\n`;
            result += `🔗 ${item.link}\n\n`;
          });
          
          // Add search query info
          if (json.searchInformation) {
            const infoText = lang === 'en'
              ? `📊 Found ${json.searchInformation.formattedTotalResults} results in ${json.searchInformation.formattedSearchTime} seconds`
              : `📊 Tìm thấy ${json.searchInformation.formattedTotalResults} kết quả trong ${json.searchInformation.formattedSearchTime} giây`;
            result += infoText;
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function searchWithDuckDuckGo(query, lang = 'vi') {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    // Add region parameter for localized results
    const region = lang === 'en' ? 'us-en' : 'vn-vi';
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1&kl=${region}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          // Extract all available information
          let result = '';
          let links = [];
          
          // 1. AbstractText (main answer with URL)
          if (json.AbstractText) {
            result += `📋 ${json.AbstractText}`;
            if (json.AbstractURL) {
              links.push({ title: json.AbstractSource || 'Nguồn chính', url: json.AbstractURL });
            }
          }
          
          // 2. Answer (direct answer if available)
          if (json.Answer) {
            result += (result ? '\n\n' : '') + `💡 ${json.Answer}`;
          }
          
          // 3. Definition (with URL)
          if (json.Definition) {
            result += (result ? '\n\n' : '') + `📖 ${json.Definition}`;
            if (json.DefinitionURL) {
              links.push({ title: json.DefinitionSource || 'Định nghĩa', url: json.DefinitionURL });
            }
          }
          
          // 4. Related Topics (with URLs)
          if (json.RelatedTopics && json.RelatedTopics.length > 0) {
            const topicsWithLinks = json.RelatedTopics
              .filter(t => t.Text && t.FirstURL)
              .slice(0, 5);
            
            if (topicsWithLinks.length > 0) {
              const topicsText = topicsWithLinks.map(t => t.Text).join('\n• ');
              result += (result ? '\n\n' : '') + `📌 Thông tin liên quan:\n• ${topicsText}`;
              
              // Collect URLs from topics
              topicsWithLinks.forEach(t => {
                if (t.FirstURL) {
                  links.push({ 
                    title: t.Text.substring(0, 50) + (t.Text.length > 50 ? '...' : ''), 
                    url: t.FirstURL 
                  });
                }
              });
            }
          }
          
          // 5. Add clickable links section
          if (links.length > 0) {
            const linksHeader = lang === 'en' 
              ? '\n\n🔗 **Citations & References:**'
              : '\n\n🔗 **Dẫn chứng & Tham khảo thêm:**';
            result += linksHeader;
            
            // Remove duplicates based on URL
            const uniqueLinks = [];
            const seenUrls = new Set();
            
            for (const link of links) {
              if (!seenUrls.has(link.url)) {
                seenUrls.add(link.url);
                uniqueLinks.push(link);
              }
            }
            
            // Display up to 3 most relevant links
            uniqueLinks.slice(0, 3).forEach((link, index) => {
              result += `\n${index + 1}. ${link.title}: ${link.url}`;
            });
          }
          
          // If still no result, provide a helpful message
          if (!result) {
            result = lang === 'en'
              ? `🔍 Searching for "${query}"...\n\nNo direct results from DuckDuckGo. Try:\n- Be more specific\n- Use different keywords\n- Or I'll try to answer based on my knowledge`
              : `🔍 Đang tìm kiếm thông tin về "${query}"...\n\nKhông tìm thấy kết quả trực tiếp từ DuckDuckGo. Hãy thử:\n- Đặt câu hỏi cụ thể hơn\n- Sử dụng từ khóa khác\n- Hoặc mình sẽ cố gắng trả lời dựa trên kiến thức hiện có`;
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function getCurrentTime(lang = 'vi') {
  const now = new Date();
  
  if (lang === 'en') {
    // For English: Show UTC/GMT time
    const utcDay = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    });
    const utcTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      timeZone: 'UTC'
    });
    
    return `📅 ${utcDay}\n🕐 ${utcTime} (UTC/GMT)`;
  } else {
    // For Vietnamese: Show Vietnam time
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const day = vietnamTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const time = vietnamTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return `📅 ${day}\n🕐 ${time} (Giờ Việt Nam)`;
  }
}

// Function definitions for OpenAI function calling
const searchFunctions = [
  {
    name: 'search_web',
    description: `Tìm kiếm thông tin realtime trên web. HÃY LUÔN LUÔN dùng function này khi:
- User hỏi về SỰ KIỆN sau năm 2023 (World Cup, Olympic, tin tức, v.v.)
- Cần thông tin MỚI NHẤT (giá cả, thời tiết, tỷ giá, chứng khoán)
- Hỏi về NGƯỜI/CÔNG TY/SẢN PHẨM mới (CEO mới, startup mới, công nghệ mới)
- Cần dữ liệu CẬP NHẬT (số liệu thống kê, ranking, bảng xếp hạng)
- BẤT KỲ thông tin nào có thể THAY ĐỔI theo thời gian
- Khi KHÔNG CHẮC CHẮN về thông tin - HÃY SEARCH để có câu trả lời chính xác nhất`,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Câu truy vấn tìm kiếm bằng tiếng Anh hoặc tiếng Việt, ví dụ: "World Cup 2024 location", "Hanoi weather today", "Bitcoin price", "latest AI news"'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_current_time',
    description: 'Lấy ngày giờ hiện tại (giờ Việt Nam). Dùng khi user hỏi về thời gian, ngày, giờ, thứ hiện tại.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
];

async function executeFunctionCall(functionName, args, lang = 'vi') {
  switch (functionName) {
    case 'search_web':
      return await searchWeb(args.query, lang);
    case 'get_current_time':
      return await getCurrentTime(lang);
    default:
      return lang === 'en' ? 'Function not found' : 'Hàm không tồn tại';
  }
}

module.exports = {
  searchWeb,
  getCurrentTime,
  searchFunctions,
  executeFunctionCall
};
