# 📰 VIETNAM NEWS SYSTEM - HỆ THỐNG TIN TỨC VIỆT NAM

## 🌟 Tổng quan

Lena có thể đọc tin tức real-time từ các trang báo lớn uy tín của Việt Nam! Tin tức tự động cập nhật mỗi ngày qua RSS feeds.

- ✅ **5 trang báo lớn**: VnExpress, Tuổi Trẻ, Thanh Niên, Dân Trí, VietnamNet
- ✅ **Tự động nhận diện** - Không cần lệnh đặc biệt
- ✅ **Real-time Updates** - RSS feeds tự động cập nhật
- ✅ **8 danh mục** - Thế giới, Kinh tế, Giải trí, Thể thao, Công nghệ, Khoa học, Sức khỏe, Giáo dục
- ✅ **Cute Responses** - Trả lời với phong cách Lena

## 🚀 Cách sử dụng

### Không cần lệnh!

Chỉ cần nói tự nhiên với Lena:

#### 📰 Xem tin tức chung
```
"Lena ơi, cho mình xem tin tức"
"Đọc báo hôm nay đi"
"Có tin gì mới không?"
"Tin tức mới nhất"
"Xem tin hot"
```

#### 📂 Xem theo danh mục
```
"Tin tức thế giới"
"Báo kinh tế hôm nay"
"Cho mình xem tin công nghệ"
"Đọc báo thể thao"
"Tin giải trí mới"
```

#### 🏢 Xem theo nguồn
```
"VnExpress mới"
"Tuổi Trẻ hôm nay"
"Thanh Niên có tin gì"
"Dân Trí mới nhất"
"VietnamNet tin tức"
```

#### 🎯 Kết hợp nguồn + danh mục
```
"VnExpress tin công nghệ"
"Tuổi Trẻ báo thể thao"
"Thanh Niên tin kinh tế"
```

## 🎯 Detection Patterns

Bot tự động nhận diện qua 18+ patterns:

### Priority 10 (Specific requests)
- `cho mình/tôi/em xem/đọc tin tức`
- `cho mình/tôi/em xem/đọc báo`
- `muốn xem/đọc tin tức`

### Priority 9 (Direct commands)
- `xem/đọc tin tức`
- `tin tức mới/hôm nay`
- `báo mới/hôm nay`

### Priority 8 (With category/source)
- `tin tức [danh mục]`
- `báo [danh mục]`
- `[trang báo] mới/hôm nay`

### Priority 7 (General inquiry)
- `có tin gì mới`
- `tin hot hôm nay`

### Priority 6 (Casual)
- `xem tin`
- `đọc báo`
- `tin gì không`

## 📊 Nguồn tin (5 trang báo)

### 1. **VnExpress** (Mặc định)
- URL: vnexpress.net
- Keywords: `vnexpress`, `vne`
- 8 danh mục đầy đủ

### 2. **Tuổi Trẻ**
- URL: tuoitre.vn
- Keywords: `tuoitre`, `tuổi trẻ`
- 5 danh mục chính

### 3. **Thanh Niên**
- URL: thanhnien.vn
- Keywords: `thanhnien`, `thanh niên`
- 5 danh mục chính

### 4. **Dân Trí**
- URL: dantri.com.vn
- Keywords: `dantri`, `dân trí`
- 7 danh mục

### 5. **VietnamNet**
- URL: vietnamnet.vn
- Keywords: `vietnamnet`, `vnn`
- 7 danh mục

## 📂 Danh mục tin (8 categories)

1. **Thế Giới** - Tin quốc tế
2. **Kinh Tế** - Kinh doanh, tài chính
3. **Giải Trí** - Showbiz, văn hóa
4. **Thể Thao** - Bóng đá, thể thao
5. **Công Nghệ** - Technology, IT
6. **Khoa Học** - Khám phá, nghiên cứu
7. **Sức Khỏe** - Y tế, sống khỏe
8. **Giáo Dục** - Học tập, thi cử

## 🎨 Response Format

### Standard Response (Top 5 tin)
```
📰 Ư-ừm... đây là tin tức mới nè!

**📰 VnExpress - Công Nghệ**

🥇 **Apple ra mắt iPhone 16 với AI mới**
   Apple công bố iPhone 16 với chip AI thế hệ mới, 
   camera nâng cấp...
   ⏰ 2 giờ trước
   🔗 https://vnexpress.net/...

🥈 **ChatGPT cập nhật tính năng mới**
   OpenAI giới thiệu ChatGPT-5 với khả năng...
   ⏰ 5 giờ trước
   🔗 https://vnexpress.net/...

🥉 **Google phát triển chip lượng tử**
   Google đạt bước tiến mới trong nghiên cứu...
   ⏰ 1 ngày trước
   🔗 https://vnexpress.net/...

4️⃣ **Meta ra mắt kính AR mới**
   ...
   
5️⃣ **Tesla công bố robot nhân hình**
   ...

Đọc báo vui vẻ nha! 📰✨
```

### Time Display
- "Vừa xong" - < 1 phút
- "X phút trước" - < 1 giờ
- "X giờ trước" - < 1 ngày
- "X ngày trước" - < 7 ngày
- "DD/MM/YYYY" - > 7 ngày

## 🔧 Technical Implementation

### Files
- `utils/newsDetector.js` - Detection patterns, categories, sources
- `utils/external/newsFetcher.js` - RSS fetching, parsing, formatting
- `NEWS.md` - Complete documentation

### Detection Function
```javascript
isNewsRequest(message)
// Returns: { isNews: true/false, priority: 0-10 }
// Threshold: priority >= 6
```

### Category Detection
```javascript
detectCategory(message)
// Returns: { category: 'the-gioi', name: 'Thế Giới' } or null
```

### Source Detection
```javascript
detectSource(message)
// Returns: source object or null
```

### RSS Fetching
```javascript
fetchNews(rssUrl, limit)
// Returns: { success, source, items: [...] }
// Items: title, link, description, pubDate, thumbnail
```

### Formatting
```javascript
formatNewsResults(result, sourceName, categoryName)
// Returns: formatted message string with cute responses
```

## ⚙️ Configuration

### RSS Parser
- Package: `rss-parser`
- Timeout: 10 seconds
- User-Agent: Mozilla/5.0

### Default Settings
- Default Source: VnExpress (most popular)
- Default Category: Tin mới nhất
- Items per request: 5 tin
- Description max: 200 characters

### No API Key Required!
- ✅ Sử dụng RSS feeds công khai
- ✅ Không cần đăng ký
- ✅ Miễn phí 100%
- ✅ Auto update

## 📈 Priority Flow

```
Anime/Manga Search (Highest)
   ↓
Video/Music Search
   ↓
NEWS SYSTEM 📰 (NEW)
   ↓
Natural Language Games
   ↓
Custom Responses → Database → ...
```

**Lưu ý:** News có priority cao hơn games nhưng thấp hơn video search.

## 🎯 Examples

### Example 1: Tin tức chung
```
User: "Lena ơi, cho mình xem tin tức"

Bot: 📰 Ư-ừm... đây là tin tức mới nè!

     **📰 VnExpress**
     
     🥇 **Chính phủ công bố gói hỗ trợ mới**
        Chính phủ thông qua gói hỗ trợ 50.000 tỷ...
        ⏰ 1 giờ trước
        🔗 https://vnexpress.net/...
     
     🥈 **VN thắng 3-0 trước Thái Lan**
        ...
     
     🥉 **Giá vàng tăng cao kỷ lục**
        ...
     
     Đọc báo vui vẻ nha! 📰✨

React: 📰 📱 ✨
```

### Example 2: Tin theo danh mục
```
User: "Tin công nghệ mới gì không?"

Bot: 📰 À... à... mình tìm được tin tức rồi!

     **📰 VnExpress - Công Nghệ**
     
     🥇 **Apple ra mắt iPhone 16**
        ...
     
     🥈 **ChatGPT-5 sắp ra mắt**
        ...
     
     Cập nhật tin tức mỗi ngày nha! 📰🌸

React: 📰 📱 ✨
```

### Example 3: Tin theo nguồn
```
User: "Tuổi Trẻ hôm nay có gì?"

Bot: 📰 Ehehe~ đây là báo mới nhất nha!

     **📰 Tuổi Trẻ**
     
     🥇 **TPHCM khởi công tuyến metro số 2**
        ...
     
     🥈 **Học sinh đạt HCV Olympic Toán**
        ...
     
     Hy vọng có tin bạn thích! 🥺💕

React: 📰 📱 ✨
```

### Example 4: Nguồn + Danh mục
```
User: "Thanh Niên tin thể thao"

Bot: 📰 Tin tức hot đây bạn ơi!

     **📰 Thanh Niên - Thể Thao**
     
     🥇 **Công Phượng lập hat-trick**
        ...
     
     🥈 **U23 Việt Nam vào bán kết**
        ...
     
     Nhớ đọc kỹ nhé! 😊✨

React: 📰 📱 ✨
```

### Example 5: Error (network issue)
```
User: "Cho mình xem tin"

Bot: Ư-ừm... không lấy được tin tức... 🥺
     Bạn thử lại sau nhé!

React: 📰 📱 ✨
```

## ⚠️ Limitations

### RSS Feeds
- ❌ Phụ thuộc vào RSS của trang báo
- ❌ Nếu RSS down → không fetch được
- ✅ Tuy nhiên RSS rất ổn định, ít down

### Content
- ❌ Chỉ có title, description, link
- ❌ Không có full article content
- ✅ User click link để đọc full

### Real-time
- ✅ RSS cập nhật 5-15 phút/lần
- ✅ Đủ real-time cho tin tức thường
- ⏰ Breaking news có thể delay vài phút

### Categories
- ⚠️ Mỗi trang báo có danh mục khác nhau
- ⚠️ Một số danh mục không có ở tất cả nguồn
- ✅ VnExpress có đầy đủ nhất (8 danh mục)

## 💡 Tips & Best Practices

### Cho users:
- ✅ **Nói rõ nguồn** nếu muốn báo cụ thể
- ✅ **Chỉ định danh mục** để lọc tin chính xác
- ✅ **Hỏi ngắn gọn** - "xem tin", "đọc báo"
- ❌ **Không yêu cầu full article** - Bot chỉ cho link

### Cho admins:
- Có thể thêm nguồn tin khác bằng cách:
  1. Thêm vào `newsSources` trong `newsDetector.js`
  2. Cung cấp RSS URL
  3. Restart bot
- Monitor RSS availability (rare down)
- Có thể adjust items limit (default 5)

## 🔒 Privacy & Security

- ✅ **Public RSS**: Chỉ dùng RSS công khai
- ✅ **No Personal Data**: Không lưu preferences
- ✅ **No Tracking**: Không track user behavior
- ✅ **Direct Links**: User click để xem trên website chính

## 🌟 Ưu điểm

✨ **Real-time** - RSS tự động cập nhật  
📰 **5 nguồn uy tín** - VnExpress, Tuổi Trẻ, Thanh Niên, Dân Trí, VietnamNet  
🎯 **8 danh mục** - Đa dạng chủ đề  
😊 **Tự nhiên** - Không cần nhớ lệnh  
🚀 **Nhanh** - RSS parsing nhanh  
💯 **Miễn phí** - Không cần API key  
🔄 **Auto update** - Tin luôn mới  

## 🔮 Future Enhancements (Optional)

**Potential features:**
- [ ] Lưu preferences tin tức của user
- [ ] Push notification tin hot
- [ ] Search tin theo keyword
- [ ] Thêm nguồn báo (24h, Zing News, etc.)
- [ ] Embed với thumbnail
- [ ] Category filters trong DM
- [ ] Tin tức trending (most read)
- [ ] Export tin to PDF

---

**Đọc tin tức Việt Nam mỗi ngày cùng Lena! 📰✨**

Made with 💕 by Thanh Tín
