# 🎮 Natural Language Game Triggers

## Tính năng mới: Không cần nhớ lệnh!

Bot giờ đã **thông minh hơn** - bạn không cần nhớ lệnh phức tạp nữa! Chỉ cần **nói chuyện tự nhiên** với bot, nó sẽ tự động hiểu và chạy game phù hợp.

---

## 📋 Danh sách Game Hỗ Trợ

### 1️⃣ **10 Vạn Câu Hỏi Vì Sao**

**Cách kích hoạt tự nhiên:**
```
Lena ơi, hỏi vì sao đi!
Cho mình câu hỏi vì sao!
Mình muốn biết vì sao cái gì đó
Game 10 vạn câu hỏi đi!
```

**Hoặc dùng lệnh:**
```
!why
!taisao
!visao
```

---

### 2️⃣ **Đố Vui Trí Tuệ**

**Cách kích hoạt tự nhiên:**
```
Lena ơi, chơi đố vui đi!
Đố mình cái gì đó!
Cho mình câu đố!
Game trí tuệ thôi!
Hack não đi!
```

**Hoặc dùng lệnh:**
```
!trivia
!dovui
```

---

### 3️⃣ **Game Đoán Từ**

**Cách kích hoạt tự nhiên:**
```
Lena, chơi đoán từ đi!
Game đoán chữ không?
Muốn đoán từ!
Chơi Vua Tiếng Việt!
```

**Hoặc dùng lệnh:**
```
!wordguess
!doantu
```

---

### 4️⃣ **Truth or Dare**

**Cách kích hoạt tự nhiên:**
```
Lena ơi, chơi Truth or Dare!
Game thật hay thách đi!
Cho mình Truth!
Đưa câu Dare đi!
```

**Hoặc dùng lệnh:**
```
!truthordare
!tod
!truth
!dare
```

---

### 5️⃣ **Rock Paper Scissors**

**Cách kích hoạt tự nhiên:**
```
Lena, chơi oẳn tù tì!
Kéo búa bao đi!
Chơi RPS không?
Squid Game thôi!
```

**Hoặc dùng lệnh:**
```
!rps rock
!squid squid
```

---

### 6️⃣ **Magic 8-Ball**

**Cách kích hoạt tự nhiên:**
```
Lena ơi, hỏi quả cầu: hôm nay có may mắn không?
Cho mình hỏi quả cầu thần!
8 ball: tôi có nên đi chơi không?
```

**Hoặc dùng lệnh:**
```
!8ball Hôm nay có may mắn không?
```

---

### 7️⃣ **GIF Search**

**Cách kích hoạt tự nhiên:**
```
Lena ơi, tìm gif mèo dễ thương!
Gửi gif cho mình!
Cho xem ảnh động vui!
```

**Hoặc dùng lệnh:**
```
!gif mèo
!randomgif
```

---

## 🤖 Cách Hoạt Động

Bot sử dụng **pattern matching thông minh** để nhận diện ý định của bạn:

1. **Bạn nói chuyện tự nhiên** với bot (mention hoặc trong allowed channels)
2. Bot **phân tích nội dung** tin nhắn để tìm từ khóa game
3. Nếu phát hiện pattern phù hợp, bot **tự động chạy game** ngay lập tức
4. Nếu không match game nào, bot sẽ **trả lời bình thường** bằng AI

---

## ✨ Ưu Điểm

✅ **Tự nhiên hơn** - Nói chuyện như với bạn bè  
✅ **Không cần nhớ lệnh** - Bot tự hiểu ý bạn  
✅ **Nhanh chóng** - Trigger game ngay lập tức  
✅ **Thông minh** - Fallback về AI nếu không match  
✅ **Linh hoạt** - Nhiều cách nói khác nhau đều được

---

## 📝 Ví Dụ Cụ Thể

**Case 1: Muốn chơi Đố Vui**
```
User: Lena ơi, đố mình cái gì đó đi!
Bot: [Tự động chạy game Đố Vui Trí Tuệ]
```

**Case 2: Hỏi Vì Sao**
```
User: Lena, cho mình hỏi vì sao trời mưa?
Bot: [Tự động chạy 10 Vạn Câu Hỏi Vì Sao]
```

**Case 3: Đoán Từ**
```
User: Chơi game đoán chữ không Lena?
Bot: [Tự động bắt đầu Game Đoán Từ]
```

**Case 4: Magic 8-Ball**
```
User: Lena ơi, hỏi quả cầu: hôm nay tôi có may mắn không?
Bot: 🎱 [Trả lời bằng Magic 8-Ball]
```

---

## 🎯 Tips & Tricks

💡 **Tip 1:** Bạn vẫn có thể dùng lệnh truyền thống (!why, !trivia...) nếu muốn nhanh

💡 **Tip 2:** Natural language chỉ hoạt động khi bot được mention hoặc trong allowed channels

💡 **Tip 3:** Nếu bot không hiểu, nó sẽ trả lời bình thường - bạn có thể nói rõ hơn

💡 **Tip 4:** Có thể kết hợp từ khóa tiếng Việt và tiếng Anh (ví dụ: "chơi Truth or Dare")

---

## 🔧 Technical Details

Natural language detection được implement trong:
- **File:** `utils/naturalLanguageGames.js`
- **Phương pháp:** Regex pattern matching
- **Số patterns:** 30+ patterns cho 7 loại games
- **Fallback:** Tự động chuyển sang AI response nếu không match

---

**🎉 Enjoy playing games với bot một cách tự nhiên nhất!**
