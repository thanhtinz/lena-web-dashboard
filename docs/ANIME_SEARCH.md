# 🎌 Anime & Manga Search Feature

## Tổng quan

Bot giờ có thể tìm kiếm anime, manga và hoạt hình Trung Quốc từ các trang web Việt Nam uy tín!

---

## 📚 Các nguồn tìm kiếm

### 1. **AnimeVietSub** 🎥
- **URL:** https://animevietsub.show
- **Nội dung:** Anime vietsub, thuyết minh
- **Trigger keywords:** anime, tập, episode, vietsub, xem anime

### 2. **HHKungFu** 🐉
- **URL:** https://hhkungfu.ee
- **Nội dung:** Hoạt hình Trung Quốc (Donghua) 3D
- **Trigger keywords:** hoạt hình trung quốc, donghua, 3d

### 3. **TruyenQQ** 📖
- **URL:** https://truyenqq.com.vn
- **Nội dung:** Truyện tranh, manga, manhwa, manhua
- **Trigger keywords:** truyện, manga, manhwa, đọc, chapter

---

## 🎮 Cách sử dụng

### **Phương pháp 1: Dùng lệnh**
```
!anime One Piece
!manga Attack on Titan
!donghua Đấu Phá Thương Khung
!truyen Tokyo Ghoul
```

### **Phương pháp 2: Nói tự nhiên** (KHUYÊN DÙNG!)
```
Lena ơi, tìm anime One Piece
Cho mình xem anime Naruto
Tìm truyện One Punch Man
Có anime Conan không?
Đọc truyện Tokyo Ghoul
Hoạt hình Trung Quốc Vạn Giới Thần Chủ
```

---

## 🔍 Auto-Detection

Bot tự động nhận diện khi bạn hỏi về anime/manga thông qua các từ khóa:

### **Anime Keywords:**
- anime, アニメ
- tập, episode, ep
- xem, coi phim
- vietsub, thuyết minh
- one piece, naruto, dragon ball, conan...

### **Donghua Keywords:**
- hoạt hình trung quốc, hoạt hình 3D
- donghua, 动画
- đấu phá, nghịch thiên, nhất niệm...

### **Manga Keywords:**
- truyện, manga, manhwa, manhua
- đọc truyện, tìm truyện
- chap, chapter
- one punch, tokyo ghoul...

---

## 📋 Ví dụ cụ thể

### **Case 1: Tìm Anime**
```
User: Lena ơi, tìm anime One Piece tập mới nhất
Bot: 🔍 Đang tìm kiếm "One Piece tập mới nhất" trên AnimeVietSub...

🎌 KẾT QUẢ TÌM KIẾM: "One Piece"
**Anime Vietsub - AnimeVietSub:**
🔗 https://animevietsub.show/search/one+piece
📝 Preview: [Kết quả tìm kiếm từ trang web]
💡 Truy cập link để xem chi tiết và danh sách tập!
```

### **Case 2: Tìm Truyện**
```
User: Có truyện Tokyo Ghoul không?
Bot: 🔍 Đang tìm kiếm "Tokyo Ghoul" trên TruyenQQ...

🎌 KẾT QUẢ TÌM KIẾM: "Tokyo Ghoul"
**Truyện tranh - TruyenQQ:**
🔗 https://truyenqq.com.vn/tim-kiem/tokyo+ghoul
📝 Preview: [Kết quả từ TruyenQQ]
💡 Truy cập link để đọc truyện!
```

### **Case 3: Hoạt hình Trung Quốc**
```
User: Lena, tìm hoạt hình Trung Quốc Đấu Phá
Bot: 🔍 Đang tìm kiếm "Đấu Phá" trên HHKungFu...

🎌 KẾT QUẢ TÌM KIẾM: "Đấu Phá"
**Hoạt hình Trung Quốc - HHKungFu:**
🔗 https://hhkungfu.ee/search/dau+pha
💡 Truy cập link để xem!
```

### **Case 4: Tìm tự động nhiều nguồn**
```
User: Lena tìm Naruto cho mình
Bot: 🔍 Đang tìm kiếm "Naruto" trên AnimeVietSub...

[Bot tự động search cả anime vì có keyword]
```

---

## ⚙️ Cách hoạt động

1. **User gửi tin nhắn** mention bot hoặc trong allowed channel
2. **Bot phân tích** nội dung để tìm anime/manga keywords
3. **Xác định nguồn** - anime, manga, hay donghua?
4. **Fetch dữ liệu** từ các trang web qua web scraping
5. **Trả về kết quả** với links và preview nội dung

---

## 🎯 Ưu điểm

✅ **Tự động nhận diện** - Không cần nhớ lệnh  
✅ **Nhiều nguồn** - 3 trang web uy tín Việt Nam  
✅ **Thông minh** - Tự chọn nguồn phù hợp  
✅ **Nhanh chóng** - Kết quả trong vài giây  
✅ **Tiếng Việt** - Tất cả đều có tiếng Việt

---

## 🔧 Technical Details

### **Files:**
- `utils/external/animeSearch.js` - Core search logic
- `utils/external/webFetch.js` - Web fetching utility
- Integration trong `index.js`

### **Dependencies:**
- `node-fetch` - HTTP requests

### **Flow:**
```
User message → isAnimeQuery() → Extract search term
→ Determine sources → Fetch from websites
→ Format results → Reply to user
```

---

## 📝 Lưu ý

⚠️ **Quan trọng:**
- Bot chỉ tìm kiếm và cung cấp link, không stream/download nội dung
- User cần tự truy cập link để xem/đọc
- Kết quả phụ thuộc vào trang web nguồn
- Web scraping có thể gặp lỗi nếu trang web thay đổi cấu trúc

💡 **Tips:**
- Tên anime/manga càng chính xác càng tốt
- Có thể dùng tiếng Anh hoặc tiếng Việt
- Bot sẽ tự động chọn nguồn phù hợp

---

## 🚀 Future Improvements

Potential enhancements:
- [ ] Caching kết quả tìm kiếm
- [ ] Thêm nguồn tìm kiếm mới
- [ ] Rich embed với thumbnail
- [ ] Favorites/Watchlist system
- [ ] Episode tracking
- [ ] Direct streaming links (nếu có API)

---

**🎉 Enjoy watching anime & reading manga!**
