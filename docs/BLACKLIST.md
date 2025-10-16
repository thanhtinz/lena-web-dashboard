# 🔒 Blacklist 18+ Filter

## Tổng quan
Tính năng **Blacklist 18+ Filter** giúp bot tự động phát hiện và từ chối nhẹ nhàng các nội dung nhạy cảm với phong cách cute, dễ thương của Lena.

## Cách hoạt động

### 🛡️ Auto Detection
- Bot tự động quét mọi tin nhắn tìm từ khóa blacklist
- Khi phát hiện nội dung nhạy cảm → Reply với cute rejection response
- Tự động react emoji: 🙈, 😳, 🥺
- Log attempt vào database (prefix [BLOCKED 18+])

### 📝 Default Blacklist
Bot có sẵn danh sách từ khóa 18+ phổ biến:

**Categories:**
- 18+ Content: sex, porn, xxx, nude, naked, hentai, nsfw, jav...
- Tiếng Việt: địt, đụ, lồn, cặc, chịch, đéo, đĩ, dâm dục...
- Violence/Gore: gore, máu me, bạo lực, giết người, tự tử...
- Drugs: ma túy, cocaine, heroin, meth...
- Gambling: cờ bạc, cá độ, đánh bạc...

**Note:** Từ "cave" (tiếng Việt slang) không có trong default để tránh false positive với "cave exploring". Admin có thể tự thêm vào custom blacklist nếu cần.

### ➕ Custom Blacklist
Admin có thể thêm từ khóa riêng cho server:
- Từ khóa theo ngữ cảnh server
- Từ cấm nội bộ
- Slang/từ viết tắt đặc biệt

## Admin Commands

### Add Keyword to Blacklist
```
!blacklist add <keyword>
```
**Ví dụ:**
```
!blacklist add badword
!blacklist add từ cấm
!blacklist add inappropriate phrase
```

**Lưu ý:**
- Keyword tự động convert về lowercase
- Matching là case-insensitive
- Hỗ trợ cả tiếng Việt và tiếng Anh

### Remove Keyword from Blacklist
```
!blacklist remove <keyword>
```
**Ví dụ:**
```
!blacklist remove badword
!blacklist remove từ cấm
```

**Lưu ý:**
- Chỉ xóa được custom keywords
- Không xóa được default blacklist (bảo vệ hệ thống)

### View Blacklist
```
!blacklist list
```
**Output:**
- **Default Blacklist**: Số lượng từ khóa (ẩn nội dung để tránh spam)
- **Custom Blacklist**: Hiển thị full danh sách từ khóa của server

### Toggle Filter On/Off
```
!blacklist toggle
```
**Status:**
- ✅ **BẬT** (default): Bot filter nội dung 18+
- ❌ **TẮT**: Bot KHÔNG filter (nguy hiểm - cẩn thận!)

**Khuyến nghị:** Luôn để FILTER BẬT để bảo vệ cộng đồng!

## Cute Rejection Responses

Khi phát hiện nội dung nhạy cảm, bot random chọn 1 trong 8 cute responses:

1. "Ư-ừm... m-mình không thể nói về chủ đề đó được... 🥺 Nó hơi... nhạy cảm quá..."
2. "À... à... chủ đề này không phù hợp lắm... 😳 M-mình ngại nói về nó..."
3. "Ehehe... m-mình không được phép trả lời câu hỏi này... 🙈 Nó hơi... ấy ấy..."
4. "Ơ... ơ... cái này mình không thể giúp được... 🥺💦 Nó không phù hợp với mình lắm..."
5. "M-mình xin lỗi nhé... 😖 Chủ đề này hơi... không phù hợp..."
6. "À... à... đ-đề này không được đâu bạn... 🙊 Mình sẽ bị... ấy mà..."
7. "Ư... ừm... m-mình thấy chủ đề này không phù hợp lắm... 😳"
8. "Ehehe... cái này... không được nói đâu... 🥺 M-mình hơi ngại..."

## Priority Order

Blacklist filter được check trong flow:

```
1. Custom Responses (File Config)
2. Database Custom Responses (Priority-based)
3. Database Training Data
4. 🔒 BLACKLIST FILTER ← Ở đây!
5. AI Response (OpenAI)
```

**Lý do:** Filter phải check SAU khi database responses để:
- Cho phép admin override với custom responses an toàn
- Training data có thể chứa educational content về topics nhạy cảm
- Chặn trước khi gọi AI (tiết kiệm token + bảo vệ)

## Configuration

### Server Config Structure
```javascript
{
  customBlacklist: ['keyword1', 'keyword2', ...],  // Array of custom keywords
  blacklistEnabled: true  // Default true, toggle with !blacklist toggle
}
```

### Enable/Disable
- **Default**: `blacklistEnabled = true` (auto enabled)
- **Toggle**: `!blacklist toggle` để bật/tắt
- Recommendation: Luôn giữ BẬT trừ khi có lý do đặc biệt

## Logging & Analytics

### Conversation Logs
Mọi blocked attempts đều được log:

```javascript
{
  serverId: '...',
  channelId: '...',
  userId: '...',
  userMessage: '[BLOCKED 18+] <nội dung bị chặn>',
  botResponse: '<cute rejection response>',
  personalityMode: 'lena'
}
```

### Use Cases for Logs
- **Admin review**: Xem ai thường vi phạm
- **Pattern detection**: Phát hiện từ khóa mới cần thêm
- **Statistics**: Đếm số lần vi phạm theo user/channel
- **Evidence**: Bằng chứng để warn/ban user

## Best Practices

### For Admins
1. **Regular Review**: Check `!logs` để phát hiện patterns mới
2. **Update Blacklist**: Thêm từ khóa khi cần thiết
3. **Community Rules**: Kết hợp với server rules rõ ràng
4. **Education**: Giải thích cho members tại sao bị block

### For Server Setup
1. **Start with Default**: Default blacklist đã cover phổ biến
2. **Add Gradually**: Chỉ thêm custom keywords khi cần
3. **Don't Over-block**: Tránh thêm từ vô tội bị false positive
4. **Test First**: Test keywords trước khi add official

### Security Tips
1. **Keep Filter ON**: Chỉ tắt khi thật sự cần thiết
2. **Admin Only**: Chỉ admin được quản lý blacklist
3. **Review Logs**: Định kỳ check logs để improve
4. **Combine Methods**: Dùng cùng Discord permissions/roles

## False Positives & Handling

### Khi có False Positive
1. **Remove keyword**: `!blacklist remove <từ>`
2. **Add exception**: Dùng database training/response với từ đó
3. **Refine keyword**: Thay bằng keyword cụ thể hơn

### Example
```
Problem: "sexuality education" bị block vì chứa "sex"

Solutions:
1. Remove "sex" (không khuyến nghị)
2. Add training data: "sexuality education" → "Educational content OK"
3. Refine: Thay "sex" bằng "sex videos", "sex chat", etc.
```

## Technical Details

### Files
- `utils/blacklistFilter.js` - Core logic, default list, cute responses
- `commands/blacklistCommands.js` - Admin commands
- `index.js` - Integration vào bot flow

### Functions
- `containsBlacklistedContent(message, customBlacklist)` - Check có vi phạm không
- `getCuteRejectionResponse()` - Random cute response
- `getDefaultBlacklist()` - Lấy default list

### Performance
- **Fast**: Simple includes() check, O(n) với n = số keywords
- **Case-insensitive**: toLowerCase() cả message và keywords
- **Early exit**: Return ngay khi tìm thấy keyword đầu tiên

## Example Scenarios

### Scenario 1: Educational Content
```
User: "Lena, giải thích về sexual reproduction trong sinh học"
Bot: "Ư-ừm... m-mình không thể nói về chủ đề đó được... 🥺"
```
**Solution:** Add training data với educational context

### Scenario 2: Movie Discussion
```
User: "Phim Sex and the City hay không?"
Bot: [BLOCKED]
```
**Solution:** "Sex and the City" là tên phim → Add custom response

### Scenario 3: Genuine 18+ Content
```
User: "Lena, tìm porn cho tao"
Bot: "Ehehe... m-mình không được phép trả lời câu hỏi này... 🙈"
[LOGGED as BLOCKED 18+]
```
**Result:** Works as intended! ✅

## Troubleshooting

### Filter không hoạt động?
1. Check `!blacklist toggle` → Đảm bảo BẬT
2. Check keyword có trong list không (`!blacklist list`)
3. Check logs xem có bị log không
4. Verify message có chứa keyword không (case-insensitive)

### Quá nhiều false positives?
1. Review custom blacklist → Remove keywords quá rộng
2. Sử dụng training data cho exceptions
3. Refine keywords thành cụ thể hơn

### Filter quá lỏng?
1. Check logs để tìm patterns bị miss
2. Add missing keywords vào custom blacklist
3. Consider thêm variations của keywords

---

**Lưu ý quan trọng:** Blacklist filter là công cụ hỗ trợ, không thay thế được moderation thủ công. Luôn kết hợp với Discord permissions, roles, và admin review để có cộng đồng an toàn nhất! 🔒✨
