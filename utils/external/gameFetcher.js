const gameDetector = require('../gameDetector');

const cuteIntros = [
  "🎮 Ư-ừm... mình tìm được thông tin game rồi!",
  "🎮 À... à... đây là guide bạn cần nè!",
  "🎮 Ehehe~ mình có thông tin về game này!",
  "🎮 Để mình xem... ồ có info hay đây!",
  "🎮 🥺 Mình tìm được rồi, xem nào!",
  "🎮 Thông tin game mới nhất đây bạn ơi!",
  "🎮 Ư-ừm... build và combo đây nha!",
  "🎮 Guide chi tiết đây! ✨"
];

const cuteOutros = [
  "Chúc bạn chơi game vui vẻ! 🎮✨",
  "Hy vọng thông tin này hữu ích nha! 😊🌸",
  "Áp dụng vào game thử xem! 💕",
  "Good luck trên con đường leo rank! 🚀",
  "Nhớ luyện tập nhiều nhé! 🥺💪",
  "Chơi game giỏi lên nào! 🌟",
  "Hy vọng build này phù hợp! ✨",
  "Đi rank thắng liền nha! 🏆"
];

async function searchGameInfo(query, webSearchFunction) {
  try {
    console.log(`🎮 Searching game info: ${query}`);
    
    const searchResult = await webSearchFunction(query);
    
    if (!searchResult || searchResult.trim().length < 50) {
      return {
        success: false,
        error: 'No information found'
      };
    }
    
    return {
      success: true,
      content: searchResult
    };
    
  } catch (error) {
    console.error('Error searching game info:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function formatGameInfo(searchResult, game, queryType, entityName) {
  const intro = cuteIntros[Math.floor(Math.random() * cuteIntros.length)];
  const outro = cuteOutros[Math.floor(Math.random() * cuteOutros.length)];
  
  let title = '**';
  if (game) {
    title += `${game.name}`;
  }
  if (entityName) {
    title += ` - ${entityName}`;
  }
  if (queryType) {
    const typeNames = {
      'build': 'Build Guide',
      'combo': 'Combo Guide',
      'guide': 'Guide',
      'tier_list': 'Tier List',
      'counter': 'Counter Guide',
      'tips': 'Tips & Tricks',
      'update': 'Latest Update',
      'strategy': 'Strategy Guide'
    };
    title += ` - ${typeNames[queryType.type] || 'Info'}`;
  }
  title += '**\n\n';
  
  let content = searchResult.content;
  
  if (content.length > 1800) {
    content = content.substring(0, 1800) + '...';
  }
  
  const formatted = `${intro}\n\n${title}${content}\n\n${outro}`;
  
  if (formatted.length > 2000) {
    const maxContent = 2000 - intro.length - title.length - outro.length - 10;
    content = content.substring(0, maxContent) + '...';
    return `${intro}\n\n${title}${content}\n\n${outro}`;
  }
  
  return formatted;
}

function getErrorMessage(game, queryType) {
  const errors = [
    `Ư-ừm... không tìm được thông tin về ${game?.name || 'game này'}... 🥺`,
    `À... à... có lỗi rồi, bạn thử lại sau nhé! 😢`,
    `Ehehe... mình không tìm được info này... 🥺💕`,
    `Xin lỗi bạn, không có thông tin về ${game?.name || 'game này'} lúc này... 😞`
  ];
  
  return errors[Math.floor(Math.random() * errors.length)];
}

async function handleGameRequest(message, webSearchFunction) {
  const detection = gameDetector.isGameRequest(message);
  
  // Increase threshold to reduce false positives - only trigger on priority >= 8
  if (!detection.isGame || detection.priority < 8) {
    return null;
  }
  
  const game = gameDetector.detectGame(message);
  const queryType = gameDetector.detectQueryType(message);
  const entityName = game ? gameDetector.extractEntityName(message, game) : null;
  
  console.log(`🎮 Game Info Request:`, {
    game: game?.name,
    queryType: queryType?.type,
    entity: entityName,
    priority: detection.priority
  });
  
  const searchQuery = gameDetector.buildSearchQuery(message, game, queryType, entityName);
  
  const searchResult = await searchGameInfo(searchQuery, webSearchFunction);
  
  if (!searchResult.success) {
    return {
      success: false,
      message: getErrorMessage(game, queryType),
      reactions: ['🎮', '😢', '💔']
    };
  }
  
  const formattedMessage = formatGameInfo(searchResult, game, queryType, entityName);
  
  return {
    success: true,
    message: formattedMessage,
    reactions: ['🎮', '🎯', '✨'],
    metadata: {
      game: game?.name,
      queryType: queryType?.type,
      entity: entityName,
      query: searchQuery
    }
  };
}

module.exports = {
  handleGameRequest,
  searchGameInfo,
  formatGameInfo
};
