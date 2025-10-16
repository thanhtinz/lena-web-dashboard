# 🎵 VIDEO & MUSIC SEARCH - TÌM NHẠC & VIDEO

## 🌟 Tổng quan

Lena có thể tìm nhạc và video từ YouTube & TikTok khi bạn yêu cầu!

- ✅ **Tự động nhận diện** - Không cần lệnh đặc biệt
- ✅ **YouTube Search** - Tìm video/nhạc với YouTube Data API v3
- ✅ **TikTok Search** - Tìm video TikTok
- ✅ **Smart Detection** - Nhận diện platform và content type
- ✅ **Cute Responses** - Trả lời với phong cách Lena

## 🚀 Cách sử dụng

### Không cần lệnh!

Chỉ cần nói tự nhiên với Lena:

#### 🎵 Tìm nhạc YouTube
```
"Lena ơi, tìm bài hát See You Again"
"Tìm giúp mình nhạc Sơn Tùng MTP"
"Cho mình nghe bài Nơi Này Có Anh"
"Muốn nghe nhạc trẻ trending"
```

#### 🎬 Tìm video YouTube
```
"Tìm video hướng dẫn làm bánh"
"Lena, tìm clip cười vui nhộn"
"Cho mình xem video minecraft"
"Tìm giúp em tutorial React"
```

#### 📱 Tìm TikTok
```
"Tìm TikTok về cách makeup"
"Tìm clip TikTok trending"
"TikTok dance challenge 2025"
"Tìm video TikTok hài hước"
```

## 🎯 Detection Patterns

Bot tự động nhận diện qua 15+ patterns:

### Priority 9-10 (Specific requests)
- `tìm bài hát...`, `tìm video...`
- `nghe bài...`, `xem video...`
- `cho mình nghe/xem...`

### Priority 8 (Platform-specific)
- `tìm ... youtube/tiktok`
- `link youtube/tiktok ...`

### Priority 7-8 (Natural requests)
- `có link bài/video ...`
- `gửi ... bài hát/video`
- `muốn nghe/xem ...`

### Priority 6-7 (Trending style)
- `tìm ntn bài...`
- `có bài ... không?`
- `recommend bài/video`

## 📊 Platform Detection

Bot tự động phát hiện platform từ keywords:

### YouTube (Default)
- Keywords: `youtube`, `yt`
- Nếu không chỉ định → Default YouTube

### TikTok
- Keywords: `tiktok`, `tt`
- Auto redirect đến TikTok search

## 🎨 Response Format

### YouTube Results (Top 3)
```
🎵 Ư-ừm... mình tìm thấy rồi nè! 

🥇 **See You Again - Wiz Khalifa ft. Charlie Puth**
   👤 Atlantic Records
   🔗 https://youtube.com/watch?v=...

🥈 **See You Again (Cover) - J.Fla**
   👤 J.Fla
   🔗 https://youtube.com/watch?v=...

🥉 **See You Again (Lyrics)**
   👤 Music Lyrics
   🔗 https://youtube.com/watch?v=...

Hy vọng có bài bạn thích nha! 🥺💕
```

### TikTok Results
```
🎬 À... à... đây nè bạn! 

**Tìm "dance challenge" trên TikTok**
🔗 https://www.tiktok.com/search?q=dance+challenge

Click để xem kết quả tìm kiếm trên TikTok 💕
```

## 🔧 Technical Implementation

### Files
- `utils/videoSearch.js` - Core search logic, detection, formatting

### Detection Function
```javascript
isVideoSearchRequest(message)
// Returns: true/false (threshold: priority >= 6)
```

### Platform Detection
```javascript
detectPlatform(message)
// Returns: 'youtube' | 'tiktok' (default: 'youtube')
```

### Content Type Detection
```javascript
detectContentType(message)
// Returns: 'music' | 'video' (default: 'video')
```

### Search Functions

**YouTube:**
```javascript
searchYouTube(query, apiKey)
// Returns: { success, results, platform }
// Results: Top 3 videos with title, channel, url, thumbnail
```

**TikTok:**
```javascript
searchTikTok(query)
// Returns: { success, results, platform, isSearchUrl }
// Results: TikTok search URL (no official API)
```

## ⚙️ Configuration

### YouTube API Key (Optional)

Nếu muốn dùng YouTube search, cần API key:

1. **Lấy API Key:**
   - Vào [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo project mới hoặc chọn existing
   - Enable **YouTube Data API v3**
   - Tạo credentials → API key

2. **Add vào Replit Secrets:**
   ```
   Key: YOUTUBE_API_KEY
   Value: AIza...
   ```

3. **Bot tự động dùng:**
   - Nếu có API key → YouTube search hoạt động
   - Nếu không có → Hiện message cute giải thích

### TikTok (No API Required)

TikTok search không cần API key, dùng search URL trực tiếp.

## 📈 Priority Flow

```
Anime/Manga Search (Highest)
   ↓
VIDEO/MUSIC SEARCH 🎵
   ↓
Natural Language Games
   ↓
Custom Responses
   ↓
Database Responses
   ↓
... (rest of flow)
```

**Lưu ý:** Video search có priority cao, chạy sau anime search nhưng trước games.

## 🎯 Examples

### Example 1: YouTube Music
```
User: "Lena ơi, tìm bài Có Chắc Yêu Là Đây của Sơn Tùng"

Bot: 🎵 Ư-ừm... mình tìm thấy rồi nè! 

     🥇 **Có Chắc Yêu Là Đây - Sơn Tùng M-TP | Official MV**
        👤 Sơn Tùng M-TP Official
        🔗 https://youtube.com/watch?v=...
     
     🥈 **Có Chắc Yêu Là Đây (Cover) - Hương Ly**
        👤 Hương Ly Official
        🔗 https://youtube.com/watch?v=...
     
     🥉 **Có Chắc Yêu Là Đây - Karaoke Beat**
        👤 Karaoke Vietnam
        🔗 https://youtube.com/watch?v=...
     
     Hy vọng có bài bạn thích nha! 🥺💕

React: 🎵 🎬 ✨
```

### Example 2: YouTube Video
```
User: "Tìm video hướng dẫn làm bánh bông lan"

Bot: 🎬 À... à... đây nè bạn! 

     🥇 **Cách làm bánh bông lan đơn giản tại nhà**
        👤 Hướng Nghiệp Á Âu
        🔗 https://youtube.com/watch?v=...
     
     ...
     
     Nghe/xem vui vẻ nhé! 🌸✨

React: 🎵 🎬 ✨
```

### Example 3: TikTok
```
User: "Tìm TikTok dance challenge trending"

Bot: ✨ Ehehe~ mình tìm được những cái này! 

     **Tìm "dance challenge trending" trên TikTok**
     🔗 https://www.tiktok.com/search?q=dance+challenge+trending
     
     Click để xem kết quả tìm kiếm trên TikTok 💕

React: 🎵 🎬 ✨
```

### Example 4: No API Key
```
User: "Lena, tìm bài See You Again"

Bot: Ơ... ơ... m-mình chưa có YouTube API key nên không tìm được... 🥺
     Bạn có thể tự search trên YouTube nhé! 🌸

React: 🎵 🎬 ✨
```

## ⚠️ Limitations

### YouTube
- ❌ Cần API key (có quota limit: 10,000 units/day)
- ❌ Không download được video
- ✅ Chỉ search và trả link

### TikTok
- ❌ Không có official API
- ❌ Chỉ trả search URL
- ✅ User phải tự click vào xem

## 💡 Tips & Best Practices

### Cho users:
- ✅ **Nói rõ platform**: "YouTube" hoặc "TikTok"
- ✅ **Mô tả rõ ràng**: Tên bài, ca sĩ, chủ đề
- ✅ **Dùng từ khóa**: "tìm", "nghe", "xem"
- ❌ **Không yêu cầu download**: Bot chỉ tìm link

### Cho admins:
- Setup YouTube API key để có trải nghiệm tốt nhất
- Monitor API quota usage
- Có thể tắt feature nếu cần (comment code)

## 🔒 Privacy & Security

- ✅ Không lưu search history
- ✅ Không download content
- ✅ Chỉ trả public links
- ✅ API key được bảo mật trong Replit Secrets

## 🌟 Ưu điểm

✨ **Tự động thông minh** - Không cần nhớ lệnh
🎵 **Multi-platform** - YouTube & TikTok
😊 **Phong cách cute** - Lena style responses
🚀 **Nhanh chóng** - Kết quả trong vài giây
🎯 **Chính xác** - Top 3 results relevant

---

**Nghe nhạc, xem video vui vẻ cùng Lena! 🎵✨**

Made with 💕 by Thanh Tín
