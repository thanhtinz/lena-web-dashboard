# 📚 Database & Training Data System

## Tổng quan
Bot Lena tích hợp PostgreSQL database để lưu trữ training data, custom responses và conversation logs. Admin có thể train bot bằng cách thêm Q&A pairs hoặc custom responses tự động.

## Tính năng Database

### 🎓 Training Data
Training data cho phép admin thêm các câu hỏi và câu trả lời để bot học. Bot sẽ tự động check database trước khi gọi AI.

**Structure:**
- `question`: Câu hỏi hoặc trigger pattern
- `answer`: Câu trả lời tương ứng
- `category`: Phân loại (code, general, fun, etc.)
- `isActive`: Bật/tắt (boolean)
- `serverId`: Mỗi server có training data riêng

**Use Cases:**
- Thêm kiến thức domain-specific
- Câu trả lời về server/community
- FAQ responses
- Học code snippets
- Easter eggs và jokes

### 🔄 Custom Responses
Custom responses giống keywords nhưng được lưu trong database với nhiều tùy chọn hơn.

**Structure:**
- `trigger`: Keyword trigger
- `response`: Câu trả lời
- `isExactMatch`: True = exact match, False = contains
- `priority`: Ưu tiên cao hơn được check trước (INTEGER, default 0)
- `serverId`: Mỗi server có responses riêng

**Note:** Priority càng cao càng được check trước. Responses cùng priority thì FIFO.

**Priority Order:**
1. Custom Responses (database) - Check theo priority
2. Training Data (database) - Check theo relevance
3. Custom Keywords (file config) - Legacy system
4. AI Response - Fallback

### 📊 Conversation Logs
Tự động log mọi conversation để admin có thể:
- Review lịch sử trò chuyện
- Analyze user behavior
- Debug bot responses
- Train bot tốt hơn từ real conversations

**Structure:**
- `serverId`, `channelId`, `userId`
- `userMessage`, `botResponse`
- `personalityMode`
- `timestamp`

## Admin Commands

### Training Data Commands

#### Add Training Data
```
!train add <category> <question> | <answer>
```
**Ví dụ:**
```
!train add code Closure là gì? | Closure là function có thể truy cập biến ngoài scope của nó
!train add fun Bot tên gì? | Tên mình là Lena! Rất vui được làm quen với bạn! 🌸
!train add server Giờ raid? | Giờ raid của server là 20:00 hàng ngày nhé!
```

#### List Training Data
```
!train list [category]
```
**Ví dụ:**
```
!train list          # Xem tất cả
!train list code     # Chỉ xem category code
!train list fun      # Chỉ xem category fun
```

#### Delete Training Data
```
!train delete <id>
```
**Ví dụ:**
```
!train delete 5      # Xóa training data #5
```

#### Toggle Training Data (Bật/Tắt)
```
!train toggle <id>
```
**Ví dụ:**
```
!train toggle 3      # Bật/tắt training data #3
```

### Custom Response Commands

#### Add Custom Response
```
!response add <trigger> | <response> [exact] [priority:N]
```
**Ví dụ:**
```
!response add hello | Xin chào! Tôi là Lena 🌸
!response add bye | Tạm biệt! Hẹn gặp lại bạn nhé! 💕 priority:5
!response add lmao | haha đúng rồi 😂
!response add "chào admin" | Chào sếp! exact priority:10    # Exact match with high priority
```

**Note:** 
- Không có `exact`: Trigger sẽ match nếu message **chứa** trigger
- Có `exact`: Trigger chỉ match nếu message **giống hệt** trigger
- `priority:N`: Set priority (số càng cao càng ưu tiên). Default = 0

#### List Custom Responses
```
!response list
```

#### Delete Custom Response
```
!response delete <id>
```
**Ví dụ:**
```
!response delete 2
```

### Conversation Logs

#### View Logs
```
!logs [limit]
```
**Ví dụ:**
```
!logs           # 20 logs gần nhất
!logs 50        # 50 logs gần nhất (max 50)
```

## Database Schema

### Table: training_data
```sql
CREATE TABLE training_data (
  id SERIAL PRIMARY KEY,
  server_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: custom_responses
```sql
CREATE TABLE custom_responses (
  id SERIAL PRIMARY KEY,
  server_id TEXT NOT NULL,
  trigger TEXT NOT NULL,
  response TEXT NOT NULL,
  is_exact_match BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: conversation_logs
```sql
CREATE TABLE conversation_logs (
  id SERIAL PRIMARY KEY,
  server_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  personality_mode TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Response Priority Flow

```
User Message
    ↓
1. Check Custom Responses (Database)
    → Match found? → Reply & End
    ↓
2. Check Training Data (Database)
    → Match found? → Reply & End
    ↓
3. Check Custom Keywords (File Config)
    → Match found? → Reply & End
    ↓
4. Call OpenAI API
    → Generate Response → Reply
    ↓
5. Log to Database (if not DM)
```

## Best Practices

### Training Data Tips
1. **Be Specific**: Câu hỏi càng cụ thể càng tốt
2. **Use Categories**: Phân loại giúp quản lý dễ dàng
3. **Keep Updated**: Toggle off data cũ thay vì xóa
4. **Test Responses**: Test trước khi enable cho users

### Custom Response Tips
1. **Use Exact Match** cho commands hoặc phrases cụ thể
2. **Use Contains Match** cho keywords chung chung
3. **Set Priority** cao cho responses quan trọng
4. **Keep It Simple**: Responses ngắn gọn, dễ hiểu

### Security Notes
- ⚠️ Chỉ admin mới có thể thêm/sửa/xóa training data
- ⚠️ Training data riêng biệt theo server (không share)
- ⚠️ Logs được lưu tự động (không thể tắt)
- ⚠️ Database chỉ lưu trong development (không production)

## Use Cases & Examples

### Case 1: Server-specific FAQ
```
!train add server Discord này về gì? | Server này dành cho cộng đồng game Genshin Impact Việt Nam!
!train add server Cách vào clan? | Liên hệ admin @Admin để được mời vào clan nhé!
```

### Case 2: Code Learning
```
!train add code Promise là gì? | Promise là object đại diện cho việc hoàn thành (hoặc thất bại) của một async operation
!train add code Async/await khác gì Promise? | Async/await là syntactic sugar giúp code Promise dễ đọc hơn, giống synchronous code
```

### Case 3: Fun Responses
```
!response add uwu | UwU 🥺
!response add ngủ chưa | Mình chưa ngủ đâu! Bạn thì sao? 😴
!response add yêu Lena | M-mình cũng... ehehe 🥺💕
```

### Case 4: Auto Greetings
```
!response add chào buổi sáng | Chào buổi sáng! Ngủ ngon không? ☀️
!response add good night | Ngủ ngon nhé! Chúc giấc mơ đẹp! 🌙
```

## Troubleshooting

### Response không hoạt động?
1. Check `!train list` hoặc `!response list` xem có tồn tại không
2. Verify `is_active = true` cho training data
3. Check priority order (custom response > training data > keywords)
4. Test với exact trigger text

### Database error?
1. Check DATABASE_URL environment variable
2. Bot sẽ tự động tạo tables nếu chưa có
3. Review logs với `!logs` command
4. Contact bot creator nếu vẫn lỗi

## Environment Variables
- `DATABASE_URL`: Auto-provisioned bởi Replit PostgreSQL
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Auto-set

## Technical Details
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Connection**: @neondatabase/serverless with WebSocket
- **Auto Init**: Tables tạo tự động khi bot start
- **Indexes**: Optimized cho server_id lookups

---

**Lưu ý:** Database này chỉ dùng cho development. Production database cần setup riêng!
