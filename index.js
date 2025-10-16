const { Client, GatewayIntentBits, ChannelType, Partials } = require('discord.js');
const OpenAI = require('openai');

// Database-backed config service (replaces file-based config)
const { getServerConfig } = require('./database/configService');
const { getPersonalityMode } = require('./personalities/modes');
const { getReactionsForMessage, addReactionsToMessage } = require('./utils/reactions');
const {
  handleSetMode,
  handleSetPrefix,
  handleSetChannel,
  handleAddKeyword,
  handleRemoveKeyword,
  handleListKeywords,
  handleReset,
  handleClearHistory,
  handleHelp,
  handleConfig,
  handleCreator,
  handleSleep
} = require('./commands/adminCommands');

const {
  handlePing,
  handleAFK,
  checkAFK,
  handleAvatar,
  handleBanner,
  handleServerInfo,
  handleBotInfo,
  handleRoll,
  handleSetLanguage
} = require('./commands/utilityCommands');

const {
  handleFlip,
  handleSpace,
  handleDadJoke,
  handleNorris,
  handleGitHub,
  handleCat,
  handleDog,
  handlePug,
  handlePokemon,
  handleItunes,
  handleRandomColor,
  handleMemberCount,
  handleWhois,
  handlePoll,
  handleInfo,
  handleUptime,
  handlePremium
} = require('./commands/funCommands');

const {
  handleAction,
  isActionCommand
} = require('./commands/actionCommands');

const { playTruthOrDare, askTruth, giveDare } = require('./games/truthOrDare');
const { playRockPaperScissors, playSquidGameRPS } = require('./games/rockPaperScissors');
const { ask8Ball } = require('./games/eightBall');
const { askWhyQuestion, checkWhyAnswer, hasActiveWhyGame } = require('./games/whyQuestions');
const { askTriviaQuestion, checkTriviaAnswer, hasActiveTriviaGame } = require('./games/trivia');
const { startWordGuess, guessWord, giveUpGame } = require('./games/wordGuess');
const { sendGif, randomGif } = require('./utils/external/gifSearch');
const { handleImageAnalysis } = require('./utils/external/imageAnalysis');
const { deploySlashCommands } = require('./utils/deploySlashCommands');
const { handleSlashCommand } = require('./commands/slashHandlers');
const { detectGameIntent, extractGameParams } = require('./utils/naturalLanguageGames');
const { searchFunctions, executeFunctionCall, searchWeb } = require('./utils/external/webSearch');
const { needsRealTimeSearch, extractSearchQuery } = require('./utils/queryDetector');
const { isCodeAssistanceNeeded, determineAssistanceType, getCodeAssistantPrompt } = require('./utils/codeAssistant');
const { isTutoringQuestion, detectSubject, detectEducationLevel, getTutorSystemPrompt } = require('./utils/tutorSystem');
const { detectSleepCommand } = require('./utils/sleepDetector');
const { isOwner, getOwnerGreeting } = require('./config/creatorInfo');
const { 
  isVideoSearchRequest, 
  detectPlatform, 
  detectContentType, 
  extractVideoSearchQuery,
  searchYouTube,
  searchTikTok,
  formatVideoResults
} = require('./utils/videoSearch');
const { isNewsRequest, detectCategory, detectSource, getRssUrl, getSourceName } = require('./utils/newsDetector');
const { fetchNews, formatNewsResults } = require('./utils/external/newsFetcher');
const { handleGameRequest } = require('./utils/external/gameFetcher');
const { isHOKQuery, createHOKResponse } = require('./utils/hokDetector');
const { initializeDatabase, db } = require('./database/db');
const { findMatchingResponse, logConversation } = require('./database/trainingData');
const { saveMessage, loadHistory, cleanupOldMessages } = require('./database/conversationHistory');
const {
  handleTrainAdd,
  handleTrainList,
  handleTrainDelete,
  handleTrainToggle,
  handleResponseAdd,
  handleResponseList,
  handleResponseDelete,
  handleLogs
} = require('./commands/trainingCommands');
const { handleActionLogsConfig } = require('./commands/actionLogsCommands');
const { handleAutoDelete } = require('./commands/autoDeleteCommands');
const { handleCustomCommand, executeCustomCommand } = require('./commands/customCommandsHandler');
const {
  handleStick,
  handleStickStop,
  handleStickStart,
  handleStickRemove,
  handleGetStickies,
  checkStickyMessage,
  initializeStickySystem
} = require('./commands/stickyCommands');
const { handleAutoMod } = require('./commands/autoModCommands');
const { handleAutoRoles } = require('./commands/autoRolesCommands');
const tempRolesCommands = require('./commands/tempRolesCommands');
const timedRolesCommands = require('./commands/timedRolesCommands');
const reactionRolesCommands = require('./commands/reactionRolesCommands');
const { handleRoleManagement } = require('./commands/roleManagementCommands');
const { handleScheduledMessage } = require('./commands/scheduledMessagesCommands');
const { handleAutoBan } = require('./commands/autoBanCommands');
const { checkAutoMod } = require('./utils/autoModHandler');
const { handleAutoDelete: autoDeleteMessage } = require('./utils/autoDeleteHandler');
const { handleMemberJoin: autoRolesMemberJoin, handleMemberLeave: autoRolesMemberLeave } = require('./utils/autoRolesHandler');
const { handleMemberJoin: timedRolesMemberJoin } = require('./utils/timedRolesHandler');
const { handleReactionAdd, handleReactionRemove } = require('./utils/reactionRolesHandler');
const { logAction } = require('./utils/actionLogsHandler');
const { initScheduler } = require('./utils/scheduledMessagesHandler');
const { initTempRolesScheduler } = require('./utils/tempRolesScheduler');
const { initTimedRolesScheduler } = require('./utils/timedRolesScheduler');
const { checkAutoBan, checkMemberJoinAutoban, onMemberLeave: autoBanMemberLeave } = require('./utils/autoBanHandler');
const { containsBlacklistedContent, getCuteRejectionResponse } = require('./utils/blacklistFilter');
const {
  handleBlacklistAdd,
  handleBlacklistRemove,
  handleBlacklistList,
  handleBlacklistToggle
} = require('./commands/blacklistCommands');
const { logger, LogLevel, LogCategory } = require('./utils/logger');
const {
  handleSetLogLevel,
  handleLogStats,
  handleLogTest
} = require('./commands/loggingCommands');
const {
  handlePurge,
  handleNuke,
  handleLock,
  handleUnlock,
  handleSlowmode
} = require('./commands/moderationCommands');
const topggService = require('./utils/topgg');

const {
  sendWelcomeMessage,
  sendLeaveMessage,
  sendBoostMessage
} = require('./commands/announcementsSystem');

const {
  handleStatus,
  handleShardLookup
} = require('./commands/statusCommands');

const { syncCommandsToDatabase } = require('./utils/commandSync');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

// Add metrics collector for sharding
const MetricsCollector = require('./utils/metricsCollector');
const metricsCollector = new MetricsCollector(client);

// Helper function for shard manager
client.getMetrics = () => metricsCollector.getMetrics();

// Start metrics reporting when bot is ready
client.once('ready', () => {
  metricsCollector.startReporting();
  
  // Initialize temporary roles scheduler
  initTempRolesScheduler(client);
  
  // Initialize timed roles queue scheduler
  initTimedRolesScheduler(client);
  
  // Sync commands to database (auto-update commands page & help system)
  syncCommandsToDatabase().catch(err => console.error('Command sync error:', err));
  
  // Note: Sticky messages system will be initialized after database in the main ready handler
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const conversationHistory = new Map();

// Track server language to detect changes
const serverLanguages = new Map();

const GLOBAL_ALLOWED_CHANNELS = process.env.ALLOWED_CHANNEL_IDS 
  ? process.env.ALLOWED_CHANNEL_IDS.split(',').map(id => id.trim())
  : [];

// Cute status messages for Lena
const statusMessages = [
  { type: 'PLAYING', text: 'với các bạn! 🌸' },
  { type: 'LISTENING', text: 'lời tâm sự của mọi người 💕' },
  { type: 'WATCHING', text: 'anime cùng các bạn 📺✨' },
  { type: 'PLAYING', text: 'đọc sách trong thư viện 📚' },
  { type: 'LISTENING', text: 'nhạc lofi để học bài 🎵' },
  { type: 'WATCHING', text: 'các bạn cần giúp gì không? 🥺' },
  { type: 'PLAYING', text: 'Truth or Dare! 🎮' },
  { type: 'LISTENING', text: 'câu hỏi của bạn 💭' },
  { type: 'PLAYING', text: 'hehe~ gọi Lena nha! 😊' },
  { type: 'WATCHING', text: 'mọi người trong server 👀✨' }
];

let currentStatusIndex = 0;

function setRandomStatus() {
  const status = statusMessages[currentStatusIndex];
  
  // Map Discord.js v14 ActivityType
  const activityType = {
    'PLAYING': 0,
    'LISTENING': 2,
    'WATCHING': 3
  }[status.type];
  
  client.user.setPresence({
    activities: [{
      name: status.text,
      type: activityType
    }],
    status: 'online'
  });
  
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
}

client.on('ready', async () => {
  console.log(`✅ Bot đã đăng nhập thành công với tên: ${client.user.tag}`);
  console.log(`📝 Bot ID: ${client.user.id}`);
  console.log(`🌟 Lena đã sẵn sàng để trò chuyện!`);
  
  // Using database config service - no need to load JSON file
  
  // Initialize database
  await initializeDatabase();
  
  // Initialize sticky messages system (after database)
  await initializeStickySystem(client);
  
  // Initialize logger with Discord channel
  const LOG_CHANNEL_ID = '1427091743542612099';
  const LOG_SERVER_ID = '1332505823435558973';
  logger.initialize(client, LOG_CHANNEL_ID, LOG_SERVER_ID);
  logger.setLogLevel(LogLevel.INFO);
  
  // Check if bot woke up from sleep
  const fs = require('fs');
  const { getRestartMessage } = require('./config/creatorInfo');
  
  try {
    if (fs.existsSync('./data/sleep.json')) {
      const sleepData = JSON.parse(fs.readFileSync('./data/sleep.json', 'utf8'));
      
      if (sleepData.wakeUpChannel) {
        const wakeUpMessage = getRestartMessage();
        
        try {
          const channel = await client.channels.fetch(sleepData.wakeUpChannel);
          if (channel) {
            await channel.send(wakeUpMessage);
            console.log(`🌸 Sent wake up message to channel: ${sleepData.wakeUpChannel}`);
          }
        } catch (err) {
          console.error('❌ Could not send wake up message:', err);
        }
        
        // Clear sleep data
        fs.writeFileSync('./data/sleep.json', JSON.stringify({ wakeUpChannel: null }, null, 2));
      }
    }
  } catch (err) {
    console.error('❌ Error checking sleep data:', err);
  }
  
  // Log bot startup
  await logger.logEvent('🚀 Bot Started', {
    server: `All servers (${client.guilds.cache.size})`,
    extra: `Bot: ${client.user.tag}\nID: ${client.user.id}`
  });
  
  // Start approved replies checker for confession system
  const { startApprovedRepliesChecker } = require('./commands/confessionHandlers');
  startApprovedRepliesChecker(client);
  console.log('✅ Started approved replies checker!');
  
  // Start Top.gg auto-posting
  topggService.startAutoPost(client);
  
  // Deploy slash commands to all guilds the bot is in
  const guildIds = client.guilds.cache.map(guild => guild.id);
  await deploySlashCommands(client.user.id, guildIds);
  
  // Set initial status
  setRandomStatus();
  console.log(`✨ Status: ${statusMessages[0].type} ${statusMessages[0].text}`);
  
  // Rotate status every 5 minutes
  setInterval(setRandomStatus, 5 * 60 * 1000);
  
  // Start giveaway auto-end scheduler
  const { startGiveawayScheduler } = require('./utils/giveawayScheduler');
  startGiveawayScheduler(client);
  
  // Initialize scheduled messages
  await initScheduler(client, db);
  
  // Auto-cleanup old conversation history (> 7 days) - runs daily at 3 AM
  const scheduleCleanup = () => {
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0);
    
    // If it's past 3 AM today, schedule for tomorrow
    if (now.getHours() >= 3) {
      next3AM.setDate(next3AM.getDate() + 1);
    }
    
    const timeUntil3AM = next3AM.getTime() - now.getTime();
    
    setTimeout(async () => {
      console.log('🧹 Running daily conversation history cleanup...');
      await cleanupOldMessages();
      
      // Schedule next cleanup (24 hours later)
      setInterval(async () => {
        console.log('🧹 Running daily conversation history cleanup...');
        await cleanupOldMessages();
      }, 24 * 60 * 60 * 1000);
    }, timeUntil3AM);
    
    console.log(`🗑️ Auto-cleanup scheduled for ${next3AM.toLocaleString('vi-VN')} (messages > 7 days)`);
  };
  
  scheduleCleanup();
  
  if (GLOBAL_ALLOWED_CHANNELS.length > 0) {
    console.log(`📌 Giới hạn global: ${GLOBAL_ALLOWED_CHANNELS.length} kênh được chỉ định và DM`);
  } else {
    console.log(`📌 Bot hoạt động trong tất cả các kênh và DM`);
  }
  
  console.log(`💡 Sử dụng !help hoặc / để xem danh sách lệnh`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const isDM = message.channel.type === ChannelType.DM;
  const serverId = message.guild?.id || 'DM';
  const channelId = message.channel.id;
  
  // Auto Moderation check (highest priority)
  if (!isDM) {
    const modViolated = await checkAutoMod(message, db);
    if (modViolated) return; // Message was deleted by auto mod
  }
  
  // Auto Ban check (after auto mod)
  if (!isDM) {
    const banApplied = await checkAutoBan(message, db);
    if (banApplied) return; // Action was taken
  }
  
  // Owner greeting (10% chance to show cute greeting)
  if (isOwner(message.author.id) && Math.random() < 0.1) {
    try {
      await message.react('👑');
    } catch (err) {
      // Ignore reaction errors
    }
  }
  
  // Auto Delete (schedule deletion)
  if (!isDM) {
    autoDeleteMessage(message, db);
  }
  
  if (!isDM && message.guild) {
    const isGlobalAllowed = GLOBAL_ALLOWED_CHANNELS.length === 0 || GLOBAL_ALLOWED_CHANNELS.includes(channelId);
    
    if (!isGlobalAllowed) {
      return;
    }
  }
  
  // Check AFK status (after channel allowlist check)
  checkAFK(message);
  
  // Check sticky messages (message-based mode)
  if (!isDM) {
    await checkStickyMessage(message);
  }
  
  // Get server-specific prefix (or default '!' for DMs)
  const prefixConfig = isDM ? { prefix: '!', language: 'vi' } : await getServerConfig(message.guild.id);
  const serverPrefix = prefixConfig.prefix;
  const serverLanguage = prefixConfig.language;
  
  console.log(`🔍 Server prefix for ${message.guild?.id}: "${serverPrefix}"`);
  
  // Check for language change and clear conversation history if changed
  if (!isDM && message.guild?.id) {
    const lastKnownLanguage = serverLanguages.get(message.guild.id);
    if (lastKnownLanguage && serverLanguage && lastKnownLanguage !== serverLanguage) {
      // Language changed! Clear all conversation histories for this server
      const keysToDelete = [];
      for (const [key] of conversationHistory) {
        if (key.startsWith(`${message.guild.id}_`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => conversationHistory.delete(key));
      console.log(`🔄 Language changed from ${lastKnownLanguage} → ${serverLanguage}. Cleared ${keysToDelete.length} conversation histories.`);
    }
    // Update tracked language
    if (serverLanguage) {
      serverLanguages.set(message.guild.id, serverLanguage);
    }
  }
  
  // ===== LANGUAGE SETUP REQUIRED CHECK =====
  // If language is not configured in a server, block all bot functions except !setlang
  if (!isDM && !serverLanguage) {
    const lowerContent = message.content.toLowerCase();
    const lowerPrefix = serverPrefix.toLowerCase();
    
    // Only allow !setlang command when language not setup
    if (lowerContent.startsWith(lowerPrefix)) {
      const args = message.content.slice(serverPrefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();
      
      if (command === 'setlang' || command === 'setlanguage' || command === 'language' || command === 'lang') {
        const { handleSetLanguage } = require('./commands/utilityCommands');
        return handleSetLanguage(message, args, db, conversationHistory);
      }
    }
    
    // Block all other interactions with welcome message
    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setTitle('🌐 Language Setup Required / Yêu cầu cài đặt ngôn ngữ')
      .setDescription(
        '**🇬🇧 ENGLISH:**\n' +
        'Please choose your preferred language before using the bot!\n' +
        'This will determine how Lena communicates with you.\n\n' +
        '**🇻🇳 TIẾNG VIỆT:**\n' +
        'Vui lòng chọn ngôn ngữ ưa thích trước khi sử dụng bot!\n' +
        'Điều này sẽ quyết định cách Lena giao tiếp với bạn.'
      )
      .setColor(0x5865F2)
      .addFields(
        { 
          name: '🇻🇳 Vietnamese / Tiếng Việt', 
          value: `**Command:** \`${serverPrefix}setlang vi\`\n` +
                 `Bot sẽ giao tiếp bằng tiếng Việt và cung cấp thông tin về Việt Nam.\n` +
                 `Lena will communicate in Vietnamese and provide information about Vietnam.`,
          inline: false 
        },
        { 
          name: '🇬🇧 English / Tiếng Anh', 
          value: `**Command:** \`${serverPrefix}setlang en\`\n` +
                 `Bot will communicate in English and provide international information.\n` +
                 `Lena sẽ giao tiếp bằng tiếng Anh và cung cấp thông tin quốc tế.`,
          inline: false 
        },
        {
          name: '⚠️ Admin Only / Chỉ dành cho Admin',
          value: 'Only server administrators can setup language\n' +
                 'Chỉ quản trị viên server mới có thể cài đặt ngôn ngữ',
          inline: false
        }
      )
      .setFooter({ text: 'Language setup is required once per server' })
      .setTimestamp();
    
    return message.reply({ embeds: [embed] });
  }
  
  // Case-insensitive prefix check
  const lowerContent = message.content.toLowerCase();
  const lowerPrefix = serverPrefix.toLowerCase();
  
  // Check if message starts with prefix (no space required)
  // Examples: "lhelp", "l help", "!ping" all work
  const startsWithPrefix = lowerContent.startsWith(lowerPrefix);
  
  // Check for custom commands first (before built-in commands)
  if (startsWithPrefix && !isDM) {
    const { checkForCustomCommands } = require('./commands/customCommands');
    const customCommandHandled = await checkForCustomCommands(message, serverPrefix);
    if (customCommandHandled) {
      return; // Custom command was handled, stop processing
    }
  }
  
  if (startsWithPrefix) {
    // Parse command - works with or without space after prefix
    // "lhelp" → command="help", "l help" → command="help"
    const afterPrefix = message.content.slice(serverPrefix.length).trim();
    const args = afterPrefix.split(/ +/);
    let command = args.shift()?.toLowerCase() || '';
    
    // Command aliases for shorter prefix commands
    const commandAliases = {
      'lga': 'giveaway',
      'conf': 'config',
      'emb': 'embed',
      'resp': 'response',
      'bl': 'blacklist'
    };
    
    // Replace alias with actual command
    if (commandAliases[command]) {
      command = commandAliases[command];
    }
    
    // Admin commands that require server context
    const adminCommands = [
      'setmode', 'setprefix', 'setchannel', 'addkeyword', 'removekeyword', 'listkeywords',
      'reset', 'clearhistory', 'config', 'train', 'trainadd', 'trainlist', 
      'traindelete', 'traintoggle', 'response', 'responseadd', 'responselist',
      'responsedelete', 'blacklist', 'blacklistadd', 'blacklistremove',
      'blacklistlist', 'blacklisttoggle', 'setloglevel', 'logstats', 'logtest',
      'purge', 'clear', 'nuke'
    ];
    
    if (!message.guild && adminCommands.includes(command)) {
      return message.reply('❌ Lệnh này chỉ có thể dùng trong server! Các trò chơi và lệnh thông tin vẫn dùng được trong DM nhé! 😊');
    }
    
    switch (command) {
      case 'setmode':
        return handleSetMode(message, args, conversationHistory);
      case 'setprefix':
        return handleSetPrefix(message, args);
      case 'setchannel':
        return handleSetChannel(message, args);
      case 'addkeyword':
        return handleAddKeyword(message, args);
      case 'removekeyword':
        return handleRemoveKeyword(message, args);
      case 'listkeywords':
        return handleListKeywords(message);
      case 'reset':
        return handleReset(message, conversationHistory);
      case 'clearhistory':
        return handleClearHistory(message, conversationHistory);
      case 'config':
        return handleConfig(message);
      case 'help':
        return handleHelp(message, args);
      case 'creator':
        return handleCreator(message);
      case 'ping':
        return handlePing(message, db);
      case 'status':
        return handleStatus(message, client);
      case 'shard':
      case 'findshard':
        if (args[0]) {
          return handleShardLookup(message, args[0]);
        } else {
          return message.reply('❌ Vui lòng cung cấp Server ID! Ví dụ: `!shard 123456789`');
        }
      case 'afk':
        return handleAFK(message, args);
      case 'avatar':
      case 'av':
        return handleAvatar(message, args);
      case 'banner':
        return handleBanner(message, args);
      case 'serverinfo':
        return handleServerInfo(message, db);
      case 'bot':
        return handleBotInfo(message);
      case 'roll':
      case 'dice':
      case 'xucxac':
        return handleRoll(message, args);
      case 'setlang':
      case 'setlanguage':
      case 'language':
      case 'lang':
        return handleSetLanguage(message, args, db, conversationHistory);
      case 'flip':
      case 'flipcoin':
        return handleFlip(message);
      case 'space':
        return handleSpace(message);
      case 'dadjoke':
        return handleDadJoke(message);
      case 'norris':
        return handleNorris(message);
      case 'github':
        return handleGitHub(message, args);
      case 'cat':
        return handleCat(message);
      case 'dog':
        return handleDog(message);
      case 'pug':
        return handlePug(message);
      case 'pokemon':
        return handlePokemon(message, args);
      case 'itunes':
        return handleItunes(message, args);
      case 'randomcolor':
        return handleRandomColor(message);
      case 'membercount':
        return handleMemberCount(message);
      case 'whois':
        return handleWhois(message, args);
      case 'poll':
        return handlePoll(message, args);
      case 'stick':
        return handleStick(message, args);
      case 'stickstop':
        return handleStickStop(message);
      case 'stickstart':
        return handleStickStart(message);
      case 'stickremove':
        return handleStickRemove(message);
      case 'getstickies':
      case 'stickies':
        return handleGetStickies(message);
      case 'info':
      case 'botinfo':
        return handleInfo(message);
      case 'uptime':
        return handleUptime(message);
      case 'premium':
        return handlePremium(message);
      case 'truthordare':
      case 'tod':
        return playTruthOrDare(message);
      case 'truth':
        return askTruth(message);
      case 'dare':
        return giveDare(message);
      case 'rps':
        return playRockPaperScissors(message, args[0]);
      case 'squid':
        return playSquidGameRPS(message, args[0]);
      case '8ball':
      case 'ball':
        return ask8Ball(message, args.join(' '));
      case 'gif':
        return sendGif(message, args.join(' '));
      case 'randomgif':
      case 'rgif':
        return randomGif(message);
      case 'analyze':
      case 'image':
        return handleImageAnalysis(message, openai);
      case 'why':
      case 'taisao':
      case 'visao':
        return askWhyQuestion(message);
      case 'trivia':
      case 'dovui':
        return askTriviaQuestion(message);
      case 'wordguess':
      case 'doancau':
      case 'doantừ':
      case 'doantu':
        return startWordGuess(message);
      case 'guess':
      case 'doan':
        return guessWord(message, args);
      case 'giveup':
      case 'bocuoc':
        return giveUpGame(message);
      case 'train':
        const trainCmd = args[0]?.toLowerCase();
        if (trainCmd === 'add') return handleTrainAdd(message, args.slice(1));
        if (trainCmd === 'list') return handleTrainList(message, args.slice(1));
        if (trainCmd === 'delete') return handleTrainDelete(message, args.slice(1));
        if (trainCmd === 'toggle') return handleTrainToggle(message, args.slice(1));
        return message.reply(`❌ Commands: \`${serverPrefix}train add/list/delete/toggle\``);
      case 'response':
        const respCmd = args[0]?.toLowerCase();
        if (respCmd === 'add') return handleResponseAdd(message, args.slice(1));
        if (respCmd === 'list') return handleResponseList(message);
        if (respCmd === 'delete') return handleResponseDelete(message, args.slice(1));
        return message.reply(`❌ Commands: \`${serverPrefix}response add/list/delete\``);
      case 'logs':
        return handleLogs(message, args);
      case 'blacklist':
        const blacklistCmd = args[0]?.toLowerCase();
        if (blacklistCmd === 'add') return handleBlacklistAdd(message, args.slice(1));
        if (blacklistCmd === 'remove') return handleBlacklistRemove(message, args.slice(1));
        if (blacklistCmd === 'list') return handleBlacklistList(message);
        if (blacklistCmd === 'toggle') return handleBlacklistToggle(message);
        return message.reply(`❌ Commands: \`${serverPrefix}blacklist add/remove/list/toggle\``);
      case 'actionlogs':
      case 'logs-config':
        return handleActionLogsConfig(message, args, db);
      case 'autodelete':
      case 'ad':
        return handleAutoDelete(message, args, db);
      case 'customcmd':
      case 'customcommand':
      case 'cc':
        return handleCustomCommand(message, args, db);
      case 'automod':
      case 'am':
        return handleAutoMod(message, args, db);
      case 'autoroles':
      case 'ar':
        return handleAutoRoles(message, args, db);
      case 'temprole':
      case 'tr':
      case 'temporaryrole':
        return tempRolesCommands.execute(message, args, client, db);
      case 'timedrole':
      case 'trole':
      case 'delayedrole':
        return timedRolesCommands.execute(message, args, client, db);
      case 'rr':
      case 'reactionrole':
      case 'reactionroles':
        return reactionRolesCommands.execute(message, args, client, db);
      case 'role':
      case 'roles':
        return handleRoleManagement(message, args, db);
      case 'schedule':
      case 'schedulemsg':
        return handleScheduledMessage(message, args, db);
      case 'autoban':
      case 'ab':
        return handleAutoBan(message, args, db);
      case 'loglevel':
        return handleSetLogLevel(message, args);
      case 'logstats':
        return handleLogStats(message);
      case 'logtest':
        return handleLogTest(message);
      case 'purge':
      case 'clear':
        return handlePurge(message, args);
      case 'nuke':
        return handleNuke(message);
      case 'lock':
      case 'lockdown':
        return handleLock(message, args);
      case 'unlock':
        return handleUnlock(message);
      case 'slowmode':
      case 'slow':
        return handleSlowmode(message, args);
      case 'giveaway':
        const {
          handleGiveawayCreate,
          handleGiveawayEnd,
          handleGiveawayReroll,
          handleGiveawayList,
          handleGiveawayBlacklist,
          handleGiveawayUnblacklist,
          handleGiveawayListBan
        } = require('./commands/giveawayHandlers');
        
        const giveawayCmd = args[0]?.toLowerCase();
        if (giveawayCmd === 'create') return handleGiveawayCreate(message, args.slice(1));
        if (giveawayCmd === 'end') return handleGiveawayEnd(message, args.slice(1));
        if (giveawayCmd === 'reroll') return handleGiveawayReroll(message, args.slice(1));
        if (giveawayCmd === 'list') return handleGiveawayList(message);
        if (giveawayCmd === 'blacklist') return handleGiveawayBlacklist(message, args.slice(1));
        if (giveawayCmd === 'unblacklist') return handleGiveawayUnblacklist(message, args.slice(1));
        if (giveawayCmd === 'listban') return handleGiveawayListBan(message);
        return message.reply(`❌ Commands: \`${serverPrefix}giveaway create/end/reroll/list/blacklist/unblacklist/listban\``);
      default:
        // Check if it's an action command
        if (isActionCommand(command)) {
          return handleAction(message, command, args);
        }
        
        // Check if it's a custom command
        if (!isDM) {
          const customCmdResult = await executeCustomCommand(message, command, db);
          if (customCmdResult !== null) {
            return; // Custom command was executed
          }
        }
        
        // SMART FILTER: If unknown command but message contains "lena" (as word), 
        // don't return - allow fall-through to AI response (user is calling bot name)
        const lenaPattern = /\blena\b/i;
        const hasLenaWord = lenaPattern.test(message.content);
        
        if (hasLenaWord || message.mentions.has(client.user)) {
          // Message contains "lena" or @mention - treat as calling bot, not invalid command
          // Don't return, fall through to AI processing below
          break;
        }
        
        // Unknown command and no "lena" - ignore silently
        return;
    }
  }
  
  const serverConfig = await getServerConfig(serverId);
  const serverAllowedChannelsForAuto = serverConfig.allowedChannels || [];
  // If allowed_channels is empty, allow ALL channels. Otherwise check if current channel is in the list
  const isInAllowedChannel = serverAllowedChannelsForAuto.length === 0 || serverAllowedChannelsForAuto.includes(channelId);
  
  const hasMention = message.mentions.has(client.user);
  const hasLenaKeyword = message.content.toLowerCase().includes('lena');
  
  // Detect when bot is DIRECTLY called (not just auto-response in allowed channel)
  const isDirectlyMentioned = hasMention || hasLenaKeyword;
  
  console.log(`🔍 Debug - isDM: ${isDM}, hasMention: ${hasMention}, hasLenaKeyword: ${hasLenaKeyword}, isInAllowedChannel: ${isInAllowedChannel}, isDirectlyMentioned: ${isDirectlyMentioned}`);
  console.log(`⚙️ Config - Server ${serverId} - autoReact: ${serverConfig.autoReact}, contentFilter: ${serverConfig.contentFilter}`);
  
  // Check custom auto-responses FIRST (works in all channels)
  if (!isDM) {
    try {
      // Check config-based custom responses
      // Check keywords from PostgreSQL config
      const keywords = serverConfig.keywords || {};
      let customResponse = null;
      for (const [keyword, response] of Object.entries(keywords)) {
        if (message.content.toLowerCase().includes(keyword.toLowerCase())) {
          customResponse = response;
          break;
        }
      }
      if (customResponse) {
        await message.reply(customResponse);
        
        const currentMode = serverConfig.mode || 'lena';
        // Auto-react only if enabled
        if (serverConfig.autoReact !== false) {
          const reactions = getReactionsForMessage(message.content, currentMode);
          await addReactionsToMessage(message, reactions);
        }
        return;
      }
      
      // Check database custom responses and training data
      const dbResponse = await findMatchingResponse(serverId, message.content);
      if (dbResponse) {
        console.log('📚 Found matching training data');
      
      // Check if response has embed
      if (dbResponse.embedName) {
        const { getEmbedByName } = require('./utils/embedUtils');
        const embed = await getEmbedByName(serverId, dbResponse.embedName);
        
        if (embed) {
          await message.reply({ 
            content: dbResponse.response || null, 
            embeds: [embed] 
          });
        } else {
          // Embed not found, send text only
          await message.reply(dbResponse.response);
        }
      } else {
        await message.reply(dbResponse.response);
      }
      
      const currentMode = serverConfig.mode || 'lena';
      
      // Auto-react only if enabled
      if (serverConfig.autoReact !== false) {
        const reactions = getReactionsForMessage(message.content, currentMode);
        await addReactionsToMessage(message, reactions);
      }
      
      // Log database response to conversation logs
      await logConversation({
        serverId,
        channelId,
        userId: message.author.id,
        userMessage: message.content,
        botResponse: dbResponse.response,
        personalityMode: currentMode
      });
      
      return;
    }
    } catch (error) {
      console.error('❌ Error in custom response check:', error);
    }
  }
  
  // In DM, always respond. In server, check mention/keyword/allowed channel
  if (isDM || message.mentions.has(client.user) || message.content.toLowerCase().includes('lena') || isInAllowedChannel) {
    // Check for DM confession format: "confession <content>"
    if (isDM && message.content.toLowerCase().startsWith('confession ')) {
      const confessionContent = message.content.substring(11).trim();
      
      if (!confessionContent) {
        return message.reply('❌ Vui lòng nhập nội dung confession!\nFormat: `confession <nội dung>`');
      }

      try {
        const { db } = require('./database/db');
        const { confessionConfigs, confessions } = require('./database/schema');
        const { eq } = require('drizzle-orm');
        const { containsBlacklistedContent } = require('./utils/blacklistFilter');
        
        const userGuilds = [];
        for (const [guildId, guild] of client.guilds.cache) {
          try {
            await guild.members.fetch(message.author.id);
            userGuilds.push(guild);
          } catch (error) {
          }
        }
        
        if (userGuilds.length === 0) {
          return message.reply('❌ Bạn cần phải ở trong ít nhất một server có bot để gửi confession!');
        }

        if (userGuilds.length === 1) {
          const guild = userGuilds[0];
          const serverId = guild.id;

          const blacklistResult = containsBlacklistedContent(confessionContent);
          if (blacklistResult.blocked) {
            return message.reply(`🔒 Confession của bạn chứa nội dung không phù hợp: **${blacklistResult.keyword}**\nVui lòng chỉnh sửa và thử lại!`);
          }

          const config = await db.select()
            .from(confessionConfigs)
            .where(eq(confessionConfigs.serverId, serverId))
            .limit(1);

          if (!config.length || !config[0].channelId || !config[0].isActive) {
            return message.reply(`❌ Server **${guild.name}** chưa setup confession! Admin vui lòng dùng \`/confessionsetup channel\`.`);
          }

          const confessionChannel = await guild.channels.fetch(config[0].channelId);
          if (!confessionChannel) {
            return message.reply(`❌ Kênh confession không tồn tại! Admin vui lòng setup lại.`);
          }

          const result = await db.insert(confessions).values({
            serverId,
            userId: message.author.id,
            content: confessionContent,
            status: 'active'
          }).returning();

          const confessionId = result[0].id;

          const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
          const { getRandomConfessionColor } = require('./commands/confessionHandlers');
          
          const replyButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`confession_reply_${confessionId}`)
                .setLabel(config[0].replyButtonLabel || '💬 Trả lời')
                .setStyle(ButtonStyle.Primary)
            );

          // Tạo embed đẹp cho confession từ DM
          const confessionEmbed = new EmbedBuilder()
            .setTitle(`Anonymous Confession (#${confessionId})`)
            .setDescription(confessionContent)
            .setColor(getRandomConfessionColor())
            .setTimestamp();

          // Post confession vào channel trước
          const confessionMessage = await confessionChannel.send({
            embeds: [confessionEmbed],
            components: [replyButton]
          });

          // Tạo thread từ message đó
          const thread = await confessionMessage.startThread({
            name: `Confession #${confessionId}`,
            autoArchiveDuration: 1440,
            reason: 'Confession từ DM'
          });

          await db.update(confessions)
            .set({ threadId: thread.id })
            .where(eq(confessions.id, confessionId));

          await thread.send({
            content: `💡 **Hướng dẫn trả lời:**\n• Dùng nút "💬 Trả lời" hoặc lệnh \`/reply confession_id:${confessionId}\`\n• Mọi reply sẽ được kiểm duyệt để tránh spam và nội dung 18+\n• Hãy tôn trọng người gửi confession và giữ thái độ lịch sự! 💕`
          });

          return message.reply(`✅ Confession đã được gửi đến **${guild.name}**! ID: #${confessionId}\n📍 Xem tại: ${thread.url}`);
        } else {
          const serverList = userGuilds.map((g, i) => `${i + 1}. ${g.name}`).join('\n');
          return message.reply(`❌ Bạn ở trong nhiều server! Vui lòng dùng \`/confession\` trong server cụ thể hoặc chỉ join một server.\n\n**Servers của bạn:**\n${serverList}`);
        }
      } catch (error) {
        console.error('Error handling DM confession:', error);
        return message.reply('❌ Có lỗi xảy ra khi gửi confession! Vui lòng thử lại sau.');
      }
    }
    
    // Check for Honor of Kings / VGVD queries
    if (isHOKQuery(message.content)) {
      console.log(`🎮 Detected HOK/VGVD query: "${message.content.substring(0, 80)}"`);
      
      await message.channel.sendTyping();
      
      const hokResponse = await createHOKResponse(message.content, openai, searchWeb);
      await message.reply(hokResponse);
      
      // Add cute reactions only if enabled
      if (serverConfig.autoReact !== false) {
        const reactions = ['🎮', '⚔️', '✨'];
        for (const emoji of reactions) {
          try {
            await message.react(emoji);
          } catch (err) {
            // Ignore reaction errors
          }
        }
      }
      
      return;
    }
    
    // Check for video/music search requests (YouTube, TikTok)
    if (isVideoSearchRequest(message.content)) {
      console.log(`🎵 Video/Music search detected: "${message.content.substring(0, 80)}"`);
      const platform = detectPlatform(message.content);
      const contentType = detectContentType(message.content);
      console.log(`📺 Platform: ${platform}, Content Type: ${contentType}`);
      const searchQuery = extractVideoSearchQuery(message.content);
      
      console.log(`🎵 Detected ${contentType} search request - Platform: ${platform}, Query: "${searchQuery}"`);
      
      await message.channel.sendTyping();
      
      let searchResult;
      if (platform === 'youtube') {
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        searchResult = await searchYouTube(searchQuery, youtubeApiKey);
      } else if (platform === 'tiktok') {
        searchResult = await searchTikTok(searchQuery);
      }
      
      const formattedMessage = formatVideoResults(searchResult, contentType);
      await message.reply(formattedMessage);
      
      // Add cute reactions only if enabled
      if (serverConfig.autoReact !== false) {
        const reactions = ['🎵', '🎬', '✨'];
        for (const emoji of reactions) {
          try {
            await message.react(emoji);
          } catch (err) {
            // Ignore reaction errors
          }
        }
      }
      
      return;
    }
    
    // Check for news requests
    const newsCheck = isNewsRequest(message.content);
    // Increase threshold to reduce false positives - only trigger on priority >= 8
    if (newsCheck.isNews && newsCheck.priority >= 8) {
      console.log(`📰 Detected news request - Priority: ${newsCheck.priority}`);
      
      await message.channel.sendTyping();
      
      // Detect category and source (with language support)
      const category = detectCategory(message.content, serverLanguage || 'vi');
      const source = detectSource(message.content);
      
      // Get RSS URL (language-aware)
      const rssUrl = getRssUrl(source, category ? category.category : null, serverLanguage || 'vi');
      const sourceName = getSourceName(source, serverLanguage || 'vi');
      
      console.log(`📰 Fetching news from ${sourceName}${category ? ` - ${category.name}` : ''} (${serverLanguage || 'vi'})`);
      
      try {
        // Fetch news
        const newsResult = await fetchNews(rssUrl, 5);
        
        // Format and send (with language)
        const formattedMessage = formatNewsResults(
          newsResult, 
          sourceName, 
          category ? category.name : null,
          serverLanguage || 'vi'
        );
        
        await message.reply(formattedMessage);
        
        // Add cute reactions only if enabled
        if (serverConfig.autoReact !== false) {
          const reactions = ['📰', '📱', '✨'];
          for (const emoji of reactions) {
            try {
              await message.react(emoji);
            } catch (err) {
              // Ignore reaction errors
            }
          }
        }
        
        return;
      } catch (error) {
        console.error('❌ Error fetching news:', error);
        await message.reply('Ư-ừm... không lấy được tin tức... 🥺 Bạn thử lại sau nhé!');
        return;
      }
    }
    
    // Check for game info requests (builds, combos, guides, tier lists)
    const gameInfo = await handleGameRequest(message.content, searchWeb);
    if (gameInfo) {
      console.log(`🎮 Detected game info request`);
      
      await message.channel.sendTyping();
      
      try {
        await message.reply(gameInfo.message);
        
        // Add reactions only if enabled
        if (serverConfig.autoReact !== false && gameInfo.reactions) {
          for (const emoji of gameInfo.reactions) {
            try {
              await message.react(emoji);
            } catch (err) {
              // Ignore reaction errors
            }
          }
        }
        
        if (gameInfo.metadata) {
          console.log(`🎮 Game Info:`, gameInfo.metadata);
        }
        
        return;
      } catch (error) {
        console.error('❌ Error handling game info:', error);
        // Continue to next processing if game info fails
      }
    }
    
    // Check for sleep command (owner only)
    if (detectSleepCommand(message.content)) {
      return handleSleep(message);
    }
    
    // Check for natural language game triggers
    const gameIntent = detectGameIntent(message.content);
    
    if (gameIntent.detected) {
      console.log(`🎮 Detected natural language game trigger: ${gameIntent.gameType}`);
      
      try {
        switch (gameIntent.gameType) {
          case 'whyQuestions':
            return askWhyQuestion(message);
          case 'trivia':
            return askTriviaQuestion(message);
          case 'wordGuess':
            return startWordGuess(message);
          case 'truthOrDare':
            return playTruthOrDare(message);
          case 'rockPaperScissors':
            await message.reply('🪨📄✂️ Chọn đi! Dùng `!rps rock/paper/scissors` hoặc `!squid rock/paper/scissors/squid` (Squid Game mode)');
            return;
          case 'eightBall':
            const question = extractGameParams(message.content, 'eightBall');
            if (question) {
              return ask8Ball(message, question);
            } else {
              await message.reply('🎱 Hỏi câu gì đi! Ví dụ: "Lena ơi, hỏi quả cầu: hôm nay có may mắn không?"');
              return;
            }
          case 'gif':
            const searchTerm = extractGameParams(message.content, 'gif');
            if (searchTerm) {
              return sendGif(message, searchTerm);
            } else {
              return randomGif(message);
            }
        }
      } catch (gameError) {
        console.error('❌ Lỗi khi chạy game:', gameError);
        // Continue to AI processing if game fails
      }
    }
    
    try {
      const currentMode = serverConfig.mode || 'lena';
      
      // Check for 18+ blacklisted content
      const contentFilterEnabled = serverConfig.contentFilter !== false; // Default true
      if (contentFilterEnabled) {
        const customBlacklist = serverConfig.customBlacklist || [];
        const blacklistCheck = containsBlacklistedContent(message.content, customBlacklist);
        
        if (blacklistCheck.blocked) {
          console.log(`🔒 Blocked 18+ content - keyword: ${blacklistCheck.keyword}`);
          const cuteRejection = getCuteRejectionResponse();
          await message.reply(cuteRejection);
          
          // Log security event
          await logger.logSecurity('🔒 Blocked 18+ Content', {
            user: `${message.author.tag} (${message.author.id})`,
            server: message.guild ? `${message.guild.name} (${message.guild.id})` : 'DM',
            channel: message.channel.name ? `#${message.channel.name} (${message.channel.id})` : 'DM',
            extra: `Keyword: "${blacklistCheck.keyword}"\nMessage: "${message.content.substring(0, 100)}..."`
          });
          
          // Add reactions only if enabled
          if (serverConfig.autoReact !== false) {
            const reactions = ['🙈', '😳', '🥺'];
            for (const emoji of reactions) {
              try {
                await message.react(emoji);
              } catch (err) {
                // Ignore reaction errors
              }
            }
          }
          
          // Log blocked attempt
          if (!isDM) {
            await logConversation({
              serverId,
              channelId,
              userId: message.author.id,
              userMessage: `[BLOCKED 18+] ${message.content}`,
              botResponse: cuteRejection,
              personalityMode: currentMode
            });
          }
          
          return;
        }
      }
      
      const conversationKey = `${serverId}_${channelId}`;
      
      // Check if this is a tutoring question (PRIORITY 1)
      const isTutoring = isTutoringQuestion(message.content);
      const subject = isTutoring ? detectSubject(message.content) : null;
      const level = isTutoring ? detectEducationLevel(message.content) : null;
      
      // Check if code assistance is needed (PRIORITY 2)
      const needsCodeHelp = !isTutoring && isCodeAssistanceNeeded(message.content);
      const assistanceType = needsCodeHelp ? determineAssistanceType(message.content) : null;
      
      if (!conversationHistory.has(conversationKey)) {
        const personality = getPersonalityMode(currentMode);
        let systemPrompt = personality.systemPrompt;
        
        // LANGUAGE SETTING - Add language instruction based on server config
        if (serverLanguage) {
          const languageInstruction = serverLanguage === 'en' 
            ? `\n\n🌍 **MANDATORY LANGUAGE SETTING - HIGHEST PRIORITY:**
You MUST ALWAYS respond in ENGLISH, regardless of what language the user uses.
- If user asks in Vietnamese, Chinese, or any other language → ALWAYS answer in ENGLISH
- If user asks about Vietnamese games (Vương Giả Vinh Diệu/Honor of Kings) → ALWAYS answer in ENGLISH
- Do NOT auto-detect or match the user's language
- Server language is set to ENGLISH, so ALL your responses must be in English
- Maintain your cute Lena personality while speaking English`
            : `\n\n🌍 **CÀI ĐẶT NGÔN NGỮ BẮT BUỘC - ƯU TIÊN CAO NHẤT:**
Bạn PHẢI LUÔN LUÔN trả lời bằng TIẾNG VIỆT, bất kể user dùng ngôn ngữ gì.
- Nếu user hỏi bằng tiếng Anh, Trung, hay ngôn ngữ khác → LUÔN trả lời bằng TIẾNG VIỆT
- Nếu user hỏi về game tiếng Anh (Honor of Kings, League of Legends) → LUÔN trả lời bằng TIẾNG VIỆT
- KHÔNG tự động detect hay khớp ngôn ngữ của user
- Ngôn ngữ server đã set là TIẾNG VIỆT, nên TẤT CẢ câu trả lời phải bằng tiếng Việt
- Giữ tính cách Lena cute khi nói tiếng Việt`;
          systemPrompt += languageInstruction;
          console.log(`🌍 Language setting applied: ${serverLanguage}`);
        }
        
        // IMPORTANT: APPEND enhancement instead of replacing to preserve Lena personality
        // PRIORITY 1: If tutoring needed, append tutor enhancement
        if (isTutoring) {
          console.log(`📚 Tutor mode enhancement (initial) - Subject: ${subject || 'general'}, Level: ${level || 'auto-detect'}`);
          const tutorEnhancement = `\n\n📚 HƯỚNG DẪN BỔ SUNG: User đang hỏi câu hỏi học tập về ${subject || 'chủ đề này'}. Hãy trả lời như một cô giáo Lena cute - giải thích rõ ràng, dễ hiểu, nhưng vẫn giữ giọng điệu nhẹ nhàng, ngại ngùng của mình nha! 🥺📝`;
          systemPrompt += tutorEnhancement;
        }
        // PRIORITY 2: If code assistance needed, append code enhancement
        else if (needsCodeHelp) {
          console.log(`💻 Code assistance enhancement (initial): ${assistanceType}`);
          const codeEnhancement = `\n\n💻 HƯỚNG DẪN BỔ SUNG: User cần giúp về code (${assistanceType}). Hãy giúp user debug/code, nhưng vẫn là Lena cute nhé - giải thích code bằng giọng điệu nhẹ nhàng, thân thiện! 😊✨`;
          systemPrompt += codeEnhancement;
        }
        
        // SPECIAL: If bot is directly mentioned/called, be more enthusiastic!
        if (isDirectlyMentioned) {
          console.log(`💖 Special enhancement (initial) - bot was directly called!`);
          const mentionEnhancement = `\n\n💕 HƯỚNG DẪN ĐẶC BIỆT: User đã chủ động gọi tên/ping mình! Hãy thể hiện sự vui mừng và nhiệt tình hơn bình thường, nhưng vẫn giữ giọng điệu ngại ngùng, dễ thương của Lena nhé! Có thể bắt đầu bằng "Dạ!", "Ơ!", "Alo!", "Dạ có gì ạ?" hoặc emoji cute! 🥰✨`;
          systemPrompt += mentionEnhancement;
        }
        
        // Load history from DB (last 20 exchanges)
        const dbHistory = await loadHistory(message.author.id, channelId, 20);
        
        // Combine system prompt with DB history
        const historyMessages = [
          { role: 'system', content: systemPrompt },
          ...dbHistory
        ];
        
        console.log(`✅ Created new conversation with Lena personality preserved`);
        conversationHistory.set(conversationKey, historyMessages);
      } else if (isTutoring || needsCodeHelp || isDirectlyMentioned) {
        // IMPORTANT: Don't replace system prompt - ADD enhancement instead
        // This preserves Lena's personality and conversation context
        const history = conversationHistory.get(conversationKey);
        const personality = getPersonalityMode(currentMode);
        
        // Add specialized instruction as additional system message instead of replacing
        if (isTutoring) {
          console.log(`📚 Tutor mode enhancement - Subject: ${subject || 'general'}, Level: ${level || 'auto-detect'}`);
          const tutorEnhancement = `\n\n📚 HƯỚNG DẪN BỔ SUNG: User đang hỏi câu hỏi học tập về ${subject || 'chủ đề này'}. Hãy trả lời như một cô giáo Lena cute - giải thích rõ ràng, dễ hiểu, nhưng vẫn giữ giọng điệu nhẹ nhàng, ngại ngùng của mình nha! 🥺📝`;
          history[0].content += tutorEnhancement;
        } else if (needsCodeHelp) {
          console.log(`💻 Code assistance enhancement: ${assistanceType}`);
          const codeEnhancement = `\n\n💻 HƯỚNG DẪN BỔ SUNG: User cần giúp về code (${assistanceType}). Hãy giúp user debug/code, nhưng vẫn là Lena cute nhé - giải thích code bằng giọng điệu nhẹ nhàng, thân thiện! 😊✨`;
          history[0].content += codeEnhancement;
        }
        
        // SPECIAL: If bot is directly mentioned/called, be more enthusiastic!
        if (isDirectlyMentioned) {
          console.log(`💖 Special enhancement - bot was directly called!`);
          const mentionEnhancement = `\n\n💕 HƯỚNG DẪN ĐẶC BIỆT: User đã chủ động gọi tên/ping mình! Hãy thể hiện sự vui mừng và nhiệt tình hơn bình thường, nhưng vẫn giữ giọng điệu ngại ngùng, dễ thương của Lena nhé! Có thể bắt đầu bằng "Dạ!", "Ơ!", "Alo!", "Dạ có gì ạ?" hoặc emoji cute! 🥰✨`;
          history[0].content += mentionEnhancement;
        }
        
        console.log(`✅ Enhanced system prompt while keeping Lena personality`);
      }
      
      console.log(`💬 [${message.author.tag}] Message: "${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}"`);
      console.log(`📊 Current mode: ${currentMode}, Tutor: ${isTutoring}, Code: ${needsCodeHelp}`);
      
      // CHECK ACTIVE GAMES - Priority before AI response
      const userId = message.author.id;
      
      // Check if user has active trivia game
      if (hasActiveTriviaGame(userId, channelId)) {
        console.log(`🎮 Active trivia game - checking answer: "${message.content}"`);
        const result = checkTriviaAnswer(userId, channelId, message.content);
        if (result) {
          if (result.correct) {
            await message.reply(`🎉 **CHÍNH XÁC RỒI!** Đáp án đúng là: **${result.answer}**\n\nBạn giỏi quá! Chơi tiếp nhé! 🏆✨`);
          } else {
            await message.reply(`❌ **Chưa đúng rồi!** Đáp án là: **${result.answer}**\n\nChơi lại bằng lệnh đố vui nhé! 💪`);
          }
          return;
        }
      }
      
      // Check if user has active why question game
      if (hasActiveWhyGame(userId, channelId)) {
        const result = checkWhyAnswer(userId, channelId, message.content);
        if (result) {
          if (result.correct) {
            await message.reply(`🎉 **ĐÚNG RỒI!** Đáp án: **${result.answer}**\n\nBạn thông minh quá! 🌟✨`);
          } else {
            await message.reply(`❌ **Chưa chính xác lắm!** Đáp án đầy đủ là: **${result.answer}**\n\nChơi lại bằng lệnh vì sao nhé! 💡`);
          }
          return;
        }
      }
      
      const history = conversationHistory.get(conversationKey);
      
      const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
      
      history.push({
        role: 'user',
        content: userMessage
      });
      
      // Save user message to DB for persistent storage (7 days)
      await saveMessage(
        message.author.id,
        channelId,
        serverId,
        'user',
        userMessage
      );
      
      // Keep up to 41 messages (system + 20 exchanges) for better context retention
      // This prevents losing the original question when conversation gets longer
      if (history.length > 41) {
        history.splice(1, 2);
      }
      
      // DETERMINISTIC GATING: Force search BEFORE AI call if query needs real-time info
      const shouldForceSearch = needsRealTimeSearch(userMessage);
      
      if (shouldForceSearch) {
        console.log('🔍 Detected real-time query, forcing search...');
        await message.channel.sendTyping();
        
        try {
          const searchQuery = extractSearchQuery(userMessage);
          console.log(`🔎 Search query: "${searchQuery}"`);
          
          const searchResult = await Promise.race([
            searchWeb(searchQuery, serverLanguage), // Pass server language for localized results
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Search timeout')), 10000)
            )
          ]);
          
          console.log(`✅ Search result:`, searchResult.substring(0, 200));
          
          // Inject search result into history as a system message with high priority (localized)
          const searchSystemMsg = serverLanguage === 'en'
            ? `🔍 LATEST INFORMATION from Google Search (MUST use this information to answer):\n\n${searchResult}`
            : `🔍 THÔNG TIN MỚI NHẤT từ Google Search (BẮT BUỘC dùng thông tin này để trả lời):\n\n${searchResult}`;
          
          history.push({
            role: 'system',
            content: searchSystemMsg
          });
        } catch (searchError) {
          console.error('❌ Search error:', searchError);
        }
      }
      
      await message.channel.sendTyping();
      
      console.log(`🤖 Calling OpenAI API with ${history.length} messages in context`);
      console.log(`📝 Last 3 messages: ${history.slice(-3).map(m => `[${m.role}] ${m.content?.substring(0, 50)}...`).join(' | ')}`);
      
      let completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: history,
        max_tokens: 500,
        temperature: 0.8, // Increased for more natural, cute Lena personality
        functions: searchFunctions,
        function_call: 'auto'
      });
      
      console.log(`✅ OpenAI response received (${completion.choices[0].finish_reason})`);
      
      let responseMessage = completion.choices[0].message;
      
      // Handle function calls
      if (responseMessage.function_call) {
        try {
          const functionName = responseMessage.function_call.name;
          const functionArgs = JSON.parse(responseMessage.function_call.arguments);
          
          console.log(`🔧 Gọi function: ${functionName} với args:`, functionArgs);
          
          // Execute the function with timeout (pass server language for localized results)
          const functionResult = await Promise.race([
            executeFunctionCall(functionName, functionArgs, serverLanguage),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Function timeout')), 10000)
            )
          ]);
          
          console.log(`✅ Function result:`, functionResult.substring(0, 200));
          
          // Add function call to history
          history.push(responseMessage);
          
          // Add function result to history
          history.push({
            role: 'function',
            name: functionName,
            content: functionResult
          });
          
          // Get final response from AI with function result
          await message.channel.sendTyping();
          
          completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: history,
            max_tokens: 500,
            temperature: 0.8, // Match main temperature for consistency
          });
          
          responseMessage = completion.choices[0].message;
        } catch (funcError) {
          console.error('❌ Lỗi khi gọi function:', funcError);
          // If function fails, respond without function result
          responseMessage = {
            content: "Ư-ừm... mình gặp chút vấn đề khi tìm kiếm thông tin... 🥺 Bạn có thể hỏi lại hoặc hỏi câu khác được không?"
          };
        }
      }
      
      const reply = responseMessage.content;
      
      console.log(`💬 Lena's response: "${reply.substring(0, 100)}${reply.length > 100 ? '...' : ''}"`);
      
      history.push({
        role: 'assistant',
        content: reply
      });
      
      // Save assistant message to DB for persistent storage (7 days)
      await saveMessage(
        message.author.id,
        channelId,
        serverId,
        'assistant',
        reply
      );
      
      // Add reactions only if autoReact is enabled
      if (serverConfig.autoReact !== false) {
        // Add special cute reaction when bot is directly mentioned/called
        if (isDirectlyMentioned) {
          try {
            const specialReactions = ['💕', '✨', '🥰'];
            const randomReaction = specialReactions[Math.floor(Math.random() * specialReactions.length)];
            await message.react(randomReaction);
            console.log(`💖 Added special reaction (${randomReaction}) - bot was directly called!`);
          } catch (err) {
            // Ignore reaction errors
          }
        }
      }
      
      await message.reply(reply);
      
      // Auto-react only if enabled
      if (serverConfig.autoReact !== false) {
        const reactions = getReactionsForMessage(message.content, currentMode);
        await addReactionsToMessage(message, reactions);
      }
      
      // Log conversation to database
      if (!isDM) {
        await logConversation({
          serverId,
          channelId,
          userId: message.author.id,
          userMessage: message.content,
          botResponse: reply,
          personalityMode: currentMode
        });
      }
      
    } catch (error) {
      console.error('❌ Lỗi khi xử lý tin nhắn:', error);
      
      // Log error to Discord channel
      await logger.logError('Message processing error', error, {
        user: `${message.author.tag} (${message.author.id})`,
        server: message.guild ? `${message.guild.name} (${message.guild.id})` : 'DM',
        channel: message.channel.name ? `#${message.channel.name} (${message.channel.id})` : 'DM',
        extra: `Message: "${message.content.substring(0, 100)}..."`
      });
      
      const config = await getServerConfig(serverId);
      const personality = getPersonalityMode(config.mode || 'lena');
      const errorEmoji = personality.defaultReactions[0] || '🥺';
      await message.reply(`Ư-ừm... m-mình không hiểu lắm... ${errorEmoji} Bạn có thể nói lại được không?`);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    await handleSlashCommand(interaction, conversationHistory, openai);
  } else if (interaction.isButton()) {
    if (interaction.customId === 'send_confession' ||
        interaction.customId.startsWith('confession_reply_') || 
        interaction.customId.startsWith('confession_clear_confirm_') ||
        interaction.customId.startsWith('confession_clear_cancel_')) {
      const { handleConfessionButton } = require('./commands/confessionHandlers');
      await handleConfessionButton(interaction);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'send_confession_modal' ||
        interaction.customId.startsWith('confession_reply_modal_')) {
      const { handleConfessionModal } = require('./commands/confessionHandlers');
      await handleConfessionModal(interaction);
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'automessages_system') {
      const { handleAutoMessagesSystem } = require('./commands/autoMessageSettings');
      await handleAutoMessagesSystem(interaction);
    } else if (interaction.customId === 'automessages_action') {
      const { handleAutoMessagesAction } = require('./commands/autoMessageSettings');
      await handleAutoMessagesAction(interaction);
    } else if (interaction.customId === 'announcements_system') {
      const { handleAnnouncementsSystemSelect } = require('./commands/announcementsSystem');
      await handleAnnouncementsSystemSelect(interaction);
    } else if (interaction.customId === 'announcements_action') {
      const { handleAnnouncementsActionSelect } = require('./commands/announcementsSystem');
      await handleAnnouncementsActionSelect(interaction);
    }
  } else if (interaction.isChannelSelectMenu()) {
    if (interaction.customId.startsWith('automessages_')) {
      const { handleChannelSelection } = require('./commands/autoMessageSettings');
      await handleChannelSelection(interaction);
    } else if (interaction.customId.startsWith('announcements_')) {
      const { handleAnnouncementsChannelSelect } = require('./commands/announcementsSystem');
      await handleAnnouncementsChannelSelect(interaction);
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      return;
    }
  }
  
  const { handleGiveawayReaction } = require('./commands/giveawayHandlers');
  await handleGiveawayReaction(reaction, user);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      return;
    }
  }
  
  const { handleGiveawayReactionRemove } = require('./commands/giveawayHandlers');
  await handleGiveawayReactionRemove(reaction, user);
});

// Log when bot joins a server
client.on('guildCreate', async (guild) => {
  console.log(`✅ Bot joined server: ${guild.name} (${guild.id})`);
  await logger.logEvent('🎉 Bot Joined Server', {
    server: `${guild.name} (${guild.id})`,
    extra: `Members: ${guild.memberCount}\nOwner: <@${guild.ownerId}>`
  });
});

// Log when bot leaves/kicked from a server
client.on('guildDelete', async (guild) => {
  console.log(`❌ Bot left server: ${guild.name} (${guild.id})`);
  await logger.logEvent('👋 Bot Left Server', {
    server: `${guild.name} (${guild.id})`,
    extra: `Members: ${guild.memberCount}\nOwner: <@${guild.ownerId}>`
  });
});

client.on('guildMemberAdd', async (member) => {
  // Check autoban rules first
  const autobanResult = await checkMemberJoinAutoban(member, db);
  
  if (autobanResult && autobanResult.shouldBan) {
    try {
      if (member.bannable) {
        await member.ban({
          reason: `[AutoBan] ${autobanResult.reason}`,
          deleteMessageSeconds: 0
        });
        
        console.log(`🔨 [AutoBan] Banned ${member.user.tag} from ${member.guild.name}: ${autobanResult.reason}`);
        
        // Log the ban
        await logAction(member.guild, db, 'memberBan', {
          user: member.user.tag,
          moderator: 'AutoBan System',
          reason: autobanResult.reason
        });
        
        return; // Stop processing - user is banned
      }
    } catch (error) {
      console.error(`[AutoBan] Failed to ban ${member.user.tag}:`, error);
    }
  }
  
  await sendWelcomeMessage(member);
  
  // Auto Roles
  await autoRolesMemberJoin(member, db);
  
  // Timed Roles (delayed assignment)
  await timedRolesMemberJoin(member);
  
  // Action Log
  const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
  await logAction(member.guild, db, 'memberJoin', {
    user: member.user.tag,
    created: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
    accountAge: accountAge,
    avatar: member.user.displayAvatarURL({ size: 128 })
  });
});

// Reaction Role Events
client.on('messageReactionAdd', async (reaction, user) => {
  await handleReactionAdd(reaction, user);
});

client.on('messageReactionRemove', async (reaction, user) => {
  await handleReactionRemove(reaction, user);
});

client.on('guildMemberRemove', async (member) => {
  await sendLeaveMessage(member);
  
  // Track roles for auto-reassign
  await autoRolesMemberLeave(member, db);
  
  // Reset auto-ban infractions
  autoBanMemberLeave(member.guild.id, member.id);
  
  // Action Log
  const roles = member.roles.cache.map(r => r.name).join(', ') || 'None';
  await logAction(member.guild, db, 'memberLeave', {
    user: member.user.tag,
    roles: roles,
    avatar: member.user.displayAvatarURL({ size: 128 })
  });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const hadBoost = oldMember.premiumSince;
  const hasBoost = newMember.premiumSince;
  
  if (!hadBoost && hasBoost) {
    await sendBoostMessage(newMember);
  }

  // Log role changes
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;
  
  const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
  const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

  for (const [roleId, role] of addedRoles) {
    await logAction(newMember.guild, db, 'memberRoleAdd', {
      user: newMember.user.tag,
      role: role.name,
      moderator: 'System'
    });
  }

  for (const [roleId, role] of removedRoles) {
    await logAction(newMember.guild, db, 'memberRoleRemove', {
      user: newMember.user.tag,
      role: role.name,
      moderator: 'System'
    });
  }

  // Log nickname changes
  if (oldMember.nickname !== newMember.nickname) {
    await logAction(newMember.guild, db, 'nicknameChange', {
      user: newMember.user.tag,
      before: oldMember.nickname || oldMember.user.username,
      after: newMember.nickname || newMember.user.username
    });
  }

  // Log timeout changes
  if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
    if (newMember.communicationDisabledUntil) {
      const duration = Math.round((newMember.communicationDisabledUntil - Date.now()) / 1000 / 60);
      await logAction(newMember.guild, db, 'memberTimeout', {
        user: newMember.user.tag,
        duration: `${duration} minutes`,
        reason: 'Timeout applied',
        moderator: 'System'
      });
    }
  }
});

client.on('messageDelete', async (message) => {
  if (message.author?.bot) return;
  if (!message.guild) return;
  
  // Get member roles if available
  const member = message.member;
  const memberRoles = member ? Array.from(member.roles.cache.keys()) : [];
  
  // Check for images
  const hasImages = message.attachments.size > 0 && message.attachments.some(a => a.contentType?.startsWith('image/'));
  
  if (hasImages) {
    await logAction(message.guild, db, 'imageDelete', {
      author: message.author?.tag || 'Unknown',
      channel: message.channel.toString(),
      attachmentCount: message.attachments.size,
      imageUrl: message.attachments.first()?.url,
      channelId: message.channel.id,
      memberRoles: memberRoles
    });
  }
  
  await logAction(message.guild, db, 'messageDelete', {
    author: message.author?.tag || 'Unknown',
    channel: message.channel.toString(),
    content: message.content?.substring(0, 500) || 'No content',
    channelId: message.channel.id,
    memberRoles: memberRoles
  });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (newMessage.author?.bot) return;
  if (!newMessage.guild) return;
  if (oldMessage.content === newMessage.content) return;
  
  await logAction(newMessage.guild, db, 'messageEdit', {
    author: newMessage.author?.tag || 'Unknown',
    channel: newMessage.channel.toString(),
    before: oldMessage.content?.substring(0, 200) || 'No content',
    after: newMessage.content?.substring(0, 200) || 'No content'
  });
});

client.on('guildBanAdd', async (ban) => {
  await logAction(ban.guild, db, 'memberBan', {
    user: ban.user.tag,
    reason: ban.reason || 'No reason provided',
    moderator: 'System'
  });
});

client.on('guildBanRemove', async (ban) => {
  await logAction(ban.guild, db, 'memberUnban', {
    user: ban.user.tag,
    moderator: 'System'
  });
});

// Role Events
client.on('roleCreate', async (role) => {
  await logAction(role.guild, db, 'roleCreate', {
    role: role.name,
    moderator: 'System'
  });
});

client.on('roleDelete', async (role) => {
  await logAction(role.guild, db, 'roleDelete', {
    role: role.name,
    moderator: 'System'
  });
});

client.on('roleUpdate', async (oldRole, newRole) => {
  const changes = [];
  if (oldRole.name !== newRole.name) changes.push(`Name: ${oldRole.name} → ${newRole.name}`);
  if (oldRole.color !== newRole.color) changes.push(`Color changed`);
  if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) changes.push(`Permissions changed`);
  
  if (changes.length > 0) {
    await logAction(newRole.guild, db, 'roleUpdate', {
      role: newRole.name,
      changes: changes.join(', ')
    });
  }
});

// Channel Events
client.on('channelCreate', async (channel) => {
  if (!channel.guild) return;
  await logAction(channel.guild, db, 'channelCreate', {
    channel: channel.name,
    channelType: channel.type,
    moderator: 'System'
  });
});

client.on('channelDelete', async (channel) => {
  if (!channel.guild) return;
  await logAction(channel.guild, db, 'channelDelete', {
    channel: channel.name,
    channelType: channel.type,
    moderator: 'System'
  });
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
  if (!newChannel.guild) return;
  const changes = [];
  if (oldChannel.name !== newChannel.name) changes.push(`Name: ${oldChannel.name} → ${newChannel.name}`);
  if (oldChannel.topic !== newChannel.topic) changes.push(`Topic changed`);
  if (oldChannel.nsfw !== newChannel.nsfw) changes.push(`NSFW: ${oldChannel.nsfw} → ${newChannel.nsfw}`);
  
  if (changes.length > 0) {
    await logAction(newChannel.guild, db, 'channelUpdate', {
      channel: newChannel.name,
      changes: changes.join(', ')
    });
  }
});

// Emoji Events
client.on('emojiCreate', async (emoji) => {
  await logAction(emoji.guild, db, 'emojiCreate', {
    emoji: emoji.toString(),
    name: emoji.name,
    moderator: 'System'
  });
});

client.on('emojiDelete', async (emoji) => {
  await logAction(emoji.guild, db, 'emojiDelete', {
    emoji: emoji.toString(),
    name: emoji.name
  });
});

client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
  if (oldEmoji.name !== newEmoji.name) {
    await logAction(newEmoji.guild, db, 'emojiUpdate', {
      emoji: newEmoji.toString(),
      before: oldEmoji.name,
      after: newEmoji.name
    });
  }
});

// Voice Events
client.on('voiceStateUpdate', async (oldState, newState) => {
  const member = newState.member || oldState.member;
  const guild = newState.guild || oldState.guild;
  
  // User joined a voice channel
  if (!oldState.channel && newState.channel) {
    await logAction(guild, db, 'voiceJoin', {
      user: member.user.tag,
      channel: newState.channel.name
    });
  }
  
  // User left a voice channel
  if (oldState.channel && !newState.channel) {
    await logAction(guild, db, 'voiceLeave', {
      user: member.user.tag,
      channel: oldState.channel.name
    });
  }
  
  // User moved to a different voice channel
  if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
    await logAction(guild, db, 'voiceMove', {
      user: member.user.tag,
      from: oldState.channel.name,
      to: newState.channel.name
    });
  }
});

// Bulk Delete Events
client.on('messageDeleteBulk', async (messages) => {
  const firstMessage = messages.first();
  if (!firstMessage || !firstMessage.guild) return;
  
  await logAction(firstMessage.guild, db, 'bulkDelete', {
    channel: firstMessage.channel.toString(),
    count: messages.size,
    moderator: 'System'
  });
});

// Invite Events
client.on('inviteCreate', async (invite) => {
  if (!invite.guild) return;
  
  await logAction(invite.guild, db, 'inviteLog', {
    type: 'Created',
    code: invite.code,
    creator: invite.inviter?.tag || 'Unknown'
  });
});

client.on('inviteDelete', async (invite) => {
  if (!invite.guild) return;
  
  await logAction(invite.guild, db, 'inviteLog', {
    type: 'Deleted',
    code: invite.code,
    creator: 'Unknown'
  });
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
  logger.logError('Discord client error', error);
});

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('❌ Lỗi: Thiếu DISCORD_BOT_TOKEN trong environment variables!');
  console.log('📝 Vui lòng thêm token Discord bot của bạn vào Secrets với key: DISCORD_BOT_TOKEN');
  process.exit(1);
}

client.login(DISCORD_TOKEN).catch((error) => {
  console.error('❌ Không thể đăng nhập bot:', error.message);
  console.log('📝 Kiểm tra lại DISCORD_BOT_TOKEN và quyền của bot');
  process.exit(1);
});
