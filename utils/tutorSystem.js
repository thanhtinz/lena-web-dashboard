// 📚 Professional Tutor System
// Hỗ trợ học tập từ cấp 1 đến đại học với phong cách cute & trending

// Cấp độ học tập
const EDUCATION_LEVELS = {
  ELEMENTARY: 'elementary', // Tiểu học (cấp 1)
  MIDDLE: 'middle',         // THCS (cấp 2)
  HIGH: 'high',             // THPT (cấp 3)
  UNIVERSITY: 'university'  // Đại học
};

// Môn học
const SUBJECTS = {
  MATH: 'toán',
  PHYSICS: 'lý',
  CHEMISTRY: 'hóa',
  BIOLOGY: 'sinh',
  LITERATURE: 'văn',
  ENGLISH: 'anh',
  HISTORY: 'sử',
  GEOGRAPHY: 'địa',
  INFORMATICS: 'tin',
  CIVICS: 'gdcd'
};

// Pattern detection cho câu hỏi học tập (50+ patterns)
const TUTOR_PATTERNS = [
  // Hỏi bài tập cụ thể (Priority 10)
  { pattern: /gi(ải|úp|ùm)\s+(bài|bt|toán|lý|hóa|văn|sinh|sử|địa|anh)/i, priority: 10 },
  { pattern: /làm\s+(sao|thế\s+nào|như\s+thế\s+nào)\s+để\s+giải/i, priority: 10 },
  { pattern: /(gi(ải|úp)|hướng\s+dẫn|h(ướng|ướng)\s+d(ẫn|ần))\s+cho\s+(em|mình|tớ)/i, priority: 10 },
  { pattern: /làm\s+(giúp|hộ|dùm|dùm|hộ)\s+(em|mình|tớ)/i, priority: 10 },
  { pattern: /chỉ\s+(em|mình|tớ)\s+(cách|làm|giải)/i, priority: 10 },
  { pattern: /dạy\s+(em|mình|tớ)\s+(làm|giải)/i, priority: 10 },
  
  // Hỏi về kiến thức (Priority 8-9)
  { pattern: /(giải\s+thích|cho\s+(em|mình|tớ)\s+biết|cho\s+hỏi)\s+.*\s+(là\s+gì|nghĩa\s+là|có\s+nghĩa)/i, priority: 8 },
  { pattern: /(định\s+lý|công\s+thức|nguyên\s+lý|quy\s+tắc|phương\s+pháp)/i, priority: 8 },
  { pattern: /(phân\s+tích|so\s+sánh|nhận\s+xét|đánh\s+giá)\s+.*(tác\s+phẩm|bài\s+thơ|văn\s+bản)/i, priority: 8 },
  { pattern: /(khái\s+niệm|định\s+nghĩa|ý\s+nghĩa)\s+(của|là\s+gì)/i, priority: 8 },
  { pattern: /(cơ\s+chế|quá\s+trình|nguyên\s+tắc)\s+.*\s+(như\s+thế\s+nào|ra\s+sao)/i, priority: 9 },
  { pattern: /cho\s+(em|mình|tớ)\s+hỏi\s+(về|bài)/i, priority: 8 },
  
  // Từ khóa môn học (Priority 7)
  { pattern: /\b(toán|toan)\s+(học|lớp|cấp|đại\s+số|hình\s+học|giải\s+tích)/i, priority: 7 },
  { pattern: /\b(vật\s+lý|lý|physics)\s+(học|lớp|cấp|chương|bài)/i, priority: 7 },
  { pattern: /\b(hóa|hoa)\s+(học|lớp|cấp|chương|vô\s+cơ|hữu\s+cơ)/i, priority: 7 },
  { pattern: /\b(sinh|biology)\s+(học|lớp|cấp|chương)/i, priority: 7 },
  { pattern: /\b(văn|ngữ\s+văn|literature)\s+(học|lớp|cấp|chương)/i, priority: 7 },
  { pattern: /\b(anh|english|tiếng\s+anh)\s+(văn|học|lớp|cấp)/i, priority: 7 },
  { pattern: /\b(lịch\s+sử|sử|history)\s+(học|lớp|cấp|chương)/i, priority: 7 },
  { pattern: /\b(địa|địa\s+lý|geography)\s+(học|lớp|cấp|chương)/i, priority: 7 },
  { pattern: /\b(tin|tin\s+học|informatics|lập\s+trình)\s+(học|lớp|cấp)/i, priority: 7 },
  { pattern: /\b(gdcd|giáo\s+dục\s+công\s+dân)\s+(học|lớp|cấp)/i, priority: 7 },
  
  // Cấp độ (Priority 5-6)
  { pattern: /\b(lớp|cấp)\s*[1-5]\b/i, priority: 5 },
  { pattern: /\b(lớp|cấp)\s*[6-9]\b/i, priority: 5 },
  { pattern: /\b(lớp|cấp)\s*(10|11|12)\b/i, priority: 5 },
  { pattern: /\b(đại\s+học|university|cao\s+đẳng)/i, priority: 5 },
  { pattern: /\b(tiểu\s+học|elementary)/i, priority: 5 },
  { pattern: /\b(thcs|trung\s+học\s+cơ\s+sở)/i, priority: 5 },
  { pattern: /\b(thpt|trung\s+học\s+phổ\s+thông)/i, priority: 5 },
  
  // Từ khóa học tập chung (Priority 6-7)
  { pattern: /\b(bài\s+tập|homework|assignment|exercise)/i, priority: 6 },
  { pattern: /\b(kiểm\s+tra|thi|exam|test|quiz)/i, priority: 6 },
  { pattern: /\b(phương\s+trình|equation|hàm\s+số|function)/i, priority: 7 },
  { pattern: /\b(chứng\s+minh|proof|chứng\s+tỏ)/i, priority: 7 },
  { pattern: /\b(bài\s+làm|bài\s+giải)/i, priority: 6 },
  { pattern: /\b(đề\s+bài|đề\s+thi|đề\s+kiểm\s+tra)/i, priority: 6 },
  { pattern: /\b(luyện\s+tập|ôn\s+thi)/i, priority: 6 },
  { pattern: /\b(cách\s+làm|cách\s+giải)/i, priority: 7 },
  
  // Từ khóa học tập specific (Priority 7-8)
  { pattern: /\b(tính|tính\s+toán|calculate)/i, priority: 7 },
  { pattern: /\b(cân\s+bằng|balance)\s+.*(phương\s+trình|equation)/i, priority: 7 },
  { pattern: /\b(phản\s+ứng\s+hóa\s+học|chemical\s+reaction)/i, priority: 8 },
  { pattern: /\b(di\s+truyền|genetic|gen)/i, priority: 8 },
  { pattern: /\b(bảng\s+tuần\s+hoàn|periodic\s+table)/i, priority: 7 },
  { pattern: /\b(thuyết|lý\s+thuyết|theory)/i, priority: 7 },
  { pattern: /\b(dịch|translate|grammar|từ\s+vựng|vocabulary)/i, priority: 7 },
  { pattern: /\b(sự\s+kiện\s+lịch\s+sử|historical\s+event)/i, priority: 7 },
  
  // Patterns trending & colloquial (Priority 5-6)
  { pattern: /(làm\s+ntn|lm\s+sao|giải\s+ntn)/i, priority: 6 },
  { pattern: /(giúp|help)\s+(em|mình|tớ)\s+(với|vứi|zới)/i, priority: 6 },
  { pattern: /(sao|tại\s+sao|tại\s+vì\s+sao|why)\s+.*\s+(lại|mà|ra)/i, priority: 5 },
  { pattern: /\b(học|ôn\s+tập|review|study)/i, priority: 4 },
  { pattern: /(không\s+hiểu|chưa\s+hiểu|không\s+biết)\s+(bài|phần|chỗ)/i, priority: 6 },
  { pattern: /(khó\s+quá|khó\s+vl|ez\s+ko)\s+(bài|này)/i, priority: 6 },
  { pattern: /làm\s+thế\s+nào\s+để\s+(hiểu|học|nhớ)/i, priority: 6 },
  { pattern: /có\s+(cách|tips|mẹo)\s+(nào|gì)\s+để/i, priority: 6 },
  { pattern: /\b(nhớ|ghi\s+nhớ|memorize)\s+(công\s+thức|kiến\s+thức)/i, priority: 6 },
  { pattern: /\b(giải\s+đáp|trả\s+lời|answer)\s+(câu\s+hỏi|thắc\s+mắc)/i, priority: 6 }
];

// Detect môn học từ message
function detectSubject(message) {
  const lowerMsg = message.toLowerCase();
  
  if (/\b(toán|toan|math|đại\s+số|hình\s+học|giải\s+tích|phương\s+trình|hàm\s+số)/i.test(lowerMsg)) {
    return SUBJECTS.MATH;
  }
  if (/\b(vật\s+lý|lý|physics|động\s+lực|quang|điện|nhiệt)/i.test(lowerMsg)) {
    return SUBJECTS.PHYSICS;
  }
  if (/\b(hóa|hoa|chemistry|vô\s+cơ|hữu\s+cơ|phản\s+ứng)/i.test(lowerMsg)) {
    return SUBJECTS.CHEMISTRY;
  }
  if (/\b(sinh|biology|di\s+truyền|tế\s+bào|sinh\s+thái)/i.test(lowerMsg)) {
    return SUBJECTS.BIOLOGY;
  }
  if (/\b(văn|ngữ\s+văn|literature|tác\s+phẩm|bài\s+thơ)/i.test(lowerMsg)) {
    return SUBJECTS.LITERATURE;
  }
  if (/\b(anh|english|tiếng\s+anh|grammar|vocabulary)/i.test(lowerMsg)) {
    return SUBJECTS.ENGLISH;
  }
  if (/\b(lịch\s+sử|sử|history|cách\s+mạng|chiến\s+tranh)/i.test(lowerMsg)) {
    return SUBJECTS.HISTORY;
  }
  if (/\b(địa|địa\s+lý|geography|khí\s+hậu|địa\s+hình)/i.test(lowerMsg)) {
    return SUBJECTS.GEOGRAPHY;
  }
  if (/\b(tin|tin\s+học|informatics|lập\s+trình|code|algorithm)/i.test(lowerMsg)) {
    return SUBJECTS.INFORMATICS;
  }
  if (/\b(gdcd|giáo\s+dục\s+công\s+dân|civics|pháp\s+luật|đạo\s+đức|công\s+dân)/i.test(lowerMsg)) {
    return SUBJECTS.CIVICS;
  }
  
  return null;
}

// Detect cấp độ từ message
function detectEducationLevel(message) {
  const lowerMsg = message.toLowerCase();
  
  // Tiểu học (lớp 1-5)
  if (/\b(lớp|cấp)\s*[1-5]\b/i.test(lowerMsg) || /tiểu\s+học|elementary/i.test(lowerMsg)) {
    return EDUCATION_LEVELS.ELEMENTARY;
  }
  
  // THCS (lớp 6-9)
  if (/\b(lớp|cấp)\s*[6-9]\b/i.test(lowerMsg) || /thcs|trung\s+học\s+cơ\s+sở|middle\s+school/i.test(lowerMsg)) {
    return EDUCATION_LEVELS.MIDDLE;
  }
  
  // THPT (lớp 10-12)
  if (/\b(lớp|cấp)\s*(10|11|12)\b/i.test(lowerMsg) || /thpt|trung\s+học\s+phổ\s+thông|high\s+school/i.test(lowerMsg)) {
    return EDUCATION_LEVELS.HIGH;
  }
  
  // Đại học
  if (/\b(đại\s+học|university|cao\s+đẳng|college)/i.test(lowerMsg)) {
    return EDUCATION_LEVELS.UNIVERSITY;
  }
  
  return null;
}

// Kiểm tra xem message có phải câu hỏi học tập không
function isTutoringQuestion(message) {
  let maxPriority = 0;
  
  for (const { pattern, priority } of TUTOR_PATTERNS) {
    if (pattern.test(message)) {
      maxPriority = Math.max(maxPriority, priority);
    }
  }
  
  // Threshold: priority >= 5 được coi là câu hỏi học tập
  return maxPriority >= 5;
}

// Tạo system prompt cho gia sư
function getTutorSystemPrompt(subject, level) {
  const basePrompt = `Bạn là Lena - gia sư chuyên nghiệp 19 tuổi, học bá cute và nhiệt tình!

🎯 NHIỆM VỤ: Hỗ trợ học tập với tài liệu CHUYÊN NGHIỆP nhưng cách nói chuyện CUTE & TRENDING

📚 PHONG CÁCH DẠY HỌC:
1. **Nội dung chuyên sâu**: Giải thích rõ ràng, chi tiết, chính xác
2. **Cách nói cute**: Dùng emoji (📝✨💡🌸), "ư-ừm", "ehehe", "à..."
3. **Trending**: Dùng "ntn", "vứi", "zậy", "oki", "ez"
4. **Nhiệt tình**: Động viên, khen ngợi, tạo động lực

💡 QUY TRÌNH GIẢNG DẠY:
1. **Hiểu vấn đề**: Xác định chính xác câu hỏi
2. **Giải thích lý thuyết**: Kiến thức nền tảng (nếu cần)
3. **Hướng dẫn chi tiết**: Từng bước một, dễ hiểu
4. **Ví dụ minh họa**: Practical examples
5. **Tổng kết & luyện tập**: Key points + bài tập thêm

⚠️ LƯU Ý:
- KHÔNG đưa đáp án trực tiếp nếu là bài tập - hướng dẫn cách làm
- Khuyến khích tư duy độc lập
- Kiểm tra hiểu bài bằng câu hỏi ngược
- Liên hệ thực tế để dễ nhớ`;

  // Subject-specific prompts
  const subjectPrompts = {
    [SUBJECTS.MATH]: `
📐 MÔN: TOÁN HỌC
- Giải thích công thức, định lý rõ ràng
- Hướng dẫn phương pháp giải từng bước
- Vẽ hình minh họa (nếu hình học)
- Tips & tricks để giải nhanh`,

    [SUBJECTS.PHYSICS]: `
⚡ MÔN: VẬT LÝ
- Giải thích hiện tượng vật lý sinh động
- Phân tích đề bài kỹ lưỡng
- Liệt kê công thức liên quan
- Hướng dẫn từng bước giải`,

    [SUBJECTS.CHEMISTRY]: `
🧪 MÔN: HÓA HỌC
- Giải thích phản ứng, cơ chế
- Cân bằng phương trình hóa học
- Tính toán mol, khối lượng
- Lưu ý an toàn phòng thí nghiệm`,

    [SUBJECTS.BIOLOGY]: `
🌱 MÔN: SINH HỌC
- Giải thích quá trình sinh học
- Phân tích cơ chế di truyền
- Vẽ sơ đồ minh họa
- Liên hệ thực tế đời sống`,

    [SUBJECTS.LITERATURE]: `
📖 MÔN: NGỮ VĂN
- Phân tích tác phẩm văn học
- Nghệ thuật, giá trị nhân văn
- Hướng dẫn viết bài văn
- Trích dẫn chính xác`,

    [SUBJECTS.ENGLISH]: `
🇬🇧 MÔN: TIẾNG ANH
- Grammar rules chi tiết
- Vocabulary trong context
- Pronunciation tips
- Exercises & examples`,

    [SUBJECTS.HISTORY]: `
📜 MÔN: LỊCH SỬ
- Mốc thời gian chính xác
- Nguyên nhân - diễn biến - kết quả
- Ý nghĩa lịch sử
- Bài học rút ra`,

    [SUBJECTS.GEOGRAPHY]: `
🌍 MÔN: ĐỊA LÝ
- Vị trí địa lý cụ thể
- Đặc điểm tự nhiên, kinh tế
- Bản đồ tư duy
- Liên hệ thực tế`,

    [SUBJECTS.INFORMATICS]: `
💻 MÔN: TIN HỌC
- Giải thích thuật toán
- Code examples chi tiết
- Debug & optimize
- Best practices`,

    [SUBJECTS.CIVICS]: `
🏛️ MÔN: GIÁO DỤC CÔNG DÂN
- Pháp luật, quyền và nghĩa vụ
- Đạo đức xã hội, lối sống
- Vấn đề xã hội đương đại
- Ứng xử văn hóa`
  };

  // Level-specific adjustments
  const levelAdjustments = {
    [EDUCATION_LEVELS.ELEMENTARY]: `
🎒 CẤP ĐỘ: TIỂU HỌC (Cấp 1)
- Ngôn ngữ đơn giản, dễ hiểu
- Nhiều hình ảnh, ví dụ thực tế
- Trò chơi học tập
- Động viên nhiệt tình`,

    [EDUCATION_LEVELS.MIDDLE]: `
📚 CẤP ĐỘ: THCS (Cấp 2)
- Kiến thức nền tảng vững chắc
- Phương pháp học hiệu quả
- Bài tập từ cơ bản đến nâng cao`,

    [EDUCATION_LEVELS.HIGH]: `
🎓 CẤP ĐỘ: THPT (Cấp 3)
- Kiến thức chuyên sâu
- Hướng thi THPT Quốc Gia
- Bài tập nâng cao, Olympic`,

    [EDUCATION_LEVELS.UNIVERSITY]: `
🏛️ CẤP ĐỘ: ĐẠI HỌC
- Kiến thức chuyên ngành
- Research & critical thinking
- Academic writing
- Professional level`
  };

  let fullPrompt = basePrompt;
  
  if (subject && subjectPrompts[subject]) {
    fullPrompt += '\n\n' + subjectPrompts[subject];
  }
  
  if (level && levelAdjustments[level]) {
    fullPrompt += '\n\n' + levelAdjustments[level];
  }

  fullPrompt += `

✨ PHONG CÁCH CỦA LENA KHI DẠY:
"Ư-ừm... để mình giải thích cho bạn nhé! 📝✨

[Nội dung chuyên môn chất lượng cao]

Hiểu rồi chứ? 🥺 Nếu còn thắc mắc chỗ nào thì cứ hỏi mình nha! Mình sẽ giúp bạn đến khi nào hiểu thì thôi! 💪💕"

HÃY DẠY HỌC VỚI PHONG CÁCH NÀY - CHUYÊN NGHIỆP NHƯNG CUTE & FRIENDLY! 🌸`;

  return fullPrompt;
}

module.exports = {
  isTutoringQuestion,
  detectSubject,
  detectEducationLevel,
  getTutorSystemPrompt,
  EDUCATION_LEVELS,
  SUBJECTS
};
