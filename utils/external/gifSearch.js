const https = require('https');

const TENOR_API_KEY = process.env.TENOR_API_KEY;

function searchGif(query, limit = 1) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://tenor.googleapis.com/v2/search?q=${encodedQuery}&key=${TENOR_API_KEY}&client_key=discord_bot&limit=${limit}&media_filter=gif`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            const gifs = json.results.map(result => ({
              url: result.media_formats.gif.url,
              title: result.content_description || query
            }));
            resolve(gifs);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function sendGif(message, query) {
  if (!TENOR_API_KEY) {
    return message.reply('❌ Tenor API key chưa được cấu hình. Vui lòng thêm `TENOR_API_KEY` vào Secrets!');
  }
  
  if (!query || query.trim() === '') {
    return message.reply('💡 Sử dụng: `!gif <từ khóa>`\n\nVí dụ: `!gif funny cat`');
  }
  
  try {
    const gifs = await searchGif(query, 1);
    
    if (gifs.length === 0) {
      return message.reply(`😢 Không tìm thấy GIF nào cho "${query}". Thử từ khóa khác nhé!`);
    }
    
    const gif = gifs[0];
    await message.reply({
      content: `🎬 **${gif.title}**`,
      files: [gif.url]
    });
  } catch (error) {
    console.error('Error fetching GIF:', error);
    await message.reply('❌ Có lỗi khi tìm GIF. Thử lại sau nhé! 🥺');
  }
}

async function randomGif(message) {
  if (!TENOR_API_KEY) {
    return message.reply('❌ Tenor API key chưa được cấu hình. Vui lòng thêm `TENOR_API_KEY` vào Secrets!');
  }
  
  const randomQueries = ['funny', 'cute', 'happy', 'wow', 'dance', 'celebrate', 'laugh', 'excited', 'cool', 'awesome'];
  const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
  
  try {
    const gifs = await searchGif(randomQuery, 10);
    
    if (gifs.length === 0) {
      return message.reply('😢 Không tìm thấy GIF nào. Thử lại sau nhé!');
    }
    
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    await message.reply({
      content: `🎲 **Random GIF!**`,
      files: [randomGif.url]
    });
  } catch (error) {
    console.error('Error fetching random GIF:', error);
    await message.reply('❌ Có lỗi khi tìm GIF. Thử lại sau nhé! 🥺');
  }
}

module.exports = {
  sendGif,
  randomGif,
  searchGif
};
