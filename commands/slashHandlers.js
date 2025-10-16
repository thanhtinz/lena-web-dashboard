const {
  handleSetMode,
  handleConfig,
  handleClearHistory,
  handleHelp
} = require('./adminCommands');
const { playTruthOrDare, askTruth, giveDare } = require('../games/truthOrDare');
const { playRockPaperScissors, playSquidGameRPS } = require('../games/rockPaperScissors');
const { ask8Ball } = require('../games/eightBall');
const { sendGif, randomGif } = require('../utils/external/gifSearch');
const { analyzeImage } = require('../utils/external/imageAnalysis');
const {
  handleConfession,
  handleReply,
  handleConfessionSetup,
  handleConfessionPanel
} = require('./confessionHandlers');
const {
  handleGiveawayCreate,
  handleGiveawayEnd,
  handleGiveawayReroll,
  handleGiveawayList,
  handleGiveawayBlacklist,
  handleGiveawayUnblacklist,
  handleGiveawayListBan,
  handleGiveawayFlash
} = require('./giveawayHandlers');
const {
  handleBan,
  handleUnban,
  handleKick,
  handleMute,
  handleUnmute,
  handleWarning,
  handleUnwarning,
  handleWarnings,
  handleModSetup,
  handleLock,
  handleUnlock,
  handleSlowmode,
  handlePurge,
  handleNuke
} = require('./moderationHandlers');
const {
  handleEmbedCreate,
  handleEmbedDelete,
  handleEmbedList,
  handleEmbedShow,
  handleEmbedSend,
  handleEmbedEdit
} = require('./embedHandlers');
const { announcementsCommand } = require('./announcementsSystem');
const {
  handleGitHub,
  handlePokemon,
  handleItunes,
  handleWhois,
  handlePoll
} = require('./funCommands');
const {
  handlePremiumCommand,
  handleSubscriptionsCommand,
  handlePremiumFeaturesCommand
} = require('./premiumCommands');
const {
  handleStatus,
  handleShardLookup
} = require('./statusCommands');

async function handleSlashCommand(interaction, conversationHistory, openai) {
  const { commandName } = interaction;
  
  try {
    // Defer reply for commands that might take time
    const deferredCommands = ['help', 'status', 'premium', 'subscriptions', 'premium-features'];
    if (deferredCommands.includes(commandName)) {
      try {
        // Check if interaction is still valid before deferring
        if (!interaction.replied && !interaction.deferred) {
          await interaction.deferReply();
        }
      } catch (deferError) {
        console.error(`❌ Failed to defer reply for ${commandName}:`, deferError.message);
        // Continue execution even if defer fails
      }
    }

    switch (commandName) {
      case 'help':
        // Create a message-like object for handleHelp
        const helpMessage = {
          member: interaction.member,
          author: interaction.user,
          guild: interaction.guild,
          reply: async (content) => {
            try {
              if (interaction.deferred) {
                return await interaction.editReply(content);
              } else if (!interaction.replied) {
                return await interaction.reply(content);
              }
            } catch (replyError) {
              console.error('Failed to reply to help command:', replyError.message);
              return null;
            }
          }
        };
        await handleHelp(helpMessage, []);
        break;
      
      case 'setmode':
        const mode = interaction.options.getString('mode');
        const setModeMessage = {
          member: interaction.member,
          guild: interaction.guild,
          reply: async (content) => await interaction.reply(content)
        };
        await handleSetMode(setModeMessage, mode ? [mode] : [], conversationHistory);
        break;
      
      case 'config':
        const configMessage = {
          member: interaction.member,
          guild: interaction.guild,
          reply: async (content) => await interaction.reply(content)
        };
        await handleConfig(configMessage);
        break;
      
      case 'clearhistory':
        const clearMessage = {
          member: interaction.member,
          guild: interaction.guild,
          channel: interaction.channel,
          reply: async (content) => await interaction.reply(content)
        };
        await handleClearHistory(clearMessage, conversationHistory);
        break;
      
      case 'truthordare':
        const todMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await playTruthOrDare(todMessage);
        break;
      
      case 'truth':
        const truthMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await askTruth(truthMessage);
        break;
      
      case 'dare':
        const dareMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await giveDare(dareMessage);
        break;
      
      case 'rps':
        const rpsChoice = interaction.options.getString('choice');
        const rpsMessage = {
          author: { username: interaction.user.username },
          reply: async (content) => await interaction.reply(content)
        };
        await playRockPaperScissors(rpsMessage, rpsChoice);
        break;
      
      case 'squid':
        const squidChoice = interaction.options.getString('choice');
        const squidMessage = {
          author: { username: interaction.user.username },
          reply: async (content) => await interaction.reply(content)
        };
        await playSquidGameRPS(squidMessage, squidChoice);
        break;
      
      case '8ball':
        const question = interaction.options.getString('question');
        const ballMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await ask8Ball(ballMessage, question);
        break;
      
      case 'gif':
        const keyword = interaction.options.getString('keyword');
        const gifMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await sendGif(gifMessage, keyword);
        break;
      
      case 'randomgif':
        const rgifMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await randomGif(rgifMessage);
        break;
      
      case 'analyze':
        const attachment = interaction.options.getAttachment('image');
        const analyzeQuestion = interaction.options.getString('question');
        
        if (!attachment.contentType?.startsWith('image/')) {
          return await interaction.reply('❌ Vui lòng đính kèm một hình ảnh hợp lệ!');
        }
        
        await interaction.deferReply();
        
        try {
          const analysis = await analyzeImage(openai, attachment.url, analyzeQuestion);
          await interaction.editReply(`🔍 **Phân tích hình ảnh:**\n\n${analysis}`);
        } catch (error) {
          console.error('Error analyzing image:', error);
          await interaction.editReply('❌ Có lỗi khi phân tích hình ảnh. Vui lòng thử lại! 🥺');
        }
        break;
      
      case 'confession':
        await handleConfession(interaction);
        break;
      
      case 'reply':
        await handleReply(interaction);
        break;
      
      case 'confessionsetup':
        await handleConfessionSetup(interaction);
        break;
      
      case 'confession-panel':
        await handleConfessionPanel(interaction);
        break;
      
      case 'giveaway':
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
          case 'create':
            await handleGiveawayCreate(interaction);
            break;
          case 'end':
            await handleGiveawayEnd(interaction);
            break;
          case 'reroll':
            await handleGiveawayReroll(interaction);
            break;
          case 'list':
            await handleGiveawayList(interaction);
            break;
          case 'blacklist':
            await handleGiveawayBlacklist(interaction);
            break;
          case 'unblacklist':
            await handleGiveawayUnblacklist(interaction);
            break;
          case 'listban':
            await handleGiveawayListBan(interaction);
            break;
          case 'flash':
            await handleGiveawayFlash(interaction);
            break;
        }
        break;
      
      case 'ban':
        await handleBan(interaction);
        break;
      
      case 'unban':
        await handleUnban(interaction);
        break;
      
      case 'kick':
        await handleKick(interaction);
        break;
      
      case 'mute':
        await handleMute(interaction);
        break;
      
      case 'unmute':
        await handleUnmute(interaction);
        break;
      
      case 'warn':
        await handleWarning(interaction);
        break;
      
      case 'unwarn':
        await handleUnwarning(interaction);
        break;
      
      case 'warnings':
        await handleWarnings(interaction);
        break;
      
      case 'modsetup':
        await handleModSetup(interaction);
        break;
      
      case 'lock':
        await handleLock(interaction);
        break;
      
      case 'unlock':
        await handleUnlock(interaction);
        break;
      
      case 'slowmode':
        await handleSlowmode(interaction);
        break;
      
      case 'purge':
        await handlePurge(interaction);
        break;
      
      case 'nuke':
        await handleNuke(interaction);
        break;
      
      case 'embed': {
        const embedSubcommand = interaction.options.getSubcommand();
        
        switch (embedSubcommand) {
          case 'create':
            await handleEmbedCreate(interaction);
            break;
          case 'delete':
            await handleEmbedDelete(interaction);
            break;
          case 'list':
            await handleEmbedList(interaction);
            break;
          case 'show':
            await handleEmbedShow(interaction);
            break;
          case 'send':
            await handleEmbedSend(interaction);
            break;
          default:
            // All edit subcommands (editall, editauthor, editcolor, etc.)
            await handleEmbedEdit(interaction);
            break;
        }
        break;
      }
      
      case 'response': {
        const { 
          handleResponseAddSlash, 
          handleResponseListSlash, 
          handleResponseDeleteSlash 
        } = require('./responseHandlers');
        
        const responseSubcommand = interaction.options.getSubcommand();
        
        switch (responseSubcommand) {
          case 'add':
            await handleResponseAddSlash(interaction);
            break;
          case 'list':
            await handleResponseListSlash(interaction);
            break;
          case 'delete':
            await handleResponseDeleteSlash(interaction);
            break;
        }
        break;
      }
      
      case 'github':
        const repo = interaction.options.getString('repo');
        const githubMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await handleGitHub(githubMessage, [repo]);
        break;
      
      case 'pokemon':
        const pokemonName = interaction.options.getString('name');
        const pokemonMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await handlePokemon(pokemonMessage, [pokemonName]);
        break;
      
      case 'itunes':
        const songName = interaction.options.getString('song');
        const itunesMessage = {
          reply: async (content) => await interaction.reply(content)
        };
        await handleItunes(itunesMessage, songName.split(' '));
        break;
      
      case 'whois':
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const whoisMessage = {
          author: interaction.user,
          guild: interaction.guild,
          client: interaction.client,
          reply: async (content) => await interaction.reply(content)
        };
        await handleWhois(whoisMessage, [targetUser.id]);
        break;
      
      case 'poll':
        const pollQuestion = interaction.options.getString('question');
        const pollDuration = interaction.options.getInteger('duration');
        const pollChoices = [];
        for (let i = 1; i <= 10; i++) {
          const choice = interaction.options.getString(`choice${i}`);
          if (choice) pollChoices.push(choice);
        }
        
        // Format like prefix command: "Question" "Choice1" "Choice2"
        const formattedArgs = [`"${pollQuestion}"`, ...pollChoices.map(c => `"${c}"`)];
        const pollMessage = {
          author: interaction.user,
          channel: interaction.channel,
          guild: interaction.guild,
          client: interaction.client,
          reply: async (content) => await interaction.reply(content)
        };
        await handlePoll(pollMessage, formattedArgs, pollDuration);
        break;
      
      case 'announcements':
        await announcementsCommand.execute(interaction);
        break;
      
      case 'premium':
        const premiumMessage = {
          author: interaction.user,
          reply: async (content) => {
            try {
              if (interaction.deferred) {
                return await interaction.editReply(content);
              } else if (!interaction.replied) {
                return await interaction.reply(content);
              }
            } catch (err) {
              console.error('Failed to reply to premium command:', err.message);
              return null;
            }
          }
        };
        await handlePremiumCommand(premiumMessage);
        break;
      
      case 'subscriptions':
        const subsMessage = {
          author: interaction.user,
          reply: async (content) => {
            try {
              if (interaction.deferred) {
                return await interaction.editReply(content);
              } else if (!interaction.replied) {
                return await interaction.reply(content);
              }
            } catch (err) {
              console.error('Failed to reply to subscriptions command:', err.message);
              return null;
            }
          }
        };
        await handleSubscriptionsCommand(subsMessage);
        break;
      
      case 'premium-features':
        const featuresMessage = {
          reply: async (content) => {
            try {
              if (interaction.deferred) {
                return await interaction.editReply(content);
              } else if (!interaction.replied) {
                return await interaction.reply(content);
              }
            } catch (err) {
              console.error('Failed to reply to premium-features command:', err.message);
              return null;
            }
          }
        };
        await handlePremiumFeaturesCommand(featuresMessage);
        break;
      
      case 'status':
        const statusMessage = {
          reply: async (content) => {
            try {
              if (interaction.deferred) {
                return await interaction.editReply(content);
              } else if (!interaction.replied) {
                return await interaction.reply(content);
              }
            } catch (err) {
              console.error('Failed to reply to status command:', err.message);
              return null;
            }
          },
          guild: interaction.guild
        };
        await handleStatus(statusMessage, interaction.client);
        break;
      
      case 'shard':
        const serverId = interaction.options.getString('server_id');
        const shardMessage = {
          reply: async (content) => await interaction.reply(content),
          client: interaction.client
        };
        await handleShardLookup(shardMessage, serverId);
        break;
      
      default:
        await interaction.reply('❌ Lệnh không tồn tại!');
    }
  } catch (error) {
    console.error('Error handling slash command:', error);
    
    try {
      if (interaction.deferred) {
        await interaction.editReply('❌ Có lỗi xảy ra khi xử lý lệnh!');
      } else if (!interaction.replied) {
        await interaction.reply('❌ Có lỗi xảy ra khi xử lý lệnh!');
      }
    } catch (replyError) {
      console.error('Failed to send error message:', replyError.message);
    }
  }
}

module.exports = { handleSlashCommand };
