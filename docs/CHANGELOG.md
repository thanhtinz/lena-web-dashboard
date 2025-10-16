# 📝 CHANGELOG - Discord AI Bot Lena

## [2025-10-13] - GAME INFO SYSTEM - HỆ THỐNG THÔNG TIN GAME

### ✨ Tính năng mới

#### 🎮 Game Info System
- **23 tựa game** - MLBB, LoL, Valorant, Genshin, Honkai, Dota 2, PUBG, Free Fire, Wild Rift, CODM, Wuthering Waves, ZZZ, AoV, Clash Royale, Brawl Stars, Clash of Clans, Overwatch 2, Apex, Fortnite, CS2, Diablo 4, PoE, Lost Ark
- **8 loại thông tin** - Build, Combo, Guide, Tier List, Counter, Tips, Update, Strategy
- **Auto Detection** - Tự động nhận diện game queries (priority 6-10)
- **Web Search Integration** - Real-time info từ Google/DuckDuckGo
- **Smart Entity Extraction** - Tự động detect hero/champion/agent names
- **Cute Responses** - Random intros/outros với Lena style
- **Auto Reactions** - React 🎮🎯✨ khi fetch game info

#### 🎯 Detection System (10 patterns)
- **Priority 10**: Specific - "cho mình xem build Hayabusa", "combo Yasuo"
- **Priority 9**: Direct - "cách chơi Jett", "guide Wanwan", "tier list MLBB"
- **Priority 8**: Counter - "counter Fanny", "chống Yasuo"
- **Priority 7**: Updates - "MLBB update mới", "patch notes"
- **Priority 6**: General - "build/combo/guide/tier"

#### 🔍 Smart Features
- **Game Detection**: Auto-detect 23 games từ keywords (multiple aliases)
- **Query Type Detection**: 8 types với priority ranking
- **Entity Extraction**: Extract hero/champion/agent names từ message
- **Search Query Building**: Optimize query cho web search
- **Fallback**: Tự động falls through nếu không đủ context

#### 🎮 Supported Games (23 tựa)

**MOBA (5 games):**
- Mobile Legends, League of Legends, Dota 2, Wild Rift, Arena of Valor

**Shooter (7 games):**
- Valorant, CS2, Overwatch 2, Apex Legends, COD Mobile, PUBG Mobile, Free Fire

**Battle Royale (1 game):**
- Fortnite

**RPG/Gacha (4 games):**
- Genshin Impact, Honkai Star Rail, Wuthering Waves, Zenless Zone Zero

**Strategy (2 games):**
- Clash Royale, Brawl Stars

**ARPG (3 games):**
- Diablo 4, Path of Exile, Lost Ark

#### 📋 Query Types (8 loại)
1. **Build** (Priority 10) - Trang bị, đồ, items
2. **Combo** (Priority 10) - Combo skill, kỹ năng
3. **Guide** (Priority 9) - Hướng dẫn, cách chơi
4. **Tier List** (Priority 9) - Meta, ranking, top
5. **Counter** (Priority 8) - Counter pick, khắc chế
6. **Tips** (Priority 8) - Mẹo, bí kíp
7. **Update** (Priority 7) - Patch notes, buff/nerf
8. **Strategy** (Priority 7) - Chiến thuật, lối chơi

#### 🎨 Response Format
- Cute intros (8 variations)
- Title: **[Game] - [Entity] - [Type]**
- Content: Web search results (max 1800 chars)
- Cute outros (8 variations)
- Reactions: 🎮🎯✨

### 🔧 Technical Implementation

**Files mới:**
- `utils/gameDetector.js` - Detection patterns, games, query types
- `utils/external/gameFetcher.js` - Web search integration, formatting
- `GAMES.md` - Complete documentation

**Detection System:**
```javascript
isGameRequest(message)        // Check if game request (priority 6-10)
detectGame(message)            // Detect game from 23 options
detectQueryType(message)       // Detect query type from 8 options
extractEntityName(message)     // Extract hero/champion/agent name
buildSearchQuery(...)          // Build optimized search query
```

**Fetching & Formatting:**
```javascript
searchGameInfo(query, webSearchFunction)  // Web search for info
formatGameInfo(result, game, type, name)  // Format with cute style
handleGameRequest(message, searchWeb)     // Main handler
```

**Integration:**
```
Anime/Manga Search (Highest)
   ↓
Video/Music Search
   ↓
News System
   ↓
GAME INFO SYSTEM 🎮 (NEW)
   ↓
Natural Language Games → ...
```

### 📖 Usage Examples

**Build:**
```
User: "Lena ơi, build Hayabusa MLBB"
Bot: 🎮 [Hayabusa build guide with items, emblem, playstyle]
```

**Combo:**
```
User: "Combo Yasuo LoL"
Bot: 🎮 [Yasuo combo guide with E+Q, tornado setup, Beyblade]
```

**Tier List:**
```
User: "MLBB tier list mới nhất"
Bot: 🎮 [S-tier heroes, meta analysis, October 2025]
```

**Guide:**
```
User: "Valorant Jett guide"
Bot: 🎮 [Jett abilities, tips, playstyle, best maps]
```

**Counter:**
```
User: "Counter Fanny MLBB"
Bot: 🎮 [Best counters: Khufra, Saber, Natalia + tips]
```

### ⚙️ Configuration

**Detection Patterns:**
- 10 regex patterns with priority 6-10
- Game keywords: 23 games, multiple aliases each
- Query keywords: 8 types, Vietnamese + English

**Web Search:**
- Uses: Google Custom Search API (via searchWeb)
- Fallback: DuckDuckGo if Google fails
- Query format: `"[Game] [Entity] [Type] 2025"`
- Example: `"Mobile Legends Hayabusa build guide 2025"`

**Response Limits:**
- Max content: 1800 chars (leaves room for formatting)
- Total message: < 2000 chars (Discord limit)
- Auto truncation: "..." if exceeds

**No Additional API Keys:**
- ✅ Uses existing web search (Google/DuckDuckGo)
- ✅ No game-specific APIs needed
- ✅ Works out of the box

### 🎯 Ưu điểm
- ✅ 23 games phổ biến (mobile + PC)
- ✅ 8 loại info đa dạng
- ✅ Auto detection - tự nhiên
- ✅ Real-time - web search
- ✅ Cute responses - Lena style
- ✅ No extra APIs
- ✅ Miễn phí

### ⚠️ Limitations
- Web search dependent (có fallback)
- Thông tin có thể cũ nếu meta thay đổi nhanh
- Entity names cần rõ ràng (tiếng Anh tốt hơn)
- Discord 2000 char limit (auto truncate)

---

## [2025-10-13] - VIETNAM NEWS SYSTEM - HỆ THỐNG TIN TỨC VIỆT NAM

### ✨ Tính năng mới

#### 📰 Vietnam News System
- **5 trang báo lớn**: VnExpress, Tuổi Trẻ, Thanh Niên, Dân Trí, VietnamNet
- **Real-time Updates**: RSS feeds tự động cập nhật mỗi ngày
- **Auto Detection**: Tự động nhận diện yêu cầu tin tức (18+ patterns, priority 6-10)
- **8 danh mục**: Thế giới, Kinh tế, Giải trí, Thể thao, Công nghệ, Khoa học, Sức khỏe, Giáo dục
- **Smart Filtering**: Detect source + category từ natural language
- **Cute Responses**: Random intros/outros với Lena style
- **Auto Reactions**: React 📰📱✨ khi fetch tin tức

#### 🎯 Detection Patterns (18+ patterns)
- **Priority 10**: Specific - "cho mình xem tin tức", "muốn đọc báo"
- **Priority 9**: Direct - "xem tin tức", "tin mới hôm nay"
- **Priority 8**: Category/Source - "tin công nghệ", "VnExpress mới"
- **Priority 7**: Inquiry - "có tin gì mới", "tin hot"
- **Priority 6**: Casual - "xem tin", "đọc báo"

#### 🔍 Smart Features
- **Source Detection**: Auto-detect trang báo từ keywords
- **Category Detection**: Auto-detect danh mục từ message
- **RSS Mapping**: Smart mapping RSS URL based on source + category
- **Fallback**: Default VnExpress nếu không chỉ định nguồn

#### 📊 News Sources (5 trang)
**VnExpress** (Default):
- Keywords: vnexpress, vne
- 8 categories: Thế giới, Kinh tế, Giải trí, Thể thao, Công nghệ, Khoa học, Sức khỏe, Giáo dục
- RSS: https://vnexpress.net/rss/

**Tuổi Trẻ**:
- Keywords: tuoitre, tuổi trẻ
- 5 categories chính
- RSS: https://tuoitre.vn/rss/

**Thanh Niên**:
- Keywords: thanhnien, thanh niên
- 5 categories chính
- RSS: https://thanhnien.vn/rss/

**Dân Trí**:
- Keywords: dantri, dân trí
- 7 categories
- RSS: https://dantri.com.vn/rss/

**VietnamNet**:
- Keywords: vietnamnet, vnn
- 7 categories
- RSS: https://vietnamnet.vn/rss/

#### 🎨 Response Format
- Top 5 tin tức với emojis (🥇🥈🥉4️⃣5️⃣)
- Title, description (200 chars), time ago, link
- Time display: "Vừa xong", "X phút/giờ/ngày trước", "DD/MM/YYYY"
- Random cute intros & outros
- Reactions: 📰📱✨

### 🔧 Technical Implementation

**Files mới:**
- `utils/newsDetector.js` - Detection patterns, sources, categories
- `utils/external/newsFetcher.js` - RSS parsing, formatting
- `NEWS.md` - Complete documentation

**Dependencies:**
- `rss-parser` - RSS feed parsing

**Detection System:**
```javascript
isNewsRequest(message)        // Check if news request
detectCategory(message)        // Detect category
detectSource(message)          // Detect news source
getRssUrl(source, category)   // Get RSS URL
```

**Fetching & Parsing:**
```javascript
fetchNews(rssUrl, limit)      // Fetch from RSS
formatNewsResults(result)     // Format with cute responses
```

**Integration:**
```
Anime/Manga Search (Highest)
   ↓
Video/Music Search
   ↓
NEWS SYSTEM 📰 (NEW)
   ↓
Natural Language Games → ...
```

### 📖 Usage Examples

**Tin chung:**
```
User: "Lena ơi, cho mình xem tin tức"
Bot: 📰 [Top 5 VnExpress tin mới nhất]
```

**Theo danh mục:**
```
User: "Tin công nghệ mới gì?"
Bot: 📰 [Top 5 VnExpress - Công Nghệ]
```

**Theo nguồn:**
```
User: "Tuổi Trẻ hôm nay"
Bot: 📰 [Top 5 Tuổi Trẻ tin mới]
```

**Nguồn + Danh mục:**
```
User: "Thanh Niên tin thể thao"
Bot: 📰 [Top 5 Thanh Niên - Thể Thao]
```

### ⚙️ Configuration

**RSS Parser:**
- Timeout: 10 seconds
- User-Agent: Mozilla/5.0
- Items per request: 5 tin
- Description max: 200 chars

**No API Key Required:**
- ✅ RSS feeds công khai
- ✅ Miễn phí 100%
- ✅ Auto update 5-15 phút

### 🎯 Ưu điểm
- ✅ Real-time (RSS auto update)
- ✅ 5 nguồn uy tín VN
- ✅ 8 danh mục đa dạng
- ✅ Tự động nhận diện
- ✅ Cute responses
- ✅ Không cần API key
- ✅ Miễn phí

### ⚠️ Limitations
- RSS phụ thuộc trang báo (rare down)
- Chỉ có summary, không full article
- Real-time delay 5-15 phút (acceptable)
- Categories khác nhau mỗi trang

---

## [2025-10-13] - PROFESSIONAL LOGGING SYSTEM - HỆ THỐNG LOG CHUYÊN NGHIỆP

### ✨ Tính năng mới

#### 📊 Professional Logging System
- **Centralized Logging**: Logs từ tất cả servers gửi về 1 kênh Discord tập trung
- **4 Log Levels**: ERROR, WARN, INFO (default), DEBUG với priority system
- **7 Log Categories**: Command, Error, Event, System, Security, API, Database
- **Beautiful Embeds**: Format đẹp, dễ đọc với colors, emojis, và structured fields
- **Queue System**: Rate limit handling với 1 log/second processing

#### 🎯 Logged Events
**Tự động log:**
- Bot startup/shutdown events
- Server join/leave events
- Critical errors với stack traces
- Blacklist 18+ triggers (security)
- Message processing errors
- Discord client errors
- Admin command usage (future)

#### 📝 Admin Commands (3 commands)
- **!loglevel [level]**: Set/view log level (error|warn|info|debug)
- **!logstats**: View logging system statistics
- **!logtest**: Test logging với sample logs

#### 🔧 Technical Implementation

**Files mới:**
- `utils/logger.js` - Core logging system với Logger class
- `commands/loggingCommands.js` - Admin commands handler
- `LOGGING.md` - Complete documentation

**Logger Features:**
- **Log Levels**: 4 levels với priority filtering
- **Log Categories**: 7 categories cho organization
- **Embed Builder**: Rich Discord embeds với colors
- **Queue System**: Async processing, rate limit prevention
- **Specialized Methods**: logCommand, logError, logEvent, logSecurity, logAPI, logDatabase

**Integration Points:**
```javascript
// Bot startup
logger.initialize(client, channelId, serverId);
logger.logEvent('🚀 Bot Started', { ... });

// Server events
client.on('guildCreate', async (guild) => {
  logger.logEvent('🎉 Bot Joined Server', { ... });
});

// Error handling
catch (error) {
  logger.logError('Message processing error', error, { ... });
}

// Security
if (blacklistCheck.blocked) {
  logger.logSecurity('🔒 Blocked 18+ Content', { ... });
}
```

### ⚙️ Configuration

**Log Channel:**
- Channel ID: `1427091743542612099`
- Server ID: `1332505823435558973`
- Default Level: `INFO`

**Permissions Required:**
- View Channel
- Send Messages
- Embed Links

### 📊 Log Format

**Standard Embed:**
- Color-coded by level (ERROR: 🔴, WARN: 🟠, INFO: 🔵, DEBUG: ⚪)
- Title: `[emoji] [level] - [category]`
- Description: Main message
- Fields: User, Server, Channel, Command, Error, Stack, Extra
- Timestamp: Auto-added

**Details Tracked:**
- User info (tag, ID)
- Server info (name, ID)
- Channel info (name, ID)
- Command executed
- Error messages & stack traces
- Additional context

### 🎯 Use Cases
1. **Monitor Bot Activity**: Track server joins/leaves, active servers
2. **Debug Issues**: Set DEBUG level, view detailed logs & stack traces
3. **Security Monitoring**: Track blacklist triggers, identify problematic users
4. **Performance Tracking**: Monitor API calls, database operations
5. **Audit Trail**: Track admin commands, config changes

### 💡 Best Practices
- ✅ Monitor log channel regularly
- ✅ Use INFO level for production
- ✅ Switch to DEBUG only when debugging
- ✅ Review error logs immediately
- ✅ Archive logs periodically
- ✅ Don't log sensitive data (passwords, API keys)

### 🌟 Ưu điểm
- ✨ Centralized: All logs in one place
- 📊 Professional: Beautiful embeds, structured data
- 🔍 Debugging: Full context, stack traces
- 🔒 Security: Track security events
- ⚙️ Configurable: Flexible log levels
- 🚀 Scalable: Queue system, rate limit handling

---

## [2025-10-13] - VIDEO & MUSIC SEARCH - YOUTUBE & TIKTOK

### ✨ Tính năng mới

#### 🎵 Video & Music Search System
- **Auto Detection**: Tự động nhận diện yêu cầu tìm video/nhạc (15+ patterns)
- **YouTube Search**: Tìm video/nhạc với YouTube Data API v3 (top 3 results)
- **TikTok Search**: Tìm video TikTok (search URL)
- **Smart Detection**: Tự động phát hiện platform (YouTube/TikTok) và content type (music/video)
- **Cute Responses**: Trả lời với phong cách Lena, random intros/outros
- **Auto Reactions**: React 🎵🎬✨ khi tìm video/nhạc

#### 🎯 Detection Patterns (15+ patterns)
- **Priority 9-10**: Specific requests - "tìm bài hát", "nghe nhạc", "xem video"
- **Priority 8**: Platform-specific - "youtube", "tiktok", "link"
- **Priority 7-8**: Natural requests - "có link", "muốn nghe/xem"
- **Priority 6-7**: Trending style - "tìm ntn", "recommend"

#### 🔍 Smart Features
- **Platform Detection**: Auto-detect YouTube/TikTok từ keywords
- **Content Type**: Auto-detect music/video
- **Query Extraction**: Tự động extract search query từ natural language
- **Fallback**: YouTube default nếu không chỉ định platform

#### 📊 YouTube Integration
- **YouTube Data API v3**: Official API search
- **Top 3 Results**: Title, channel, URL, thumbnail, description
- **API Key**: Optional (có message cute nếu chưa setup)
- **Error Handling**: Graceful degradation với cute messages

#### 📱 TikTok Integration
- **Search URL**: Direct TikTok search link
- **No API Required**: Không cần API key
- **Fallback Method**: Web search alternative

### 🔧 Technical Implementation

**Files mới:**
- `utils/videoSearch.js` - Core search logic, detection, formatting
- `VIDEO_SEARCH.md` - Complete documentation

**Detection System:**
- 15 regex patterns với priority 6-10
- Platform detection: YouTube/TikTok
- Content type detection: music/video
- Query extraction với natural language processing

**Search Functions:**
```javascript
searchYouTube(query, apiKey)   // YouTube Data API v3
searchTikTok(query)             // TikTok search URL
formatVideoResults(result)      // Cute response formatting
```

**Integration:**
```
Anime/Manga Search (Highest)
   ↓
VIDEO/MUSIC SEARCH 🎵 (NEW)
   ↓
Natural Language Games
   ↓
Custom Responses → Database → ...
```

### 📖 Usage Examples

**YouTube Music:**
```
User: "Lena ơi, tìm bài See You Again"
Bot: 🎵 [Top 3 YouTube results với links]
```

**YouTube Video:**
```
User: "Tìm video hướng dẫn React"
Bot: 🎬 [Top 3 tutorial videos]
```

**TikTok:**
```
User: "Tìm TikTok dance challenge"
Bot: ✨ [TikTok search URL]
```

### ⚙️ Configuration

**YouTube API Key (Optional):**
- Lấy từ Google Cloud Console
- Enable YouTube Data API v3
- Add vào Replit Secrets: `YOUTUBE_API_KEY`

**TikTok:**
- Không cần API key
- Auto redirect search URL

### 🎯 Ưu điểm
- ✅ Tự động nhận diện (không cần lệnh)
- ✅ Multi-platform (YouTube & TikTok)
- ✅ Cute responses với Lena style
- ✅ Smart detection (platform & content type)
- ✅ Error handling graceful
- ✅ No API key? Still works với cute explanation

---

## [2025-10-13] - GIA SƯ CHUYÊN NGHIỆP - PROFESSIONAL TUTOR SYSTEM

### ✨ Tính năng mới

#### 📚 Professional Tutor System
- **Auto Detection**: Tự động nhận diện câu hỏi học tập (không cần lệnh)
- **Multi-level Support**: Hỗ trợ từ Tiểu học → Đại học (4 cấp độ)
- **10+ Môn học**: Toán, Lý, Hóa, Sinh, Văn, Anh, Sử, Địa, Tin, GDCD
- **Professional Content**: Tài liệu chất lượng cao, chính xác, chuyên sâu
- **Cute Teaching Style**: Kết hợp phong cách dễ thương của Lena
- **Trending Language**: Sử dụng "ntn", "vứi", "zậy", emoji cute

#### 🎯 Cấp độ hỗ trợ
- 🎒 **Tiểu học (Lớp 1-5)**: Ngôn ngữ đơn giản, ví dụ thực tế, động viên nhiệt tình
- 📚 **THCS (Lớp 6-9)**: Kiến thức nền tảng, phương pháp học hiệu quả
- 🎓 **THPT (Lớp 10-12)**: Chuyên sâu, hướng thi THPT QG, bài tập Olympic
- 🏛️ **Đại học**: Chuyên ngành, research, academic writing

#### 📖 Môn học chi tiết
- **Toán**: Đại số, Hình học, Giải tích, Phương trình, Hàm số
- **Vật lý**: Cơ, Điện, Quang, Nhiệt, Sóng, Vật lý hiện đại
- **Hóa học**: Vô cơ, Hữu cơ, Cân bằng PT, Tính toán mol
- **Sinh học**: Di truyền, Tế bào, Sinh thái, Sinh lý
- **Ngữ văn**: Phân tích tác phẩm, Nghệ thuật, Viết văn
- **Tiếng Anh**: Grammar, Vocabulary, Pronunciation
- **Lịch sử**: Mốc thời gian, Nguyên nhân-Diễn biến-Kết quả
- **Địa lý**: Vị trí, Đặc điểm, Bản đồ tư duy
- **Tin học**: Thuật toán, Code, Debug & Optimize
- **GDCD**: Pháp luật, Đạo đức, Quyền công dân

#### 🎨 Phong cách dạy học

**Quy trình:**
1. Hiểu vấn đề → 2. Giải thích lý thuyết → 3. Hướng dẫn chi tiết → 4. Ví dụ minh họa → 5. Tổng kết & luyện tập

**Example:**
```
"Ư-ừm... để mình giải thích cho bạn nhé! 📝✨

[Nội dung chuyên môn chất lượng cao]

Hiểu rồi chứ? 🥺 Nếu còn thắc mắc chỗ nào thì cứ hỏi mình nha! 💪💕"
```

### 🔧 Technical Implementation

**Files mới:**
- `utils/tutorSystem.js` - Core tutor detection, subject/level detection, teaching prompts
- `TUTOR.md` - Full documentation về tutor system

**Pattern Detection (50+ patterns):**
- Giải bài tập: "giải giúp", "hướng dẫn cho", "làm sao để giải"
- Hỏi kiến thức: "giải thích", "cho hỏi", "là gì", "có nghĩa"
- Môn học: "toán lớp", "vật lý 11", "hóa đại học"
- Trending: "làm ntn", "giúp em với", "tại sao lại"

**Subject Detection:**
- Auto-detect từ keywords: toán, lý, hóa, sinh, văn, anh, sử, địa, tin
- Fallback: general tutor mode

**Level Detection:**
- Lớp 1-5 → Elementary
- Lớp 6-9 → Middle School
- Lớp 10-12 → High School
- Đại học, University → University

**Priority Flow:**
```
Custom Responses → Database → Training Data → Blacklist 
→ TUTOR SYSTEM (Priority 1) → Code Assistant (Priority 2) → AI
```

**Integration:**
- Tutor detection chạy TRƯỚC code assistant
- Dynamic system prompt switching
- Conversation history preserved

### 📖 Documentation
- `TUTOR.md` - Complete guide về tutor system với examples, best practices
- Pattern detection chi tiết
- Subject & level mapping
- Teaching methodology

### 🎯 Ưu điểm
- ✅ Tài liệu chuyên nghiệp + phong cách cute
- ✅ Tự động nhận diện (không cần lệnh)
- ✅ Multi-level (cấp 1 → đại học)
- ✅ 10+ môn học phổ biến
- ✅ Hướng dẫn tư duy, không cho đáp án trực tiếp
- ✅ Động viên, tạo động lực học tập

---

## [2025-10-13] - BLACKLIST 18+ FILTER

### ✨ Tính năng mới

#### 🔒 Blacklist 18+ Content Filter
- **Auto Detection**: Tự động phát hiện nội dung nhạy cảm (18+, violence, drugs, gambling)
- **Cute Rejection**: 8 cute responses từ chối nhẹ nhàng với phong cách Lena
- **Default Blacklist**: 25+ từ khóa phổ biến (tiếng Việt + tiếng Anh)
- **Custom Blacklist**: Admin thêm từ khóa riêng cho server
- **Auto Reactions**: React 🙈, 😳, 🥺 khi block content
- **Logging**: Log mọi blocked attempts vào database
- **False Positive Prevention**: Word boundary matching cho "sex", phrase-based cho "xem sex", "watch porn"
- **Refined Keywords**: Removed overly broad keywords ("dam", "cave") để tránh block normal conversation

#### 🛡️ Blacklist Commands (!blacklist)
- `!blacklist add <keyword>` - Thêm từ khóa vào blacklist
- `!blacklist remove <keyword>` - Xóa từ khóa khỏi blacklist
- `!blacklist list` - Xem danh sách blacklist (default + custom)
- `!blacklist toggle` - Bật/tắt filter (default BẬT)

#### 🎨 Cute Rejection Examples
- "Ư-ừm... m-mình không thể nói về chủ đề đó được... 🥺 Nó hơi... nhạy cảm quá..."
- "À... à... chủ đề này không phù hợp lắm... 😳 M-mình ngại nói về nó..."
- "Ehehe... m-mình không được phép trả lời câu hỏi này... 🙈 Nó hơi... ấy ấy..."

### 🔧 Technical Implementation

**Files mới:**
- `utils/blacklistFilter.js` - Core filter logic, default list, cute responses
- `commands/blacklistCommands.js` - Admin commands để quản lý blacklist
- `BLACKLIST.md` - Full documentation về blacklist system

**Filter Priority:**
```
1. Custom Responses (File) → 2. Database Responses → 3. Training Data
→ 4. BLACKLIST FILTER → 5. AI Response
```

**Matching Logic:**
- **Phrase-based**: "watch porn", "xem sex", "tìm porn" → Simple includes check
- **Word boundary**: "sex" → Regex `\bsex\b` (matches "sex" but not "sexual" or "Essex")
- **Two-tier system**: Phrases checked first, then word boundaries

**Config Structure:**
```javascript
{
  customBlacklist: ['keyword1', 'keyword2'],
  blacklistEnabled: true  // Default
}
```

**Fixed False Positives:**
- ✅ "damage control" no longer blocked (removed "dam")
- ✅ "cave exploring" no longer blocked (removed "cave")
- ✅ "sexual education" no longer blocked (word boundary for "sex")
- ✅ "Essex city" no longer blocked (word boundary for "sex")

### 📖 Documentation
- `BLACKLIST.md` - Complete guide về blacklist filter, commands, best practices

---

## [2025-10-13] - DATABASE UPDATE: TRAINING SYSTEM & PERSISTENT STORAGE

### ✨ Tính năng mới

#### 📚 PostgreSQL Database Integration
- **Training Data System**: Admin có thể train bot với Q&A pairs
- **Custom Responses Database**: Priority-based auto responses với exact/contains matching
- **Conversation Logging**: Tự động log mọi conversation để analyze
- **Per-Server Storage**: Mỗi server có training data riêng biệt
- **Auto Initialization**: Tables tự động tạo khi bot khởi động

#### 🎓 Training Commands (!train)
- `!train add <category> <question> | <answer>` - Thêm training data
- `!train list [category]` - Xem danh sách training data
- `!train delete <id>` - Xóa training data
- `!train toggle <id>` - Bật/tắt training data

#### 💬 Custom Response Commands (!response)
- `!response add <trigger> | <response> [exact]` - Thêm custom response
- `!response list` - Xem danh sách responses
- `!response delete <id>` - Xóa response
- **Exact Match vs Contains**: Flexible trigger matching
- **Priority System**: Higher priority responses checked first

#### 📊 Conversation Logs (!logs)
- `!logs [limit]` - Xem conversation history (max 50)
- Auto-logging mọi conversation (không DM)
- Track user messages, bot responses, personality mode
- Analyze user behavior và bot performance

### 🔧 Technical Implementation

**Database Schema:**
- `training_data` table: id, server_id, question, answer, category, is_active, created_by
- `custom_responses` table: id, server_id, trigger, response, is_exact_match, priority, created_by
- `conversation_logs` table: id, server_id, channel_id, user_id, user_message, bot_response, personality_mode

**Files mới:**
- `database/schema.js` - Drizzle ORM schema definitions
- `database/db.js` - PostgreSQL connection & initialization
- `database/trainingData.js` - CRUD functions cho training data
- `commands/trainingCommands.js` - Admin commands xử lý
- `DATABASE.md` - Full documentation

**Response Priority Flow:**
```
1. Custom Responses (Database) → Match found? Reply & End
2. Training Data (Database) → Match found? Reply & End  
3. Custom Keywords (File Config) → Match found? Reply & End
4. AI Response (OpenAI) → Generate & Reply
```

**Dependencies mới:**
- `drizzle-orm` - TypeScript ORM
- `@neondatabase/serverless` - Neon PostgreSQL client
- `ws` - WebSocket for serverless connection

### 📖 Documentation
- `DATABASE.md` - Complete guide về database system, commands, use cases, best practices

---

## [2025-10-13] - MEGA UPDATE: CODE ASSISTANT, ANIME & NATURAL LANGUAGE

### ✨ Tính năng mới

#### 💻 Code Assistant - Hỗ Trợ Lập Trình Tự Động
- **4 chế độ tự động:**
  - 🐛 **Debugging:** Phân tích lỗi, giải thích nguyên nhân, đưa giải pháp
  - 💻 **Coding:** Viết code hoàn chỉnh với comments và best practices
  - 📚 **Learning:** Giải thích concepts, ví dụ thực tế, bài tập
  - 🔍 **Review:** Đánh giá code, suggest improvements, tối ưu
- **50+ pattern detection** cho code assistance
- **Không cần lệnh** - bot tự động nhận diện khi user cần giúp code
- **Hỗ trợ tất cả ngôn ngữ:** JS, Python, Java, C++, Go, Rust, PHP...
- **Smart formatting:** Emoji, code blocks, step-by-step explanations

#### 🎌 Anime & Manga Search
- **Tìm kiếm từ 3 trang web Việt Nam:**
  - AnimeVietSub (https://animevietsub.show) - Anime vietsub
  - HHKungFu (https://hhkungfu.ee) - Hoạt hình Trung Quốc
  - TruyenQQ (https://truyenqq.com.vn) - Truyện tranh
- **Auto-detection:** Bot tự động nhận diện anime/manga queries
- **Commands:** `!anime`, `!manga`, `!donghua`, `!truyen`
- **Natural language:** "Lena tìm anime One Piece"

#### 🎮 Natural Language Game Triggers
- **User không cần nhớ lệnh!** Chỉ cần nói chuyện tự nhiên với bot
- Bot tự động nhận diện ý định và trigger game phù hợp
- Hỗ trợ **30+ patterns** cho 7 loại games

**Ví dụ sử dụng:**
```
❌ Trước: Phải nhớ lệnh !trivia
✅ Giờ:   "Lena ơi, chơi đố vui đi!" → Tự động chạy game!
```

#### 🧠 3 Games Tri Thức Mới (140+ câu hỏi từ internet)

**1. 10 Vạn Câu Hỏi Vì Sao** (50+ câu hỏi)
- Thiên nhiên & Khoa học
- Vũ trụ & Thiên văn
- Động vật
- Cơ thể con người
- Công nghệ & Đời sống

**2. Đố Vui Trí Tuệ** (40+ câu đố)
- Hack não
- Dân gian vần thơ
- Toán học - Logic
- Troll hài hước
- Văn hóa Việt Nam

**3. Game Đoán Từ** (50+ từ)
- 5 chủ đề: Động vật, Trái cây, Địa danh VN, Món ăn, Đồ vật
- Gợi ý thông minh
- 5 lần đoán, 2 phút giới hạn

### 🔧 Technical Implementation

**Files mới:**
- `games/whyQuestions.js` - 10 vạn câu hỏi vì sao
- `games/trivia.js` - Đố vui trí tuệ
- `games/wordGuess.js` - Game đoán từ
- `utils/naturalLanguageGames.js` - Pattern matching cho natural triggers
- `utils/codeAssistant.js` - Code assistance logic (250+ lines)
- `utils/external/animeSearch.js` - Anime/manga search
- `utils/external/webFetch.js` - Web fetching utility
- `NATURAL_LANGUAGE_GAMES.md` - Documentation games
- `CODE_ASSISTANT.md` - Documentation code assistant
- `ANIME_SEARCH.md` - Documentation anime search

**Commands mới:**
- `!why`, `!taisao`, `!visao` - 10 vạn câu hỏi vì sao
- `!trivia`, `!dovui` - Đố vui trí tuệ
- `!wordguess`, `!doantu` - Game đoán từ
- `!guess <từ>` - Đoán từ trong game
- `!giveup`, `!bocuoc` - Bỏ cuộc

**Natural language triggers:**
- "Lena ơi, chơi đố vui đi!"
- "Cho mình hỏi vì sao..."
- "Chơi đoán từ không?"
- "Hỏi quả cầu: ..."
- Và 25+ patterns khác!

### 📊 Statistics

- **140+ câu hỏi/từ** được scrape từ internet
- **50+ code assistance patterns**
- **30+ game natural language patterns**
- **12+ commands mới** (games + anime)
- **6 game files mới**
- **4 utility files mới**
- **3 documentation files mới**

---

## [2025-10-12] - PREVIOUS UPDATES

### Web Search Integration
- Google Custom Search API với auto-fallback DuckDuckGo
- Deterministic search gating với queryDetector.js
- Temperature giảm 0.9 → 0.2 cho consistency

### Cute Features
- 10 rotating status messages (5 phút/lần)
- Creator info (Thanh Tín) embedded vĩnh viễn
- !creator command

### Games Entertainment
- Truth or Dare
- Rock Paper Scissors + Squid Game variant
- Magic 8-Ball

### Integrations
- GIF search (Tenor API)
- Image analysis (GPT-4o vision)
- OpenAI integration via Replit AI Integrations

### Multi-server Support
- Per-server configuration
- Custom keywords
- Personality modes (6 modes)
- Channel restrictions

---

## 🚀 Coming Next

Potential future features:
- [ ] Voice channel support
- [ ] Web dashboard for bot config
- [ ] Multi-language support
- [ ] Persistent conversation history (database)
- [ ] More game modes
- [ ] Music player integration
- [ ] Trivia leaderboard
