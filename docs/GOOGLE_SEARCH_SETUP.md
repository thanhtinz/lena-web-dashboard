# 🔍 Hướng dẫn Setup Google Custom Search API

Bot cần 2 thông tin để search được trên Google:
1. **GOOGLE_API_KEY** - API key từ Google Cloud
2. **GOOGLE_SEARCH_ENGINE_ID** - Search Engine ID (cx)

## 📝 Các bước Setup

### Bước 1: Tạo Google API Key

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới (hoặc chọn project có sẵn)
3. Bật **Custom Search API**:
   - Vào menu → "APIs & Services" → "Library"
   - Tìm "Custom Search API"
   - Click "Enable"
4. Tạo API key:
   - Vào "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy API key này

### Bước 2: Tạo Custom Search Engine

1. Truy cập [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" hoặc "Create a new search engine"
3. Điền thông tin:
   - **Search engine name**: Đặt tên gì cũng được (VD: "Discord Bot Search")
   - **What to search**: Chọn "Search the entire web"
   - **Search settings**: 
     - ✅ Bật "Search the entire web"
     - ✅ Bật "Image search" (tùy chọn)
     - ✅ Bật "Safe search" (khuyến nghị)
4. Click "Create"
5. Sau khi tạo xong:
   - Click "Customize"
   - Tìm phần **"Search engine ID"** hoặc **"cx"**
   - Copy chuỗi ID này (thường có dạng: `017576662512468239146:omuauf_lfve`)

### Bước 3: Thêm vào Replit Secrets

1. Trong Replit, mở **Tools** → **Secrets**
2. Thêm 2 secrets:

```
Key: GOOGLE_API_KEY
Value: AIzaSy... (API key bạn vừa tạo)

Key: GOOGLE_SEARCH_ENGINE_ID  
Value: 017576... (Search Engine ID bạn vừa tạo)
```

3. Click "Save"
4. Restart bot: `!reset` hoặc restart workflow

## ✅ Kiểm tra Setup

Sau khi setup xong, test với câu hỏi:
```
Lena, thời tiết Hà Nội hôm nay
```

### Nếu thành công, logs sẽ hiển thị:
```
🔍 Detected real-time query, forcing search...
🔎 Search query: "Hanoi weather today"
✅ Search result: 🔍 **Kết quả tìm kiếm từ Google:**...
```

### Nếu lỗi:
```
Google Search API error: ...
🔄 Fallback to DuckDuckGo...
```

Bot sẽ tự động dùng DuckDuckGo (nhưng kết quả hạn chế hơn).

## ❗ Lưu ý quan trọng

1. **Search Engine ID phải đúng format**:
   - Đúng: `017576662512468239146:omuauf_lfve`
   - Sai: `https://cse.google.com/cse?cx=...` (không copy URL!)

2. **API Key phải enable Custom Search API**:
   - Vào Google Cloud Console
   - Kiểm tra "APIs & Services" → "Enabled APIs"
   - Đảm bảo "Custom Search API" đã được bật

3. **Quota miễn phí**:
   - Google cho phép **100 queries/ngày** miễn phí
   - Nếu vượt quota, bot tự động fallback sang DuckDuckGo

## 🔄 Fallback System

Bot có 2-tier fallback:

1. **Tier 1 - Google Custom Search** (ưu tiên):
   - Kết quả chính xác, realtime
   - Có link dẫn chứng cụ thể
   - Giới hạn 100 queries/ngày miễn phí

2. **Tier 2 - DuckDuckGo API** (fallback):
   - Kết quả hạn chế hơn
   - Không giới hạn queries
   - Tự động dùng khi Google lỗi

## 🆘 Troubleshooting

### Lỗi: "Requested entity was not found"
- **Nguyên nhân**: Search Engine ID sai
- **Giải pháp**: Kiểm tra lại cx ID, đảm bảo không copy nhầm URL

### Lỗi: "API key not valid"  
- **Nguyên nhân**: API key sai hoặc chưa enable Custom Search API
- **Giải pháp**: Tạo lại API key và enable Custom Search API

### Lỗi: "Quota exceeded"
- **Nguyên nhân**: Đã dùng hết 100 queries miễn phí/ngày
- **Giải pháp**: Chờ ngày hôm sau hoặc upgrade lên paid plan

### Bot vẫn dùng kiến thức cũ 2023
- **Nguyên nhân**: Câu hỏi không trigger search detector
- **Giải pháp**: Thêm từ khóa "hiện tại", "bây giờ", "2024", "2025", v.v.

## 📚 Tài liệu tham khảo

- [Google Custom Search API Docs](https://developers.google.com/custom-search/v1/overview)
- [Programmable Search Engine](https://programmablesearchengine.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
