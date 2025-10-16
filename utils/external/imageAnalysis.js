async function analyzeImage(openai, imageUrl, question = null) {
  try {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          },
          {
            type: 'text',
            text: question || 'Hãy mô tả chi tiết hình ảnh này bằng tiếng Việt.'
          }
        ]
      }
    ];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

async function handleImageAnalysis(message, openai) {
  const attachments = message.attachments;
  const question = message.content.replace(/!analyze|!image/gi, '').trim();
  
  if (attachments.size === 0) {
    return message.reply('💡 Hãy đính kèm một hình ảnh và dùng lệnh `!analyze` hoặc `!image [câu hỏi]`\n\nVí dụ:\n• `!analyze` - Mô tả hình ảnh\n• `!image Đây là con gì?` - Hỏi về hình ảnh');
  }
  
  const imageAttachment = Array.from(attachments.values()).find(att => 
    att.contentType && att.contentType.startsWith('image/')
  );
  
  if (!imageAttachment) {
    return message.reply('❌ Vui lòng đính kèm một hình ảnh hợp lệ!');
  }
  
  try {
    await message.channel.sendTyping();
    
    const analysis = await analyzeImage(openai, imageAttachment.url, question);
    
    await message.reply(`🔍 **Phân tích hình ảnh:**\n\n${analysis}`);
  } catch (error) {
    console.error('Error in image analysis:', error);
    await message.reply('❌ Có lỗi khi phân tích hình ảnh. Vui lòng thử lại! 🥺');
  }
}

module.exports = {
  analyzeImage,
  handleImageAnalysis
};
