const gameDetector = {
  
  games: [
    {
      id: 'mobile_legends',
      name: 'Mobile Legends: Bang Bang',
      keywords: ['mobile legends', 'mlbb', 'ml', 'bang bang', 'moonton'],
      searchPrefix: 'Mobile Legends Bang Bang'
    },
    {
      id: 'league_of_legends',
      name: 'League of Legends',
      keywords: ['league of legends', 'lol', 'league', 'riot games lol', 'liên minh huyền thoại'],
      searchPrefix: 'League of Legends'
    },
    {
      id: 'valorant',
      name: 'Valorant',
      keywords: ['valorant', 'val', 'riot shooter'],
      searchPrefix: 'Valorant'
    },
    {
      id: 'genshin',
      name: 'Genshin Impact',
      keywords: ['genshin', 'genshin impact', 'gi', 'mihoyo', 'hoyoverse genshin'],
      searchPrefix: 'Genshin Impact'
    },
    {
      id: 'honkai',
      name: 'Honkai Star Rail',
      keywords: ['honkai', 'star rail', 'hsr', 'honkai star rail'],
      searchPrefix: 'Honkai Star Rail'
    },
    {
      id: 'dota2',
      name: 'Dota 2',
      keywords: ['dota', 'dota 2', 'dota2', 'valve dota'],
      searchPrefix: 'Dota 2'
    },
    {
      id: 'pubg',
      name: 'PUBG Mobile',
      keywords: ['pubg', 'pubg mobile', 'pubgm', 'battlegrounds'],
      searchPrefix: 'PUBG Mobile'
    },
    {
      id: 'free_fire',
      name: 'Free Fire',
      keywords: ['free fire', 'ff', 'garena free fire', 'freefire'],
      searchPrefix: 'Free Fire'
    },
    {
      id: 'wild_rift',
      name: 'League of Legends: Wild Rift',
      keywords: ['wild rift', 'lol wild rift', 'liên quân mobile'],
      searchPrefix: 'Wild Rift'
    },
    {
      id: 'cod_mobile',
      name: 'Call of Duty Mobile',
      keywords: ['cod mobile', 'codm', 'call of duty mobile'],
      searchPrefix: 'COD Mobile'
    },
    {
      id: 'wuthering_waves',
      name: 'Wuthering Waves',
      keywords: ['wuthering waves', 'wuwa', 'wuthering'],
      searchPrefix: 'Wuthering Waves'
    },
    {
      id: 'zenless_zone_zero',
      name: 'Zenless Zone Zero',
      keywords: ['zenless', 'zzz', 'zenless zone zero'],
      searchPrefix: 'Zenless Zone Zero'
    },
    {
      id: 'arena_of_valor',
      name: 'Arena of Valor',
      keywords: ['arena of valor', 'aov', 'liên quân'],
      searchPrefix: 'Arena of Valor'
    },
    {
      id: 'clash_royale',
      name: 'Clash Royale',
      keywords: ['clash royale', 'cr', 'supercell clash'],
      searchPrefix: 'Clash Royale'
    },
    {
      id: 'brawl_stars',
      name: 'Brawl Stars',
      keywords: ['brawl stars', 'bs', 'brawl'],
      searchPrefix: 'Brawl Stars'
    },
    {
      id: 'overwatch',
      name: 'Overwatch 2',
      keywords: ['overwatch', 'ow2', 'overwatch 2'],
      searchPrefix: 'Overwatch 2'
    },
    {
      id: 'apex',
      name: 'Apex Legends',
      keywords: ['apex', 'apex legends', 'apex mobile'],
      searchPrefix: 'Apex Legends'
    },
    {
      id: 'fortnite',
      name: 'Fortnite',
      keywords: ['fortnite', 'fn', 'epic games fortnite'],
      searchPrefix: 'Fortnite'
    },
    {
      id: 'csgo',
      name: 'Counter-Strike 2',
      keywords: ['cs2', 'csgo', 'cs:go', 'counter strike', 'counter-strike 2'],
      searchPrefix: 'Counter-Strike 2'
    },
    {
      id: 'diablo4',
      name: 'Diablo 4',
      keywords: ['diablo 4', 'd4', 'diablo iv'],
      searchPrefix: 'Diablo 4'
    },
    {
      id: 'path_of_exile',
      name: 'Path of Exile',
      keywords: ['path of exile', 'poe', 'poe2'],
      searchPrefix: 'Path of Exile'
    },
    {
      id: 'lost_ark',
      name: 'Lost Ark',
      keywords: ['lost ark', 'lostark'],
      searchPrefix: 'Lost Ark'
    },
    {
      id: 'clash_of_clans',
      name: 'Clash of Clans',
      keywords: ['clash of clans', 'coc', 'supercell coc'],
      searchPrefix: 'Clash of Clans'
    }
  ],

  queryTypes: [
    {
      type: 'build',
      keywords: ['build', 'đồ', 'trang bị', 'item', 'gear', 'equipment', 'build đồ', 'lên đồ'],
      priority: 10
    },
    {
      type: 'combo',
      keywords: ['combo', 'skill', 'kỹ năng', 'chiêu', 'đánh combo', 'combo skill'],
      priority: 10
    },
    {
      type: 'guide',
      keywords: ['guide', 'hướng dẫn', 'cách chơi', 'tutorial', 'how to', 'làm sao'],
      priority: 9
    },
    {
      type: 'tier_list',
      keywords: ['tier list', 'tier', 'rank', 'ranking', 'best', 'top', 'meta', 'mạnh nhất', 'tốt nhất'],
      priority: 9
    },
    {
      type: 'counter',
      keywords: ['counter', 'chống', 'khắc chế', 'đối đầu', 'anti'],
      priority: 8
    },
    {
      type: 'tips',
      keywords: ['tips', 'tricks', 'mẹo', 'bí kíp', 'pro tips', 'chiến thuật'],
      priority: 8
    },
    {
      type: 'update',
      keywords: ['update', 'patch', 'new', 'mới', 'cập nhật', 'buff', 'nerf', 'thay đổi'],
      priority: 7
    },
    {
      type: 'strategy',
      keywords: ['strategy', 'chiến thuật', 'tactic', 'playstyle', 'lối chơi'],
      priority: 7
    }
  ],

  detectionPatterns: [
    {
      pattern: /(?:cho|xem|hướng dẫn|tìm|tim|search).+?(?:build|đồ|trang bị)/i,
      priority: 10
    },
    {
      pattern: /(?:combo|skill|chiêu).+?(?:của|cho|hero|champion|agent|nhân vật)/i,
      priority: 10
    },
    {
      pattern: /(?:cách chơi|hướng dẫn|guide).+?(?:hero|champion|agent|nhân vật)/i,
      priority: 9
    },
    {
      pattern: /(?:tier list|rank|top|best|mạnh nhất|tốt nhất)/i,
      priority: 9
    },
    {
      pattern: /(?:counter|chống|khắc chế).+?(?:hero|champion|agent)/i,
      priority: 8
    },
    {
      pattern: /(?:mẹo|tips|tricks|bí kíp)/i,
      priority: 8
    },
    {
      pattern: /(?:update|patch|buff|nerf|mới|cập nhật)/i,
      priority: 7
    },
    {
      pattern: /(?:chiến thuật|strategy|lối chơi|tactic).+?(?:game|hero|champion)/i,
      priority: 7
    },
    {
      pattern: /(?:trang bị|item|đồ|gear).+?(?:nào|gì|tốt|mạnh)/i,
      priority: 9
    },
    {
      pattern: /(?:build|combo|guide|tier|counter|tips|update)/i,
      priority: 6
    }
  ],

  isGameRequest(message) {
    const lowerMsg = message.toLowerCase();
    
    let maxPriority = 0;
    
    for (const pattern of this.detectionPatterns) {
      if (pattern.pattern.test(lowerMsg)) {
        maxPriority = Math.max(maxPriority, pattern.priority);
      }
    }
    
    const hasGame = this.games.some(game => 
      game.keywords.some(keyword => lowerMsg.includes(keyword.toLowerCase()))
    );
    
    const hasQueryType = this.queryTypes.some(type =>
      type.keywords.some(keyword => lowerMsg.includes(keyword.toLowerCase()))
    );
    
    if (hasGame && hasQueryType) {
      return { isGame: true, priority: maxPriority };
    }
    
    if (maxPriority >= 7) {
      return { isGame: true, priority: maxPriority };
    }
    
    return { isGame: false, priority: 0 };
  },

  detectGame(message) {
    const lowerMsg = message.toLowerCase();
    
    for (const game of this.games) {
      for (const keyword of game.keywords) {
        if (lowerMsg.includes(keyword.toLowerCase())) {
          return game;
        }
      }
    }
    
    return null;
  },

  detectQueryType(message) {
    const lowerMsg = message.toLowerCase();
    
    let bestMatch = null;
    let highestPriority = 0;
    
    for (const type of this.queryTypes) {
      for (const keyword of type.keywords) {
        if (lowerMsg.includes(keyword.toLowerCase())) {
          if (type.priority > highestPriority) {
            highestPriority = type.priority;
            bestMatch = type;
          }
        }
      }
    }
    
    return bestMatch;
  },

  extractEntityName(message, game) {
    const lowerMsg = message.toLowerCase();
    
    const gameKeywords = game.keywords.map(k => k.toLowerCase());
    const queryKeywords = this.queryTypes.flatMap(t => t.keywords);
    
    let cleanMsg = lowerMsg;
    
    [...gameKeywords, ...queryKeywords, 'cho', 'xem', 'tìm', 'hướng dẫn', 'cách', 'của', 'hero', 'champion', 'agent', 'nhân vật'].forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanMsg = cleanMsg.replace(regex, '');
    });
    
    cleanMsg = cleanMsg.replace(/[^\w\s]/gi, '').trim();
    const words = cleanMsg.split(/\s+/).filter(w => w.length > 2);
    
    if (words.length > 0 && words.length <= 3) {
      return words.join(' ');
    }
    
    return null;
  },

  buildSearchQuery(message, game, queryType, entityName) {
    let query = '';
    
    if (game) {
      query += game.searchPrefix + ' ';
    }
    
    if (entityName) {
      query += entityName + ' ';
    }
    
    if (queryType) {
      const typeMap = {
        'build': 'build guide',
        'combo': 'combo abilities',
        'guide': 'guide tips',
        'tier_list': 'tier list meta',
        'counter': 'counter pick',
        'tips': 'tips tricks',
        'update': 'latest update patch',
        'strategy': 'strategy guide'
      };
      query += (typeMap[queryType.type] || queryType.type) + ' ';
    } else {
      query += 'guide ';
    }
    
    query += '2025';
    
    return query.trim();
  }
};

module.exports = gameDetector;
