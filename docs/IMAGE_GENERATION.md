# Về tính năng tạo ảnh

## ⚠️ Lưu ý quan trọng

**Replit AI Integrations hiện tại KHÔNG hỗ trợ image generation API của OpenAI (DALL-E).**

Các API được hỗ trợ:
- ✅ chat-completions (đang sử dụng)
- ✅ responses

Các API KHÔNG được hỗ trợ:
- ❌ image generation (DALL-E)
- ❌ embeddings
- ❌ audio (speech, transcription)
- ❌ fine-tuning

## Giải pháp thay thế

Nếu bạn muốn thêm tính năng tạo ảnh, bạn có các lựa chọn sau:

### 1. Sử dụng OpenAI API riêng
- Đăng ký API key riêng tại [OpenAI Platform](https://platform.openai.com/)
- Thêm API key vào Secrets với tên `OPENAI_API_KEY`
- Chi phí sẽ được tính trực tiếp từ tài khoản OpenAI của bạn

### 2. Sử dụng dịch vụ tạo ảnh miễn phí khác
- **Unsplash API** - Ảnh stock miễn phí
- **Pexels API** - Ảnh stock miễn phí
- **Stable Diffusion** - AI tạo ảnh open source

### 3. Tích hợp sau khi Replit hỗ trợ
Theo dõi cập nhật từ Replit về việc mở rộng hỗ trợ API.

## Code mẫu (nếu có OpenAI API key riêng)

```javascript
// Thêm vào index.js nếu có OPENAI_API_KEY riêng
const openaiForImages = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API key riêng, không dùng AI Integrations
});

// Command tạo ảnh
async function handleGenerateImage(message, prompt) {
  try {
    const response = await openaiForImages.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    
    const imageUrl = response.data[0].url;
    await message.reply({
      content: `Đây là ảnh bạn yêu cầu! ✨`,
      files: [imageUrl]
    });
  } catch (error) {
    await message.reply('❌ Không thể tạo ảnh. Vui lòng thử lại sau!');
  }
}
```

## Kết luận

Hiện tại bot **không hỗ trợ** tính năng tạo ảnh do giới hạn của Replit AI Integrations. Nếu cần tính năng này, vui lòng sử dụng một trong các giải pháp thay thế ở trên.
