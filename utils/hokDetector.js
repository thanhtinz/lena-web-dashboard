const { web_fetch } = require('./external/webFetch');

function isHOKQuery(message) {
  const lowerMsg = message.toLowerCase();
  
  const patterns = [
    { regex: /\b(honor of kings?|hok)\b/i, priority: 10 },
    { regex: /\b(vương giả vinh diệu|vgvd)\b/i, priority: 10 },
    { regex: /\b王者荣耀\b/, priority: 10 },
    { regex: /\b(tướng|hero(es)?)\s+(hok|vgvd|honor)/i, priority: 9 },
    { regex: /\b(build|combo|guide)\s+(hok|vgvd)/i, priority: 9 },
    { regex: /\b(tier\s*list|xếp hạng)\s+(hok|vgvd)/i, priority: 9 },
    { regex: /\b(giftcode|code|mã)\s+(hok|vgvd)/i, priority: 9 },
    { regex: /\b(trang bị|item|ngọc)\s+(hok|vgvd)/i, priority: 9 },
    { regex: /\b(skin|trang phục)\s+(hok|vgvd)/i, priority: 9 },
    { regex: /\bvuonggiavinhdieu\.net\b/i, priority: 10 },
    { regex: /\bhonorofkings\.com\.vn\b/i, priority: 10 },
    { regex: /\b(mùa|season)\s*(s?\d{1,2}|giải)\s+(hok|vgvd|honor|vương giả)/i, priority: 9 },
    { regex: /\b(hok|vgvd|honor|vương giả)\s+(mùa|season)\s*(s?\d{1,2}|giải)/i, priority: 9 },
    { regex: /\b(top lane|mid lane|bot lane|đường (trên|giữa|dưới))\s+(trong|của)?\s*(hok|vgvd|honor|vương giả)/i, priority: 9 },
    { regex: /\b(hok|vgvd|honor|vương giả)\s+(top lane|mid lane|bot lane|đường (trên|giữa|dưới))/i, priority: 9 },
    { regex: /\b(đi rừng|jungle|jg)\s+(trong|của)?\s*(hok|vgvd|honor|vương giả)/i, priority: 8 },
    { regex: /\b(hok|vgvd|honor|vương giả)\s+(đi rừng|jungle|jg)/i, priority: 8 },
    { regex: /\b(phù trợ|support|hỗ trợ)\s+(trong|của)?\s*(honor|vgvd|hok|vương giả)/i, priority: 8 },
    { regex: /\b(honor|vgvd|hok|vương giả)\s+(phù trợ|support|hỗ trợ)/i, priority: 8 }
  ];

  let maxPriority = 0;
  for (const pattern of patterns) {
    if (pattern.regex.test(lowerMsg)) {
      maxPriority = Math.max(maxPriority, pattern.priority);
    }
  }

  return maxPriority >= 8;
}

async function createHOKResponse(query, openai, searchWeb) {
  try {
    console.log(`🎮 Searching for HOK info: "${query}"`);
    
    // Search both websites for relevant pages
    const searchQuery1 = `${query} site:vuonggiavinhdieu.net`;
    const searchQuery2 = `${query} site:honorofkings.com.vn`;
    
    const [vgvdResults, hokResults] = await Promise.all([
      searchWeb(searchQuery1).catch(err => {
        console.error('❌ Error searching vuonggiavinhdieu.net:', err);
        return null;
      }),
      searchWeb(searchQuery2).catch(err => {
        console.error('❌ Error searching honorofkings.com.vn:', err);
        return null;
      })
    ]);

    // Get URLs from search results
    const vgvdUrl = vgvdResults?.results?.[0]?.url || 'https://vuonggiavinhdieu.net';
    const hokUrl = hokResults?.results?.[0]?.url || 'https://honorofkings.com.vn';
    
    console.log(`🔗 Found URLs - VGVD: ${vgvdUrl}, HOK: ${hokUrl}`);

    // Fetch content from found URLs
    const [vgvdContent, hokContent] = await Promise.all([
      web_fetch(vgvdUrl).catch(err => {
        console.error('❌ Error fetching vuonggiavinhdieu.net:', err);
        return null;
      }),
      web_fetch(hokUrl).catch(err => {
        console.error('❌ Error fetching honorofkings.com.vn:', err);
        return null;
      })
    ]);

    if (!vgvdContent && !hokContent) {
      return '🥺 Ư-ừm... em không tìm thấy thông tin về điều này... Bạn thử hỏi cách khác nhé! 💕';
    }

    // Combine content (limit size to avoid token overflow)
    const combinedContent = `
# Thông tin từ vuonggiavinhdieu.net (${vgvdUrl}):
${vgvdContent ? vgvdContent.substring(0, 15000) : 'Không lấy được'}

# Thông tin từ honorofkings.com.vn (${hokUrl}):
${hokContent ? hokContent.substring(0, 15000) : 'Không lấy được'}
    `.trim();

    console.log(`📄 Fetched ${combinedContent.length} characters from specific pages...`);

    // Use OpenAI to extract relevant info and answer
    const systemPrompt = `Bạn là trợ lý chuyên về game Honor of Kings (Vương Giả Vinh Diệu - VGVD). 
Nhiệm vụ: Đọc thông tin từ 2 trang web và trả lời câu hỏi của người dùng một cách chính xác, ngắn gọn.

Hướng dẫn:
- Trích xuất thông tin liên quan đến câu hỏi từ nội dung web
- Trả lời trực tiếp, rõ ràng, có cấu trúc
- Nếu có giftcode, tier list, stats tướng thì format đẹp
- Luôn ghi nguồn: vuonggiavinhdieu.net hoặc honorofkings.com.vn
- Dùng emoji phù hợp: 🎮, ⚔️, 🎁, 📊, etc.
- Nếu không tìm thấy thông tin, nói rõ và đề xuất tìm ở đâu`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Nội dung từ websites:\n\n${combinedContent}` },
        { role: 'user', content: `Câu hỏi: ${query}` }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const answer = response.choices[0].message.content;
    console.log(`✅ AI answered HOK query: "${answer.substring(0, 100)}..."`);
    
    return answer;

  } catch (error) {
    console.error('❌ Error in createHOKResponse:', error);
    return '🥺 À... có lỗi xảy ra khi tìm thông tin... Bạn thử hỏi lại nhé! 💕';
  }

}

module.exports = {
  isHOKQuery,
  createHOKResponse
};
