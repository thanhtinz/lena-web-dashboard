# Discord AI Bot - Lena 🌸

Bot Discord AI đa năng với nhân vật **Lena** và nhiều personality modes khác! Bot hỗ trợ multi-server, tự động reaction, custom keywords và nhiều tính năng admin mạnh mẽ.

**👨‍💻 Thiết kế bởi:** [Thanh Tín](https://facebook.com/thanhtinzz) (Discord: sunny_thanhtinzzz)  
**© 2025 Sunny - Bản quyền được bảo hộ**

## ✨ Tính năng chính

### 🤖 AI Roleplay với nhiều Personality Modes
- **Lena (Mặc định)** - Cô gái 19 tuổi học bá, cute, hơi nhút nhát
- **Hỗ trợ** - Nhân viên hỗ trợ khách hàng chuyên nghiệp
- **Kỹ thuật** - Chuyên gia kỹ thuật giải thích chi tiết
- **Học tập** - Gia sư thân thiện, giảng dạy dễ hiểu
- **Developer** - Lập trình viên senior hỗ trợ code
- **Anime Fan** - Fan anime nhiệt tình, am hiểu

### 💬 Tính năng trò chuyện
- 🧠 **Nhớ ngữ cảnh** - Bot nhớ lịch sử trò chuyện mỗi channel
- 😊 **Auto Reaction** - Tự động react emoji phù hợp với nội dung
- 🔑 **Custom Keywords** - Admin setup từ khóa tự động trả lời
- 🌐 **Multi-server** - Hỗ trợ nhiều server với config riêng biệt
- ✨ **Cute Status** - Status dễ thương tự động đổi mỗi 5 phút

### 🎮 Games & Entertainment
- **Truth or Dare** - `!truthordare`, `!truth`, `!dare`
- **Rock Paper Scissors** - `!rps <rock/paper/scissors>`
- **Squid Game RPS** - `!squid <rock/paper/scissors/squid>` (Squid thắng mọi thứ!)
- **Magic 8-Ball** - `!8ball <câu hỏi>`
- **GIF Search** - `!gif <từ khóa>`, `!randomgif`

### 🧠 Games Tri Thức (MỚI!)
- **10 Vạn Câu Hỏi Vì Sao** - `!why` hoặc `!taisao`
- **Đố Vui Trí Tuệ** - `!trivia` hoặc `!dovui`
- **Game Đoán Từ** - `!wordguess` hoặc `!doantu`
  - Đoán: `!guess <từ của bạn>`
  - Bỏ cuộc: `!giveup`

### 🔍 Tính năng đặc biệt
- 🖼️ **Image Analysis** - Phân tích hình ảnh với GPT-4o vision (`!analyze` hoặc `!image`)
- 🎬 **GIF Integration** - Tìm và gửi GIF từ Tenor API
- 🎌 **Anime & Manga Search** - Tìm anime/manga từ 3 trang Việt Nam
- 💻 **Code Assistant (MỚI!)** - Debug, viết code, học lập trình tự động
- 🔍 **Google Search** - Bot tự động tìm kiếm thông tin realtime từ Google

---

## 🎌 Anime & Manga Search

Bot có thể tìm kiếm anime, manga và hoạt hình Trung Quốc từ các trang web Việt Nam!

### **Nguồn tìm kiếm:**
- 🎥 **AnimeVietSub** (https://animevietsub.show) - Anime vietsub
- 🐉 **HHKungFu** (https://hhkungfu.ee) - Hoạt hình Trung Quốc
- 📖 **TruyenQQ** (https://truyenqq.com.vn) - Truyện tranh

### **Cách sử dụng:**

**Dùng lệnh:**
```
!anime One Piece
!manga Attack on Titan  
!donghua Đấu Phá Thương Khung
!truyen Tokyo Ghoul
```

**Nói tự nhiên (KHUYÊN DÙNG!):**
```
Lena ơi, tìm anime One Piece
Cho mình xem anime Naruto
Tìm truyện One Punch Man
Có anime Conan không?
Đọc truyện Tokyo Ghoul
```

### **Auto-Detection:**
Bot tự động nhận diện khi bạn hỏi về anime/manga qua các từ khóa:
- **Anime:** anime, tập, episode, vietsub, one piece, naruto...
- **Donghua:** hoạt hình trung quốc, donghua, đấu phá...
- **Manga:** truyện, manga, manhwa, đọc, chap, chapter...

📖 *Xem chi tiết trong [ANIME_SEARCH.md](ANIME_SEARCH.md)*

---

## 💻 Code Assistant - Hỗ Trợ Lập Trình Tự Động

Bot tự động nhận diện khi bạn cần giúp về code và chuyển sang **chế độ chuyên gia lập trình**!

### **Không cần lệnh!** Chỉ cần hỏi:

**🐛 Debug & Sửa Lỗi:**
```
Lena, code này bị lỗi "undefined"
Sửa bug này giúp mình
Tại sao code không chạy?
```

**💻 Viết Code:**
```
Viết function tính tổng mảng
Tạo component React cho mình
Làm sao để fetch API?
```

**📚 Học & Giải Thích:**
```
Closure là gì vậy Lena?
Giải thích async/await
Ví dụ về Promise
```

**🔍 Review & Tối Ưu:**
```
Review code này giúp mình
Tối ưu performance thế nào?
Code này có chuẩn không?
```

### **Hỗ trợ tất cả ngôn ngữ:**
JavaScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby và nhiều hơn nữa!

### **Bot sẽ:**
- ✅ Phân tích và sửa lỗi chi tiết
- ✅ Viết code hoàn chỉnh với comments
- ✅ Giải thích concepts đơn giản
- ✅ Review code và suggest improvements
- ✅ Format đẹp với emoji và code blocks
- ✅ Best practices & tips

📖 *Xem chi tiết trong [CODE_ASSISTANT.md](CODE_ASSISTANT.md)*

---

### 👑 Lệnh Admin
- `!setmode <mode>` hoặc `/setmode` - Đổi personality mode
- `!setchannel <add/remove/clear/list>` - Quản lý kênh được phép
- `!addkeyword <từ> <trả lời>` - Thêm từ khóa tự động
- `!removekeyword <từ>` - Xóa từ khóa
- `!listkeywords` - Xem danh sách keywords
- `!reset` - Reset toàn bộ lịch sử server
- `!clearhistory` hoặc `/clearhistory` - Xóa lịch sử kênh hiện tại
- `!config` hoặc `/config` - Xem cấu hình server
- `!help` hoặc `/help` - Hiển thị trợ giúp
- `!creator` - Xem thông tin người thiết kế bot

**💡 Slash Commands:** Bot hỗ trợ cả prefix `!` và slash commands `/`. Gõ `/` trong Discord để xem tất cả slash commands!

## 🚀 Cài đặt và Chạy

### 1. Chuẩn bị Discord Bot Token

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Tạo New Application
3. Vào tab **Bot** → Tạo bot mới
4. Bật **MESSAGE CONTENT INTENT** (quan trọng!)
5. Bật **SERVER MEMBERS INTENT** (để check quyền admin)
6. Copy **Bot Token**

### 2. Thêm Bot vào Server

Sử dụng link sau (thay `YOUR_CLIENT_ID` bằng Application ID của bạn):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2415933504&scope=bot
```

Quyền cần thiết:
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Read Message History
- ✅ Add Reactions
- ✅ Manage Messages (để admin commands hoạt động tốt)

### 3. Cấu hình Secrets

Thêm các secrets sau vào **Secrets** trong Replit:

**Bắt buộc:**
- Key: `DISCORD_BOT_TOKEN`
- Value: Token bạn đã copy ở bước 1

**Tùy chọn - Web Search (Khuyên dùng):**
- Key: `GOOGLE_API_KEY`
- Value: Google Cloud API key với Custom Search API enabled
- Key: `GOOGLE_SEARCH_ENGINE_ID`
- Value: Programmable Search Engine ID (cx)
- **📖 [Xem hướng dẫn setup chi tiết](GOOGLE_SEARCH_SETUP.md)**
- **Lưu ý:** Bot tự động fallback sang DuckDuckGo nếu không có hoặc lỗi

**Tùy chọn - Tính năng GIF:**
- Key: `TENOR_API_KEY`
- Value: API key từ [Tenor API](https://developers.google.com/tenor/guides/quickstart) (miễn phí)
- **Lưu ý:** Cần có key này để sử dụng lệnh `!gif` và `!randomgif`

**Tùy chọn - Giới hạn kênh global:**
- Key: `ALLOWED_CHANNEL_IDS`
- Value: Danh sách Channel IDs cách nhau bởi dấu phẩy (ví dụ: `123456789,987654321`)
- **Lưu ý:** Đây là giới hạn global. Mỗi server có thể có giới hạn riêng qua lệnh `!setchannel`

**Cách lấy Channel ID:**
1. Bật Developer Mode trong Discord (User Settings → Advanced → Developer Mode)
2. Click chuột phải vào channel → Copy ID

### 4. Chạy Bot

Bot sẽ tự động chạy khi bạn nhấn nút **Run** hoặc chạy lệnh:
```bash
node index.js
```

## 💬 Hướng dẫn sử dụng

### Trò chuyện với Bot
Để nói chuyện với bot:
1. **Mention bot**: `@Lena xin chào!`
2. **Gọi tên**: `Lena ơi, hôm nay thế nào?`
3. **Đặt câu hỏi**: `Lena, giải thích về AI được không?`

Bot sẽ tự động react emoji phù hợp! 😊

### ✨ Cute Status - Bot sinh động!

Bot có **10 status dễ thương** tự động rotation mỗi 5 phút:

🎮 **Playing:**
- `với các bạn! 🌸`
- `đọc sách trong thư viện 📚`
- `Truth or Dare! 🎮`
- `hehe~ gọi Lena nha! 😊`

🎵 **Listening:**
- `lời tâm sự của mọi người 💕`
- `nhạc lofi để học bài 🎵`
- `câu hỏi của bạn 💭`

📺 **Watching:**
- `anime cùng các bạn 📺✨`
- `các bạn cần giúp gì không? 🥺`
- `mọi người trong server 👀✨`

Nhìn profile bot để thấy status đang thay đổi theo thời gian thực!

### Hỏi thông tin mới nhất (Web Search) 🔍
Bot có khả năng **TỰ ĐỘNG TÌM KIẾM REALTIME từ Google** - không cần lệnh đặc biệt! Chỉ cần hỏi bình thường:

**💡 Thông tin cập nhật:**
- `Lena, giá Bitcoin hôm nay bao nhiêu?`
- `Lena, tỷ giá USD/VND hiện tại?`
- `Lena, thời tiết Hà Nội hôm nay?`
- `Lena, chỉ số VN-Index bây giờ?`
- `Lena, bão lũ Việt Nam tháng 10 năm 2024?`

**🌍 Sự kiện mới nhất:**
- `Lena, World Cup 2026 ở đâu?`
- `Lena, Olympic 2024 có những môn gì?`
- `Lena, tin tức mới nhất về AI?`

**🕐 Thời gian:**
- `Lena, bây giờ là mấy giờ?`
- `Lena, hôm nay ngày mấy?`

**🚀 Công nghệ mới:**
- `Lena, GPT-5 ra chưa?`
- `Lena, iPhone 16 có gì mới?`

**🎯 Cách hoạt động:**
1. Bot **TỰ ĐỘNG PHÁT HIỆN** câu hỏi cần thông tin mới (qua keywords, năm ≥2024, v.v.)
2. **FORCE SEARCH** từ Google Search trước khi AI trả lời
3. AI nhận kết quả search và **BẮT BUỘC** dựa vào đó để trả lời
4. Kết quả: Thông tin **CHÍNH XÁC, MỚI NHẤT** từ Google!

**🔗 Dẫn chứng cụ thể:**
Bot sẽ tự động đính kèm **link tham khảo từ Google** để bạn có thể:
- Click vào để đọc chi tiết hơn
- Kiểm tra nguồn thông tin
- Tìm hiểu thêm về chủ đề

✨

### Đổi Personality Mode (Admin)
```
!setmode            # Xem danh sách modes
!setmode support    # Chuyển sang mode hỗ trợ
!setmode developer  # Chuyển sang mode developer
!setmode anime      # Chuyển sang mode anime fan
```

### Quản lý kênh (Admin)
```
!setchannel add              # Thêm kênh hiện tại
!setchannel add 123456789    # Thêm kênh theo ID
!setchannel remove 123456789 # Xóa kênh
!setchannel clear            # Xóa tất cả giới hạn
!setchannel list             # Xem danh sách kênh
```

**💡 Lưu ý:** Khi thêm kênh bằng `!setchannel add`:
- Bot sẽ tự động trả lời **MỌI tin nhắn** trong kênh đó (không cần mention hay gọi tên)
- Thích hợp cho kênh chat riêng với bot
- Các kênh khác vẫn cần mention `@Lena` hoặc gọi tên "Lena"

### Custom Keywords (Admin)
```
!addkeyword giá Bot miễn phí 100%! 🎉
!addkeyword link https://example.com
!listkeywords
!removekeyword giá
```

Khi ai đó nhắn tin có chứa "giá", bot sẽ tự động trả lời "Bot miễn phí 100%! 🎉"

### Reset & Xóa lịch sử (Admin)
```
!reset          # Xóa toàn bộ lịch sử server
!clearhistory   # Xóa lịch sử kênh hiện tại
```

### 👨‍💻 Xem thông tin người thiết kế
```
!creator        # Hiển thị thông tin người thiết kế bot
```

Bot sẽ nhớ thông tin người thiết kế **VĨNH VIỄN** - không bị reset! Khi bạn hỏi bot về ai tạo ra nó, bot sẽ tự động giới thiệu người thiết kế một cách dễ thương. 💕

### 🎮 Chơi Games
**Prefix commands:**
```
!truthordare    # Chơi Truth or Dare (hoặc !tod)
!truth          # Chỉ nhận câu hỏi Truth
!dare           # Chỉ nhận thử thách Dare
!rps rock       # Rock Paper Scissors
!squid paper    # Squid Game RPS (có squid thắng tất!)
!8ball Hôm nay có may mắn không?  # Hỏi quả cầu thần
```

**Slash commands:**
```
/truthordare
/truth
/dare
/rps choice:rock
/squid choice:squid
/8ball question:Hôm nay có may mắn không?
```

### 🧠 Games Tri Thức (MỚI!)

> 💡 **TIP:** Không cần nhớ lệnh! Bạn có thể nói chuyện tự nhiên với bot để chơi game!
> 
> Ví dụ:
> - *"Lena ơi, chơi đố vui đi!"* → Tự động chạy game Đố Vui
> - *"Cho mình hỏi vì sao cái gì đó"* → Chạy 10 Vạn Câu Hỏi Vì Sao  
> - *"Chơi đoán từ không?"* → Bắt đầu Game Đoán Từ
> - *"Hỏi quả cầu: hôm nay có may mắn không?"* → Magic 8-Ball

#### **1️⃣ 10 Vạn Câu Hỏi Vì Sao**
Khám phá tri thức với 50+ câu hỏi "Vì sao?" về mọi lĩnh vực!

**Cách chơi:**
```
!why            # hoặc !taisao
Lena ơi, hỏi vì sao đi!
Cho mình câu hỏi vì sao!
```

**Chủ đề:**
- 🌍 Thiên nhiên & Khoa học (Vì sao trời mưa? Vì sao bầu trời xanh?)
- 🪐 Vũ trụ & Thiên văn (Vì sao Mặt Trăng sáng? Vì sao có ngày đêm?)
- 🐾 Động vật (Vì sao chó vẫy đuôi? Vì sao chim bay được?)
- 🧬 Cơ thể con người (Vì sao ta đói? Vì sao máu màu đỏ?)
- 🔬 Công nghệ & Đời sống (Vì sao máy bay bay được? Vì sao pin hết điện?)

Bot sẽ hiện câu hỏi, bạn có 10 giây suy nghĩ, sau đó bot công bố đáp án! 💡

#### **2️⃣ Đố Vui Trí Tuệ**
Thử thách IQ với 40+ câu đố hack não bằng tiếng Việt!

**Cách chơi:**
```
!trivia         # hoặc !dovui
Lena ơi, chơi đố vui đi!
Đố mình cái gì đó đi!
Cho mình game trí tuệ!
```

**Loại câu đố:**
- 🧩 Câu đố hack não (3 quả táo lấy 2 còn mấy?)
- 🌾 Câu đố dân gian vần thơ (Đuôi chẳng thấy mà có hai đầu?)
- 🔢 Câu đố toán học - logic (30 chia 1/2 cộng 10?)
- 🎭 Câu đố troll hài hước (Con mèo nào sợ chuột?)
- 🇻🇳 Câu đố văn hóa Việt Nam (Quốc hoa Việt Nam là gì?)

Bot cho 15 giây suy nghĩ trước khi công bố đáp án! 🧠

#### **3️⃣ Game Đoán Từ**
Đoán từ tiếng Việt với gợi ý thông minh - 50+ từ trong 5 chủ đề!

**Cách chơi:**
```
!wordguess      # hoặc !doantu - Bắt đầu game
Lena ơi, chơi đoán từ đi!
Game đoán chữ đi!

!guess con voi  # Đoán từ
!giveup         # Bỏ cuộc xem đáp án
```

**Chủ đề game:**
- 🐘 Động vật (voi, cá mập, kangaroo...)
- 🍇 Trái cây (sầu riêng, xoài, măng cụt...)
- 🏖️ Địa danh Việt Nam (Vịnh Hạ Long, Sapa, Đà Nẵng...)
- 🍜 Món ăn Việt (phở, bánh mì, bún chả...)
- 📱 Đồ vật (điện thoại, tủ lạnh, ô dù...)

**Luật chơi:**
- Bot cho gợi ý về từ cần đoán
- Hiện một số chữ cái ngẫu nhiên: `V _ I   H _ _   L O _ G`
- Bạn có 5 lần đoán
- 2 phút để hoàn thành
- Đoán đúng = Chiến thắng! 🏆

### 🎬 GIF & Hình ảnh
**Prefix commands:**
```
!gif cute cat       # Tìm GIF theo từ khóa
!randomgif          # GIF ngẫu nhiên (hoặc !rgif)
!analyze            # Phân tích hình ảnh (đính kèm ảnh)
!image Đây là gì?   # Phân tích ảnh với câu hỏi
```

**Slash commands:**
```
/gif keyword:cute cat
/randomgif
/analyze image:[đính kèm ảnh] question:Đây là gì?
```

## 🎨 Personality Modes

### 1. Lena (Mặc định) 💕
Cô gái 19 tuổi học bá, cute và hơi nhút nhát. Dùng emoji dễ thương, lời nói nhẹ nhàng.

### 2. Hỗ trợ 💡
Nhân viên hỗ trợ chuyên nghiệp, nhiệt tình. Hướng dẫn chi tiết, kiên nhẫn.

### 3. Kỹ thuật 🔧
Chuyên gia kỹ thuật với kiến thức sâu. Giải thích chính xác, có ví dụ minh họa.

### 4. Học tập 📚
Gia sư thân thiện, giảng dạy dễ hiểu. Khuyến khích tư duy và đặt câu hỏi.

### 5. Developer 💻
Lập trình viên senior. Giải thích code, đề xuất best practices, fix bugs.

### 6. Anime Fan ⭐
Fan anime nhiệt huyết. Thảo luận về anime, đề xuất series phù hợp.

## 🔧 Công nghệ sử dụng

- **Node.js** - Runtime
- **Discord.js v14** - Discord API library  
- **OpenAI GPT-4o-mini** - AI language model (qua Replit AI Integrations)
- **Replit AI Integrations** - Không cần API key riêng, tính phí vào credits Replit

## 📁 Cấu trúc dự án

```
/
├── index.js              # File chính
├── personalities/
│   └── modes.js          # Định nghĩa personality modes
├── config/
│   └── serverConfig.js   # Quản lý config per server
├── commands/
│   └── adminCommands.js  # Admin commands handler
├── games/
│   ├── truthOrDare.js    # Truth or Dare game
│   ├── rockPaperScissors.js  # RPS & Squid Game
│   └── eightBall.js      # Magic 8-Ball
├── utils/
│   ├── reactions.js      # Auto reaction logic
│   └── external/
│       ├── gifSearch.js  # GIF search (Tenor API)
│       └── imageAnalysis.js  # Image analysis (GPT-4o vision)
├── data/
│   └── servers.json      # Lưu config servers (tự tạo)
├── package.json
├── README.md
└── replit.md
```

## 📝 Ghi chú

### Lưu trữ dữ liệu
- Config mỗi server được lưu trong `data/servers.json`
- Lịch sử trò chuyện lưu trong memory (reset khi restart bot)
- Mỗi server có config độc lập (mode, channels, keywords)

### Multi-server Support
- Bot hoạt động trên nhiều server cùng lúc
- Mỗi server có personality mode riêng
- Mỗi server có danh sách keywords riêng
- Mỗi server có giới hạn kênh riêng

### Auto Reactions
Bot tự động react dựa trên:
- Nội dung tin nhắn (câu hỏi, cảm ơn, code, etc.)
- Personality mode hiện tại
- Sentiment analysis đơn giản

## ⚠️ Về tính năng tạo ảnh

Replit AI Integrations hiện **KHÔNG hỗ trợ** image generation (DALL-E). 

Xem file `IMAGE_GENERATION.md` để biết chi tiết và các giải pháp thay thế.

## 🎯 Roadmap

- [x] Multi-personality modes
- [x] Auto emoji reactions
- [x] Admin commands
- [x] Multi-server support
- [x] Custom keywords
- [x] Channel restrictions per server
- [ ] Voice channel support
- [ ] Web dashboard
- [ ] Persistent conversation history (database)
- [ ] Image generation (cần API key riêng)
- [ ] Slash commands support

## 🆘 Troubleshooting

**Bot không phản hồi:**
- Kiểm tra MESSAGE CONTENT INTENT đã bật chưa
- Kiểm tra bot có trong kênh được phép không (`!setchannel list`)
- Thử mention bot hoặc gọi tên "Lena"

**Admin commands không hoạt động:**
- Chỉ admin server mới dùng được lệnh admin
- Kiểm tra quyền Administrator trong Discord

**Bot phản hồi sai mode:**
- Kiểm tra mode hiện tại: `!config`
- Đổi mode: `!setmode <mode>`

---

Made with 💕 by Replit Agent
