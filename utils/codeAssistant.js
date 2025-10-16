// Code Assistant - Auto-detect và hỗ trợ lập trình
// Bot tự động nhận diện khi user cần giúp về code

const CODE_PATTERNS = {
  // Debugging & Error patterns
  debugging: [
    /\b(lỗi|error|bug|sai|không\s*chạy|không\s*hoạt\s*động)\b/i,
    /\b(debug|fix|sửa|tìm\s*lỗi)\b/i,
    /\b(báo\s*lỗi|thông\s*báo|message)\b/i,
    /\b(undefined|null|NaN|exception|crash)\b/i,
    /\b(syntax\s*error|runtime\s*error|logic\s*error)\b/i
  ],
  
  // Code writing patterns
  codeWriting: [
    /\b(viết|code|coding|lập\s*trình)\b/i,
    /\b(tạo|create|make)\s*(function|hàm|class|component)/i,
    /\b(làm\s*sao|how\s*to|cách)\s*(viết|code|tạo)/i,
    /\b(implement|triển\s*khai|xây\s*dựng)\b/i,
    /\b(algorithm|thuật\s*toán)\b/i
  ],
  
  // Learning & Tutorial patterns
  learning: [
    /\b(học|learn|tìm\s*hiểu|giải\s*thích|explain)\b/i,
    /\b(hướng\s*dẫn|tutorial|guide|docs|tài\s*liệu)\b/i,
    /\b(là\s*gì|what\s*is|nghĩa\s*là|có\s*nghĩa)\b/i,
    /\b(ví\s*dụ|example|demo)\b/i,
    /\b(khái\s*niệm|concept|định\s*nghĩa)\b/i
  ],
  
  // Review & Optimize patterns
  review: [
    /\b(review|đánh\s*giá|kiểm\s*tra|check)\s*(code|mã)/i,
    /\b(optimize|tối\s*ưu|cải\s*thiện|improve)\b/i,
    /\b(best\s*practice|chuẩn|convention)\b/i,
    /\b(refactor|cấu\s*trúc\s*lại|clean\s*code)\b/i,
    /\b(performance|hiệu\s*suất|nhanh\s*hơn)\b/i
  ],
  
  // Programming language patterns
  languages: [
    /\b(javascript|js|node|react|vue|angular)\b/i,
    /\b(python|py|django|flask)\b/i,
    /\b(java|kotlin|android)\b/i,
    /\b(c\+\+|cpp|c#|csharp)\b/i,
    /\b(html|css|scss|sass)\b/i,
    /\b(sql|database|mongodb|mysql)\b/i,
    /\b(php|laravel|wordpress)\b/i,
    /\b(ruby|rails|go|golang|rust)\b/i
  ]
};

// Detect if user needs code assistance
function isCodeAssistanceNeeded(message) {
  const content = message.toLowerCase();
  
  // Check if message contains code (code blocks or inline code)
  const hasCodeBlock = /```[\s\S]*```|`[^`]+`/.test(message);
  
  // Check for code-related patterns
  const hasDebugPattern = CODE_PATTERNS.debugging.some(pattern => pattern.test(content));
  const hasCodeWritingPattern = CODE_PATTERNS.codeWriting.some(pattern => pattern.test(content));
  const hasLearningPattern = CODE_PATTERNS.learning.some(pattern => pattern.test(content));
  const hasReviewPattern = CODE_PATTERNS.review.some(pattern => pattern.test(content));
  const hasLanguagePattern = CODE_PATTERNS.languages.some(pattern => pattern.test(content));
  
  // If has code block OR multiple code patterns, trigger code assistant
  return hasCodeBlock || 
         (hasDebugPattern || hasCodeWritingPattern || hasReviewPattern) ||
         (hasLearningPattern && hasLanguagePattern);
}

// Determine assistance type
function determineAssistanceType(message) {
  const content = message.toLowerCase();
  
  if (CODE_PATTERNS.debugging.some(p => p.test(content))) {
    return 'debugging';
  } else if (CODE_PATTERNS.review.some(p => p.test(content))) {
    return 'review';
  } else if (CODE_PATTERNS.codeWriting.some(p => p.test(content))) {
    return 'coding';
  } else if (CODE_PATTERNS.learning.some(p => p.test(content))) {
    return 'learning';
  }
  return 'general';
}

// Create enhanced system prompt for code assistance
function getCodeAssistantPrompt(assistanceType, originalPersonality) {
  const basePrompt = `${originalPersonality}

**🔧 CHUYÊN GIA LẬP TRÌNH - CHẾ ĐỘ HỖ TRỢ CODE**

Bạn đang ở chế độ Code Assistant để giúp người dùng về lập trình. Hãy:

`;

  const typeSpecificPrompts = {
    debugging: `
**DEBUGGING & SỬA LỖI:**
1. 📋 **Phân tích lỗi**: Đọc kỹ code và error message
2. 🔍 **Tìm nguyên nhân**: Giải thích tại sao lỗi xảy ra
3. ✅ **Đưa ra giải pháp**: Code fix cụ thể và rõ ràng
4. 💡 **Giải thích**: Tại sao giải pháp này hoạt động
5. 🚀 **Best practice**: Cách tránh lỗi tương tự

**Format trả lời:**
\`\`\`
❌ VẤN ĐỀ: [Mô tả lỗi ngắn gọn]

🔍 NGUYÊN NHÂN:
- [Giải thích tại sao lỗi]

✅ GIẢI PHÁP:
[Code đã sửa với comments]

💡 GIẢI THÍCH:
- [Tại sao cách này hoạt động]

🚀 LƯU Ý:
- [Tips để tránh lỗi sau này]
\`\`\`
`,
    
    coding: `
**VIẾT CODE & PHÁT TRIỂN:**
1. 📝 **Hiểu yêu cầu**: Xác nhận bạn hiểu đúng ý user
2. 💻 **Code mẫu**: Viết code hoàn chỉnh, có comments
3. 📚 **Giải thích từng bước**: Explain mỗi phần code làm gì
4. 🎯 **Best practices**: Áp dụng chuẩn code tốt
5. 🔗 **Mở rộng**: Suggest cách cải tiến

**Format code:**
\`\`\`javascript
// 📝 [Mô tả chức năng]
function example() {
  // [Comment giải thích logic]
  const result = ...;
  return result;
}

// 💡 Cách sử dụng:
example();
\`\`\`
`,
    
    learning: `
**HỌC LẬP TRÌNH & GIẢI THÍCH:**
1. 🎓 **Giải thích đơn giản**: Dùng ngôn ngữ dễ hiểu
2. 📖 **Khái niệm cơ bản**: Giải thích từ nền tảng
3. 💡 **Ví dụ thực tế**: Code examples cụ thể
4. 🔗 **Liên kết kiến thức**: So sánh với điều đã biết
5. 🎯 **Bài tập thực hành**: Suggest challenge để luyện tập

**Format giải thích:**
\`\`\`
📚 KHÁI NIỆM: [Tên concept]

🎯 ĐỊNH NGHĨA:
[Giải thích ngắn gọn]

💡 VÍ DỤ THỰC TẾ:
[Code example + giải thích]

🔑 ĐIỂM QUAN TRỌNG:
- [Key points cần nhớ]

🎮 LUYỆN TẬP:
[Bài tập nhỏ để practice]
\`\`\`
`,
    
    review: `
**REVIEW & TỐI ƯU CODE:**
1. ✅ **Đánh giá tổng quan**: Code có hoạt động không?
2. 🎯 **Chất lượng code**: Clean, readable, maintainable?
3. ⚡ **Performance**: Có optimize được không?
4. 🛡️ **Security**: Có lỗ hổng bảo mật không?
5. 📝 **Suggestions**: Cách cải thiện cụ thể

**Format review:**
\`\`\`
✅ CODE HOẠT ĐỘNG: [Có/Không + lý do]

🎯 ĐÁNH GIÁ CHẤT LƯỢNG:
- Readability: ⭐⭐⭐⭐⭐
- Performance: ⭐⭐⭐⭐☆
- Security: ⭐⭐⭐⭐⭐

💡 ĐỀ XUẤT CẢI THIỆN:
1. [Suggestion 1 + code example]
2. [Suggestion 2 + code example]

⚡ OPTIMIZED CODE:
[Code đã tối ưu]
\`\`\`
`
  };

  return basePrompt + (typeSpecificPrompts[assistanceType] || typeSpecificPrompts.learning) + `

**QUAN TRỌNG:**
- Luôn dùng emoji để code dễ đọc và thân thiện
- Format code trong code blocks với syntax highlighting
- Giải thích bằng tiếng Việt đơn giản, dễ hiểu
- Đưa ra examples cụ thể, thực tế
- Khuyến khích user tự học và thử nghiệm
- Nếu user là beginner, giải thích từ cơ bản
- Nếu user advanced, focus vào best practices

Hãy giúp user một cách tận tâm nhất! 💪✨`;
}

module.exports = {
  isCodeAssistanceNeeded,
  determineAssistanceType,
  getCodeAssistantPrompt
};
