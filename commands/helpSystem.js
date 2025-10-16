const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { getServerConfig } = require('../database/configService');

// Command categories with details
const commandCategories = {
  ai: {
    name: {
      vi: '<:lena_ai:1427368195844739223> AI & Trò chuyện',
      en: '<:lena_ai:1427368195844739223> AI & Chat'
    },
    description: {
      vi: 'Chat với Lena, phân tích ảnh, tìm kiếm',
      en: 'Chat with Lena, image analysis, search'
    },
    commands: [
      { 
        name: '@Lena / lena', 
        desc: { vi: 'Trò chuyện với Lena', en: 'Chat with Lena' }, 
        usage: '@Lena <message>' 
      },
      { 
        name: '/analyze', 
        desc: { vi: 'Phân tích hình ảnh với AI', en: 'Analyze images with AI' }, 
        usage: '/analyze image:<file> [question:<text>]' 
      },
      { 
        name: 'confession <content>', 
        desc: { vi: 'Gửi confession qua DM', en: 'Send confession via DM' }, 
        usage: 'DM: confession <content>' 
      }
    ]
  },
  games: {
    name: {
      vi: '<:lena_game:1427369792586649681> Trò chơi & Giải trí',
      en: '<:lena_game:1427369792586649681> Games & Entertainment'
    },
    description: {
      vi: 'Games, đố vui, trivia',
      en: 'Games, puzzles, trivia'
    },
    commands: [
      { name: '/truthordare', desc: { vi: 'Truth or Dare', en: 'Truth or Dare' }, usage: '/truthordare' },
      { name: '/truth', desc: { vi: 'Chỉ Truth', en: 'Truth only' }, usage: '/truth' },
      { name: '/dare', desc: { vi: 'Chỉ Dare', en: 'Dare only' }, usage: '/dare' },
      { name: '/rps', desc: { vi: 'Rock Paper Scissors', en: 'Rock Paper Scissors' }, usage: '/rps choice:<rock/paper/scissors>' },
      { name: '/squid', desc: { vi: 'Squid Game RPS', en: 'Squid Game RPS' }, usage: '/squid choice:<rock/paper/scissors/squid>' },
      { name: '/8ball', desc: { vi: 'Hỏi quả cầu số 8', en: 'Ask the magic 8-ball' }, usage: '/8ball question:<question>' },
      { name: '/gif', desc: { vi: 'Tìm GIF', en: 'Search GIF' }, usage: '/gif keyword:<keyword>' },
      { name: '/randomgif', desc: { vi: 'GIF ngẫu nhiên', en: 'Random GIF' }, usage: '/randomgif' },
      { name: 'đố vui / brain teaser', desc: { vi: '📚 60+ câu đố trí tuệ Việt Nam', en: '📚 60+ Vietnamese brain teasers' }, usage: { vi: 'Chat: đố vui / hack não / trivia', en: 'Chat: brain teaser / trivia / riddle' } },
      { name: 'vì sao / why questions', desc: { vi: '📚 10 vạn câu hỏi vì sao', en: '📚 100k why questions' }, usage: { vi: 'Chat: vì sao / hỏi vì sao', en: 'Chat: why questions / ask me why' } },
      { name: 'đoán từ / word guess', desc: { vi: '🎯 Game đoán từ tiếng Việt', en: '🎯 Vietnamese word guessing game' }, usage: { vi: 'Chat: đoán từ / game chữ', en: 'Chat: word guess / guess the word' } }
    ]
  },
  actions: {
    name: {
      vi: '✨ Actions & Roleplay',
      en: '✨ Actions & Roleplay'
    },
    description: {
      vi: 'Anime GIF actions (70+ hành động)',
      en: 'Anime GIF actions (70+ actions)'
    },
    commands: [
      { name: '{prefix}hug / {prefix}kiss / {prefix}pat', desc: { vi: '70+ anime action GIFs', en: '70+ anime action GIFs' }, usage: '{prefix}<action> [@user]' },
      { name: 'Popular actions', desc: { vi: 'hug, kiss, pat, slap, bite, poke, cuddle, wave, smile, blush, cry, dance, laugh...', en: 'hug, kiss, pat, slap, bite, poke, cuddle, wave, smile, blush, cry, dance, laugh...' }, usage: '{prefix}help actions' }
    ]
  },
  confession: {
    name: {
      vi: '<:lena_confession:1427372591982841966> Confession',
      en: '<:lena_confession:1427372591982841966> Confession'
    },
    description: {
      vi: 'Hệ thống confession ẩn danh',
      en: 'Anonymous confession system'
    },
    commands: [
      { name: '/confession', desc: { vi: 'Gửi confession', en: 'Send confession' }, usage: '/confession content:<content>', permission: null },
      { name: '/reply', desc: { vi: 'Reply confession', en: 'Reply confession' }, usage: '/reply confession_id:<id> content:<content>', permission: null },
      { name: '/confessionsetup', desc: { vi: 'Setup confession (Admin)', en: 'Setup confession (Admin)' }, usage: '/confessionsetup <channel/remove/buttons/status/clear>', permission: 'Admin' }
    ]
  },
  giveaway: {
    name: {
      vi: '<:lena_giveaway:1427372827450802206> Giveaway',
      en: '<:lena_giveaway:1427372827450802206> Giveaway'
    },
    description: {
      vi: 'Quản lý giveaway và sự kiện',
      en: 'Manage giveaways and events'
    },
    commands: [
      { name: '/giveaway create', desc: { vi: 'Tạo giveaway', en: 'Create giveaway' }, usage: '/giveaway create duration:<1h> prize:<prize> [winners:<count>] [role:<role>]', permission: 'Admin' },
      { name: '/giveaway end', desc: { vi: 'Kết thúc giveaway', en: 'End giveaway' }, usage: '/giveaway end giveaway_id:<id>', permission: 'Admin' },
      { name: '/giveaway reroll', desc: { vi: 'Chọn lại winner', en: 'Reroll winner' }, usage: '/giveaway reroll giveaway_id:<id>', permission: 'Admin' },
      { name: '/giveaway list', desc: { vi: 'Xem giveaway đang chạy', en: 'View active giveaways' }, usage: '/giveaway list', permission: null },
      { name: '/giveaway blacklist', desc: { vi: 'Blacklist user', en: 'Blacklist user' }, usage: '/giveaway blacklist user:<@user> [reason:<reason>]', permission: 'Admin' },
      { name: '/giveaway flash', desc: { vi: 'Tạo nhiều GA cùng lúc', en: 'Create multiple giveaways' }, usage: '/giveaway flash count:<1-10> duration:<1h> prize:<text>', permission: 'Admin' }
    ]
  },
  moderation: {
    name: {
      vi: '🛡️ Moderation',
      en: '🛡️ Moderation'
    },
    description: {
      vi: 'Quản lý và điều hành server',
      en: 'Server management and moderation'
    },
    commands: [
      { name: '/ban', desc: { vi: 'Ban user', en: 'Ban user' }, usage: '/ban user:<@user> [reason:<reason>] [delete_messages:<0-7>]', permission: 'BanMembers' },
      { name: '/unban', desc: { vi: 'Unban user', en: 'Unban user' }, usage: '/unban user_id:<id> [reason:<reason>]', permission: 'BanMembers' },
      { name: '/kick', desc: { vi: 'Kick user', en: 'Kick user' }, usage: '/kick user:<@user> [reason:<reason>]', permission: 'KickMembers' },
      { name: '/mute', desc: { vi: 'Mute user', en: 'Mute user' }, usage: '/mute user:<@user> duration:<minutes> [reason:<reason>]', permission: 'ModerateMembers' },
      { name: '/unmute', desc: { vi: 'Unmute user', en: 'Unmute user' }, usage: '/unmute user:<@user> [reason:<reason>]', permission: 'ModerateMembers' },
      { name: '/warn', desc: { vi: 'Warn user', en: 'Warn user' }, usage: '/warn user:<@user> [reason:<reason>]', permission: 'ModerateMembers' },
      { name: '/unwarn', desc: { vi: 'Xóa warning', en: 'Remove warning' }, usage: '/unwarn warning_id:<id> [reason:<reason>]', permission: 'ModerateMembers' },
      { name: '/warnings', desc: { vi: 'Xem warnings', en: 'View warnings' }, usage: '/warnings user:<@user>', permission: null },
      { name: '/modsetup', desc: { vi: 'Setup log channel', en: 'Setup log channel' }, usage: '/modsetup <logchannel/remove>', permission: 'Admin' },
      { name: '/lock', desc: { vi: '🔒 Khóa channel (chặn gửi tin nhắn)', en: '🔒 Lock channel (prevent messaging)' }, usage: '/lock [channel:<#channel>] [reason:<text>]', permission: 'ManageChannels' },
      { name: '/unlock', desc: { vi: '🔓 Mở khóa channel', en: '🔓 Unlock channel' }, usage: '/unlock [channel:<#channel>] [reason:<text>]', permission: 'ManageChannels' },
      { name: '/slowmode', desc: { vi: '⏱️ Đặt slowmode (0-21600s = 6h)', en: '⏱️ Set slowmode (0-21600s = 6h)' }, usage: '/slowmode seconds:<0-21600> [channel:<#channel>] [reason:<text>]', permission: 'ManageChannels' },
      { name: '/purge', desc: { vi: '🗑️ Xóa tin nhắn (1-100)', en: '🗑️ Delete messages (1-100)' }, usage: '/purge amount:<1-100> [user:<@user>]', permission: 'ManageMessages' },
      { name: '/nuke', desc: { vi: '💣 Nuke channel (clone + xóa cũ)', en: '💣 Nuke channel (clone + delete old)' }, usage: '/nuke', permission: 'ManageChannels' }
    ]
  },
  roles: {
    name: {
      vi: '🎭 Role Management',
      en: '🎭 Role Management'
    },
    description: {
      vi: 'Quản lý role toàn diện (CRUD + Bulk)',
      en: 'Comprehensive role management (CRUD + Bulk)'
    },
    commands: [
      { name: '{prefix}role create <name>', desc: { vi: 'Tạo role mới', en: 'Create new role' }, usage: '{prefix}role create VIP | color=#FFD700 | hoist=yes', permission: 'ManageRoles' },
      { name: '{prefix}role delete @role', desc: { vi: 'Xóa role', en: 'Delete role' }, usage: '{prefix}role delete @VIP', permission: 'ManageRoles' },
      { name: '{prefix}role color @role <color>', desc: { vi: 'Đổi màu role', en: 'Change role color' }, usage: '{prefix}role color @VIP #FF0000', permission: 'ManageRoles' },
      { name: '{prefix}role edit @role <property> <value>', desc: { vi: 'Chỉnh sửa role', en: 'Edit role' }, usage: '{prefix}role edit @VIP name New Name', permission: 'ManageRoles' },
      { name: '{prefix}role info @role', desc: { vi: 'Xem thông tin role', en: 'View role info' }, usage: '{prefix}role info @VIP', permission: null },
      { name: '{prefix}role add @user @role', desc: { vi: 'Gán role cho user', en: 'Add role to user' }, usage: '{prefix}role add @User @VIP', permission: 'ManageRoles' },
      { name: '{prefix}role remove @user @role', desc: { vi: 'Gỡ role khỏi user', en: 'Remove role from user' }, usage: '{prefix}role remove @User @VIP', permission: 'ManageRoles' },
      { name: '{prefix}role removeall @user', desc: { vi: 'Gỡ tất cả role', en: 'Remove all roles' }, usage: '{prefix}role removeall @User', permission: 'ManageRoles' },
      { name: '{prefix}role all @role', desc: { vi: 'Gán role cho tất cả', en: 'Give role to all' }, usage: '{prefix}role all @VIP', permission: 'ManageRoles' },
      { name: '{prefix}role humans @role', desc: { vi: 'Gán role cho người dùng', en: 'Give role to humans' }, usage: '{prefix}role humans @VIP', permission: 'ManageRoles' },
      { name: '{prefix}role bots @role', desc: { vi: 'Gán role cho bot', en: 'Give role to bots' }, usage: '{prefix}role bots @VIP', permission: 'ManageRoles' },
      { name: '{prefix}role in @role1 @role2', desc: { vi: 'Gán role2 cho ai có role1', en: 'Give role2 to users with role1' }, usage: '{prefix}role in @Member @VIP', permission: 'ManageRoles' },
      { name: '{prefix}role rall @role', desc: { vi: 'Gỡ role khỏi tất cả', en: 'Remove role from all' }, usage: '{prefix}role rall @VIP', permission: 'ManageRoles' }
    ]
  },
  utility: {
    name: {
      vi: '<:lena_utility:1427371817798209547> Tiện ích',
      en: '<:lena_utility:1427371817798209547> Utility'
    },
    description: {
      vi: 'Lệnh hỗ trợ và thông tin',
      en: 'Helpful commands and info'
    },
    commands: [
      { name: '{prefix}ping', desc: { vi: 'Kiểm tra ping/latency bot', en: 'Check bot ping/latency' }, usage: '{prefix}ping' },
      { name: '/status / {prefix}status', desc: { vi: 'Xem trạng thái bot, shard, cluster', en: 'View bot, shard, cluster status' }, usage: '/status / {prefix}status' },
      { name: '/shard / {prefix}shard', desc: { vi: 'Tìm shard của server', en: 'Find server shard' }, usage: '/shard server_id:<id> / {prefix}shard <id>' },
      { name: '{prefix}afk', desc: { vi: 'Đặt trạng thái AFK', en: 'Set AFK status' }, usage: '{prefix}afk [reason]' },
      { name: '{prefix}avatar / {prefix}av', desc: { vi: 'Xem avatar user', en: 'View user avatar' }, usage: '{prefix}avatar [@user/id]' },
      { name: '{prefix}banner', desc: { vi: 'Xem banner user', en: 'View user banner' }, usage: '{prefix}banner [@user/id]' },
      { name: '{prefix}serverinfo', desc: { vi: 'Thông tin server', en: 'Server information' }, usage: '{prefix}serverinfo' },
      { name: '{prefix}info / {prefix}botinfo', desc: { vi: 'Thông tin bot', en: 'Bot information' }, usage: '{prefix}info' },
      { name: '{prefix}uptime', desc: { vi: 'Bot uptime', en: 'Bot uptime' }, usage: '{prefix}uptime' },
      { name: '{prefix}premium', desc: { vi: 'Premium info (DM)', en: 'Premium info (DM)' }, usage: '{prefix}premium' },
      { name: '{prefix}roll / {prefix}dice', desc: { vi: 'Ném xúc xắc', en: 'Roll dice' }, usage: '{prefix}roll [count]d[sides]' },
      { name: '{prefix}whois', desc: { vi: 'Xem user info chi tiết', en: 'View detailed user info' }, usage: '{prefix}whois [@user/id]' },
      { name: '{prefix}membercount', desc: { vi: 'Số lượng thành viên', en: 'Member count' }, usage: '{prefix}membercount' },
      { name: '⚡ Aliases', desc: { vi: 'lga=giveaway | conf=config | emb=embed | resp=response | bl=blacklist', en: 'lga=giveaway | conf=config | emb=embed | resp=response | bl=blacklist' }, usage: '{prefix}help setprefix' }
    ]
  },
  fun: {
    name: {
      vi: '🎉 Fun Commands',
      en: '🎉 Fun Commands'
    },
    description: {
      vi: 'Lệnh vui vẻ và giải trí',
      en: 'Fun and entertaining commands'
    },
    commands: [
      { name: '{prefix}flip / {prefix}flipcoin', desc: { vi: 'Tung đồng xu', en: 'Flip a coin' }, usage: '{prefix}flip' },
      { name: '{prefix}randomcolor', desc: { vi: 'Màu ngẫu nhiên với preview', en: 'Random color with preview' }, usage: '{prefix}randomcolor' },
      { name: '{prefix}space', desc: { vi: 'Thông tin trạm vũ trụ ISS', en: 'ISS space station info' }, usage: '{prefix}space' },
      { name: '{prefix}dadjoke', desc: { vi: 'Dad joke ngẫu nhiên', en: 'Random dad joke' }, usage: '{prefix}dadjoke' },
      { name: '{prefix}norris', desc: { vi: 'Chuck Norris fact', en: 'Chuck Norris fact' }, usage: '{prefix}norris' },
      { name: '{prefix}cat', desc: { vi: 'Ảnh mèo dễ thương', en: 'Cute cat picture' }, usage: '{prefix}cat' },
      { name: '{prefix}dog', desc: { vi: 'Ảnh chó dễ thương', en: 'Cute dog picture' }, usage: '{prefix}dog' },
      { name: '{prefix}pug', desc: { vi: 'Ảnh chó pug dễ thương', en: 'Cute pug picture' }, usage: '{prefix}pug' },
      { name: '{prefix}pokemon <name>', desc: { vi: 'Thông tin Pokemon từ PokeAPI', en: 'Pokemon info from PokeAPI' }, usage: '{prefix}pokemon pikachu' },
      { name: '{prefix}itunes <song>', desc: { vi: 'Tìm kiếm bài hát trên iTunes', en: 'Search songs on iTunes' }, usage: '{prefix}itunes Shape of You' },
      { name: '{prefix}poll', desc: { vi: 'Tạo poll với reactions và tự động kết thúc', en: 'Create poll with reactions and auto-end' }, usage: '{prefix}poll "Question" "Choice1" "Choice2" [minutes]' },
      { name: '{prefix}whois [@user]', desc: { vi: 'Xem thông tin user chi tiết', en: 'View detailed user info' }, usage: '{prefix}whois [@user/id]' },
      { name: '{prefix}membercount', desc: { vi: 'Đếm số thành viên server', en: 'Count server members' }, usage: '{prefix}membercount' },
      { name: '{prefix}github <repo>', desc: { vi: 'Thông tin GitHub repo', en: 'GitHub repo info' }, usage: '{prefix}github owner/repo' }
    ]
  },
  admin: {
    name: {
      vi: '<:lena_confing:1427373655519789238> Admin & Config',
      en: '<:lena_confing:1427373655519789238> Admin & Config'
    },
    description: {
      vi: 'Cấu hình bot và server',
      en: 'Bot and server configuration'
    },
    commands: [
      { name: '/setmode', desc: { vi: 'Đổi personality mode', en: 'Change personality mode' }, usage: '/setmode [mode:<lena/support/technical/learning/developer/anime>]', permission: 'Admin' },
      { name: '{prefix}setprefix', desc: { vi: 'Đổi prefix lệnh', en: 'Change command prefix' }, usage: '{prefix}setprefix <prefix>', permission: 'Admin' },
      { name: '/config', desc: { vi: 'Xem cấu hình server', en: 'View server configuration' }, usage: '/config', permission: 'Admin' },
      { name: '/clearhistory', desc: { vi: 'Xóa lịch sử chat kênh', en: 'Clear channel chat history' }, usage: '/clearhistory', permission: 'Admin' },
      { name: '{prefix}setchannel', desc: { vi: 'Quản lý kênh được phép', en: 'Manage allowed channels' }, usage: '{prefix}setchannel <add/remove/clear/list> [id]', permission: 'Admin' },
      { name: '{prefix}addkeyword', desc: { vi: 'Thêm keyword auto reply', en: 'Add keyword auto reply' }, usage: '{prefix}addkeyword <word> <reply>', permission: 'Admin' },
      { name: '{prefix}removekeyword', desc: { vi: 'Xóa keyword', en: 'Remove keyword' }, usage: '{prefix}removekeyword <word>', permission: 'Admin' },
      { name: '{prefix}listkeywords', desc: { vi: 'Xem keywords', en: 'View keywords' }, usage: '{prefix}listkeywords', permission: 'Admin' },
      { name: '{prefix}train', desc: { vi: 'Train bot với Q&A', en: 'Train bot with Q&A' }, usage: '{prefix}train <add/list/delete/toggle> ...', permission: 'Admin' },
      { name: '/embed', desc: { vi: 'Quản lý custom embeds', en: 'Manage custom embeds' }, usage: '/embed <create/delete/list/show/send/edit...>', permission: 'Admin' },
      { name: '/response', desc: { vi: 'Custom response với embed', en: 'Custom response with embed' }, usage: '/response <add/list/delete>', permission: 'Admin' },
      { name: '/announcements', desc: { vi: '📢 Unified announcement system (Welcome/Leave/Boost)', en: '📢 Unified announcement system (Welcome/Leave/Boost)' }, usage: '/announcements <welcome|leave|boost|overview>', permission: 'Admin' },
      { name: '!blacklist', desc: { vi: 'Quản lý 18+ filter', en: 'Manage 18+ filter' }, usage: '!blacklist <add/remove/list/toggle> ...', permission: 'Admin' }
    ]
  }
};

// Detailed command help (unchanged from original)
const commandHelp = {
  'ban': {
    name: '/ban',
    description: 'Ban một user khỏi server',
    usage: '/ban user:<@user> [reason:<lý do>] [delete_messages:<0-7 ngày>]',
    permission: 'BanMembers',
    examples: [
      '/ban user:@User reason:Spam',
      '/ban user:@User delete_messages:7 reason:Vi phạm quy định'
    ],
    notes: [
      'User sẽ nhận DM thông báo',
      'Có thể xóa tin nhắn trong 0-7 ngày gần đây',
      'Không thể ban người có role cao hơn'
    ]
  },
  'mute': {
    name: '/mute',
    description: 'Mute một user trong khoảng thời gian',
    usage: '/mute user:<@user> duration:<phút> [reason:<lý do>]',
    permission: 'ModerateMembers',
    examples: [
      '/mute user:@User duration:30 reason:Spam',
      '/mute user:@User duration:1440 reason:Toxic (1 ngày)'
    ],
    notes: [
      'Duration: 5 phút → 7 ngày (10080 phút)',
      'User sẽ nhận DM thông báo',
      'Sử dụng timeout của Discord'
    ]
  },
  'warn': {
    name: '/warn',
    description: 'Warn một user và lưu vào database',
    usage: '/warn user:<@user> [reason:<lý do>]',
    permission: 'ModerateMembers',
    examples: [
      '/warn user:@User reason:Vi phạm quy định',
      '/warn user:@User'
    ],
    notes: [
      'Warnings được lưu vào database',
      'User sẽ nhận DM với tổng warnings (x/5)',
      'Xem warnings: /warnings user:<@user>'
    ]
  },
  'lock': {
    name: '/lock',
    description: {
      vi: '🔒 Khóa channel (chặn gửi tin nhắn)',
      en: '🔒 Lock channel (prevent messaging)'
    },
    usage: '/lock [channel:<#channel>] [reason:<text>]',
    permission: 'ManageChannels',
    examples: [
      '/lock reason:Emergency lockdown',
      '/lock channel:#general reason:Spam attack',
      '/lock (khóa channel hiện tại)'
    ],
    notes: [
      'Chặn @everyone gửi tin nhắn (permission SendMessages)',
      'Nếu không chọn channel, sẽ khóa channel hiện tại',
      'Moderator vẫn có thể gửi tin nhắn',
      'Log vào moderation channel nếu đã setup',
      'Có thể enable/disable lệnh trong web dashboard'
    ]
  },
  'unlock': {
    name: '/unlock',
    description: {
      vi: '🔓 Mở khóa channel',
      en: '🔓 Unlock channel'
    },
    usage: '/unlock [channel:<#channel>] [reason:<text>]',
    permission: 'ManageChannels',
    examples: [
      '/unlock reason:Resolved',
      '/unlock channel:#general reason:Issue fixed',
      '/unlock (mở khóa channel hiện tại)'
    ],
    notes: [
      'Trả lại quyền SendMessages cho @everyone',
      'Nếu không chọn channel, sẽ mở khóa channel hiện tại',
      'Log vào moderation channel nếu đã setup',
      'Có thể enable/disable lệnh trong web dashboard'
    ]
  },
  'slowmode': {
    name: '/slowmode',
    description: {
      vi: '⏱️ Đặt slowmode (giới hạn tốc độ chat)',
      en: '⏱️ Set slowmode (rate limit)'
    },
    usage: '/slowmode seconds:<0-21600> [channel:<#channel>] [reason:<text>]',
    permission: 'ManageChannels',
    examples: [
      '/slowmode seconds:10 reason:Prevent spam',
      '/slowmode seconds:0 (tắt slowmode)',
      '/slowmode seconds:300 channel:#general (5 phút)',
      '/slowmode seconds:21600 (6 giờ - tối đa)'
    ],
    notes: [
      'Giới hạn: 0-21600 giây (0 = tắt, max = 6 giờ)',
      '0 = Tắt slowmode',
      '10 = User chỉ gửi được 1 tin nhắn mỗi 10 giây',
      'Moderator không bị ảnh hưởng bởi slowmode',
      'Log vào moderation channel nếu đã setup',
      'Có thể enable/disable lệnh trong web dashboard'
    ]
  },
  'purge': {
    name: '/purge',
    description: {
      vi: '🗑️ Xóa tin nhắn hàng loạt (bulk delete)',
      en: '🗑️ Bulk delete messages'
    },
    usage: '/purge amount:<1-100> [user:<@user>]',
    permission: 'ManageMessages',
    examples: [
      '/purge amount:50 (xóa 50 tin nhắn gần nhất)',
      '/purge amount:20 user:@Spammer (xóa 20 tin nhắn của user)',
      '/purge amount:100 (xóa tối đa 100 tin nhắn)'
    ],
    notes: [
      'Giới hạn: 1-100 tin nhắn',
      'Chỉ xóa được tin nhắn dưới 14 ngày (giới hạn Discord API)',
      'Nếu chọn user, chỉ xóa tin nhắn của user đó',
      'Log vào moderation channel nếu đã setup',
      'Có thể enable/disable lệnh trong web dashboard'
    ]
  },
  'nuke': {
    name: '/nuke',
    description: {
      vi: '💣 Nuke channel (clone channel mới + xóa cũ)',
      en: '💣 Nuke channel (clone new + delete old)'
    },
    usage: '/nuke',
    permission: 'ManageChannels',
    examples: [
      '/nuke (nuke channel hiện tại)',
      'Lưu ý: Thao tác này không thể hoàn tác!'
    ],
    notes: [
      'Tạo channel mới giống hệt (tên, topic, permissions, position)',
      'Xóa toàn bộ channel cũ (tất cả tin nhắn bị mất)',
      'Không thể hoàn tác - sử dụng cẩn thận!',
      'Channel ID sẽ thay đổi (vì là channel mới)',
      'Log vào moderation channel nếu đã setup',
      'Có thể enable/disable lệnh trong web dashboard'
    ]
  },
  'giveaway': {
    name: '/giveaway',
    description: 'Hệ thống quản lý giveaway hoàn chỉnh',
    usage: '/giveaway <create/end/reroll/list/blacklist/flash>',
    permission: 'Admin (trừ list)',
    examples: [
      '/giveaway create duration:1h prize:Nitro winners:3',
      '!lga create 1h 3 Nitro (dùng alias)',
      '/giveaway flash count:5 duration:30m prize:Phần thưởng {n}',
      '!lga end 1 (dùng alias)',
      '/giveaway end giveaway_id:1'
    ],
    notes: [
      '⚡ Aliases (biến tắt): !lga = !giveaway',
      'Ví dụ: !lga create 1h 3 Nitro',
      '',
      'Tham gia bằng cách react 🎉 vào message giveaway',
      'Auto-end sau khi hết thời gian',
      'Có thể yêu cầu role để tham gia',
      'Flash: tạo nhiều GA cùng lúc, dùng {n} cho số thứ tự'
    ]
  },
  'confession': {
    name: '/confession',
    description: 'Hệ thống confession ẩn danh',
    usage: '/confession content:<nội dung>',
    permission: null,
    examples: [
      '/confession content:Tớ thích bạn lắm...',
      'DM bot: confession Tớ muốn thú nhận...'
    ],
    notes: [
      'Hoàn toàn ẩn danh (cả confession và reply)',
      'Có thể gửi qua DM: confession <nội dung>',
      'Reply được kiểm duyệt 18+ tự động',
      'Admin setup: /confessionsetup',
      'Xóa toàn bộ confession: /confessionsetup clear'
    ]
  },
  'setmode': {
    name: '/setmode',
    description: 'Đổi personality mode của Lena',
    usage: '/setmode [mode:<lena/support/technical/learning/developer/anime>]',
    permission: 'Admin',
    examples: [
      '/setmode mode:learning',
      '/setmode (xem danh sách modes)'
    ],
    notes: [
      'Lena: Cute & nhút nhát (mặc định)',
      'Support: Chuyên nghiệp',
      'Technical: Chuyên gia kỹ thuật',
      'Learning: Gia sư học tập',
      'Developer: Lập trình viên',
      'Anime: Otaku fan'
    ]
  },
  'setprefix': {
    name: '!setprefix',
    description: {
      vi: 'Thay đổi prefix lệnh của server',
      en: 'Change server command prefix'
    },
    usage: '!setprefix <prefix mới>',
    permission: 'Admin',
    examples: [
      '!setprefix ?',
      '!setprefix lena',
      '!setprefix .'
    ],
    notes: [
      'Prefix có thể là 1-3 ký tự hoặc chữ',
      'Mặc định: !',
      'Tất cả lệnh sẽ dùng prefix mới',
      'Ví dụ: Prefix "?" → ?help, ?ping, ?ban...',
      '',
      '⚡ **COMMAND ALIASES (biến tắt):**',
      '',
      '📦 Giveaway:',
      '  !lga = !giveaway',
      '  Ví dụ: !lga create 1h 3 Nitro',
      '',
      '⚙️ Config & Admin:',
      '  !conf = !config',
      '  !emb = !embed',
      '  !resp = !response',
      '  !bl = !blacklist',
      '',
      '🔄 Chuyển đổi nhanh giữa các lệnh dài!',
      'Tất cả aliases đều hoạt động như lệnh gốc'
    ]
  }
};

function isAdmin(member) {
  return member && member.permissions.has(PermissionFlagsBits.Administrator);
}

function createCategoryEmbed(categoryKey, isUserAdmin, serverPrefix = '!', lang = 'vi') {
  const category = commandCategories[categoryKey];
  
  // Get localized name and description
  const categoryName = typeof category.name === 'object' ? category.name[lang] : category.name;
  const categoryDesc = typeof category.description === 'object' ? category.description[lang] : category.description;
  
  const embed = new EmbedBuilder()
    .setTitle(`${categoryName}`)
    .setDescription(categoryDesc)
    .setColor(getCategoryColor(categoryKey))
    .setTimestamp();

  let commandList = '';
  category.commands.forEach(cmd => {
    // Hide admin commands from non-admins
    if (cmd.permission === 'Admin' && !isUserAdmin) return;
    
    // Replace {prefix} placeholder with actual server prefix
    const cmdName = cmd.name.replace(/{prefix}/g, serverPrefix);
    
    // Get localized usage (handle both string and object)
    let cmdUsage = typeof cmd.usage === 'object' ? (cmd.usage[lang] || cmd.usage.vi || cmd.usage) : cmd.usage;
    if (typeof cmdUsage === 'string') {
      cmdUsage = cmdUsage.replace(/{prefix}/g, serverPrefix);
    }
    
    // Get localized description
    const cmdDesc = typeof cmd.desc === 'object' ? (cmd.desc[lang] || cmd.desc.vi) : cmd.desc;
    
    const permBadge = cmd.permission ? ` \`[${cmd.permission}]\`` : '';
    commandList += `**${cmdName}**${permBadge}\n${cmdDesc}\n\n`;
  });

  if (commandList) {
    embed.addFields({ 
      name: lang === 'en' ? 'Commands' : 'Lệnh', 
      value: commandList 
    });
  }

  const footerText = lang === 'en'
    ? `💡 Use ${serverPrefix}help <command> for details | Server prefix: ${serverPrefix} (changeable)`
    : `💡 Dùng ${serverPrefix}help <lệnh> để xem chi tiết | Prefix server: ${serverPrefix} (có thể thay đổi)`;
  embed.setFooter({ text: footerText });

  return embed;
}

function getCategoryColor(categoryKey) {
  const colors = {
    ai: 0x5865F2,
    games: 0xFEE75C,
    actions: 0xF47FFF,
    fun: 0xFF69B4,
    utility: 0x00D9FF,
    confession: 0xEB459E,
    giveaway: 0x57F287,
    moderation: 0xED4245,
    admin: 0x9B59B6
  };
  return colors[categoryKey] || 0x5865F2;
}

function createMainHelpEmbed(isUserAdmin, serverPrefix = '!', lang = 'vi') {
  const isEn = lang === 'en';
  
  const embed = new EmbedBuilder()
    .setTitle(isEn ? '🌸 Lena Bot - Help' : '🌸 Lena Bot - Trợ giúp')
    .setDescription(isEn ? 'Hi! I\'m Lena, a multi-purpose AI bot with many features! 😊' : 'Chào bạn! Mình là Lena, bot AI đa năng với nhiều tính năng! 😊')
    .setColor(0xEB459E)
    .setTimestamp();

  // Dynamically build categories list from commandCategories object
  const categoryKeys = ['ai', 'games', 'actions', 'fun', 'utility', 'confession', 'giveaway', 'moderation'];
  const categories = categoryKeys.map(key => {
    const cat = commandCategories[key];
    const name = typeof cat.name === 'object' ? cat.name[lang] : cat.name;
    const desc = typeof cat.description === 'object' ? cat.description[lang] : cat.description;
    return `${name.replace(/\*\*/g, '')} - ${desc}`;
  });
  
  // Add admin category if user is admin
  if (isUserAdmin) {
    const adminCat = commandCategories['admin'];
    const adminName = typeof adminCat.name === 'object' ? adminCat.name[lang] : adminCat.name;
    const adminDesc = typeof adminCat.description === 'object' ? adminCat.description[lang] : adminCat.description;
    categories.push(`${adminName.replace(/\*\*/g, '')} - ${adminDesc}`);
  }

  embed.addFields({
    name: isEn ? '📋 Categories' : '📋 Danh mục',
    value: categories.join('\n')
  });

  embed.addFields({
    name: isEn ? '📖 How to Use' : '📖 Cách sử dụng',
    value: isEn 
      ? `• Use the dropdown menu below to view each category\n• Use \`${serverPrefix}help <command>\` to view command details\n• Example: \`${serverPrefix}help ban\`, \`${serverPrefix}help giveaway\`\n\n⚡ **Aliases:** \`${serverPrefix}lga\` = giveaway | \`${serverPrefix}conf\` = config | \`${serverPrefix}emb\` = embed | \`${serverPrefix}resp\` = response | \`${serverPrefix}bl\` = blacklist`
      : `• Dùng menu dropdown bên dưới để xem từng danh mục\n• Dùng \`${serverPrefix}help <lệnh>\` để xem chi tiết lệnh\n• Ví dụ: \`${serverPrefix}help ban\`, \`${serverPrefix}help giveaway\`\n\n⚡ **Aliases (biến tắt):** \`${serverPrefix}lga\` = giveaway | \`${serverPrefix}conf\` = config | \`${serverPrefix}emb\` = embed | \`${serverPrefix}resp\` = response | \`${serverPrefix}bl\` = blacklist`
  });

  embed.addFields({
    name: isEn ? '🔧 Server Prefix' : '🔧 Prefix Server',
    value: isEn
      ? `Current prefix: \`${serverPrefix}\`\n*Admins can change prefix with: \`${serverPrefix}setprefix <new prefix>\`*`
      : `Prefix hiện tại: \`${serverPrefix}\`\n*Admin có thể đổi prefix bằng: \`${serverPrefix}setprefix <prefix mới>\`*`
  });

  return embed;
}

function createDropdownMenu(currentPage, isUserAdmin, lang = 'vi') {
  const categories = ['ai', 'games', 'actions', 'fun', 'utility', 'confession', 'giveaway', 'moderation'];
  if (isUserAdmin) {
    categories.push('admin');
  }

  // Custom emoji mapping
  const emojiMap = {
    ai: { id: '1427368195844739223', name: 'lena_ai' },
    games: { id: '1427369792586649681', name: 'lena_game' },
    actions: '✨',
    utility: { id: '1427371817798209547', name: 'lena_utility' },
    confession: { id: '1427372591982841966', name: 'lena_confession' },
    giveaway: { id: '1427372827450802206', name: 'lena_giveaway' },
    moderation: '🛡️',
    admin: { id: '1427373655519789238', name: 'lena_confing' }
  };

  const options = [
    new StringSelectMenuOptionBuilder()
      .setLabel(lang === 'en' ? '🏠 Home' : '🏠 Trang chủ')
      .setDescription(lang === 'en' ? 'Return to home' : 'Quay về trang chủ')
      .setValue('help_main')
      .setEmoji('🏠')
      .setDefault(currentPage === 'main')
  ];

  categories.forEach(cat => {
    const category = commandCategories[cat];
    const emoji = emojiMap[cat] || (typeof category.name === 'string' ? category.name.split(' ')[0] : '📋');
    
    // Get localized name and description
    const categoryName = typeof category.name === 'object' ? category.name[lang] : category.name;
    const categoryDesc = typeof category.description === 'object' ? category.description[lang] : category.description;
    
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(categoryName.replace(/<:[^:]+:\d+>/g, '').replace(/\*\*/g, '').trim())
      .setDescription(categoryDesc)
      .setValue(`help_${cat}`)
      .setDefault(currentPage === cat);
    
    if (typeof emoji === 'string') {
      option.setEmoji(emoji);
    } else if (emoji.id && emoji.name) {
      option.setEmoji({ id: emoji.id, name: emoji.name });
    }
    
    options.push(option);
  });

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder(lang === 'en' ? 'Select a category' : 'Chọn một danh mục')
      .addOptions(options)
  );
}

function handleCommandHelp(message, commandName, serverPrefix, lang = 'vi') {
  const help = commandHelp[commandName.toLowerCase()];
  
  if (!help) {
    const errorMsg = lang === 'en'
      ? `❌ Command \`${commandName}\` not found! Use \`${serverPrefix}help\` to see all commands.`
      : `❌ Không tìm thấy lệnh \`${commandName}\`! Dùng \`${serverPrefix}help\` để xem tất cả lệnh.`;
    return message.reply(errorMsg);
  }

  const embed = new EmbedBuilder()
    .setTitle(help.name)
    .setDescription(typeof help.description === 'object' ? help.description[lang] : help.description)
    .setColor(0x5865F2)
    .addFields(
      { 
        name: lang === 'en' ? 'Usage' : 'Cách dùng', 
        value: `\`${help.usage.replace(/{prefix}/g, serverPrefix)}\`` 
      }
    );

  if (help.permission) {
    embed.addFields({ 
      name: lang === 'en' ? 'Required Permission' : 'Quyền yêu cầu', 
      value: `\`${help.permission}\`` 
    });
  }

  if (help.examples && help.examples.length > 0) {
    embed.addFields({
      name: lang === 'en' ? '📝 Examples' : '📝 Ví dụ',
      value: help.examples.map(ex => `\`${ex.replace(/{prefix}/g, serverPrefix)}\``).join('\n')
    });
  }

  if (help.notes && help.notes.length > 0) {
    embed.addFields({
      name: lang === 'en' ? '💡 Notes' : '💡 Ghi chú',
      value: help.notes.join('\n')
    });
  }

  embed.setFooter({ text: `Prefix: ${serverPrefix}` });
  
  return message.reply({ embeds: [embed] });
}

async function handleHelp(message, args) {
  const serverConfig = await getServerConfig(message.guild.id);
  const isUserAdmin = isAdmin(message.member);
  const serverPrefix = serverConfig?.prefix || '!';
  const serverLang = serverConfig?.language || 'vi';

  // Check if user wants specific command help
  if (args && args.length > 0) {
    const commandName = args[0].toLowerCase();
    return handleCommandHelp(message, commandName, serverPrefix, serverLang);
  }

  // Show main help with dropdown
  const mainEmbed = createMainHelpEmbed(isUserAdmin, serverPrefix, serverLang);
  const dropdown = createDropdownMenu('main', isUserAdmin, serverLang);

  const helpMessage = await message.reply({
    embeds: [mainEmbed],
    components: [dropdown]
  });

  // Listen for dropdown selections
  const collector = helpMessage.createMessageComponentCollector({ 
    time: 300000 // 5 minutes
  });

  collector.on('collect', async interaction => {
    if (interaction.user.id !== message.author.id) {
      const errorMsg = serverLang === 'en' 
        ? '❌ Only the command user can use this menu!' 
        : '❌ Chỉ người dùng lệnh mới có thể dùng menu!';
      return interaction.reply({ content: errorMsg, ephemeral: true });
    }

    const action = interaction.values[0].replace('help_', '');

    let embed, newDropdown;

    if (action === 'main') {
      embed = createMainHelpEmbed(isUserAdmin, serverPrefix, serverLang);
      newDropdown = createDropdownMenu('main', isUserAdmin, serverLang);
    } else {
      embed = createCategoryEmbed(action, isUserAdmin, serverPrefix, serverLang);
      newDropdown = createDropdownMenu(action, isUserAdmin, serverLang);
    }

    await interaction.update({
      embeds: [embed],
      components: [newDropdown]
    });
  });

  collector.on('end', () => {
    helpMessage.edit({ components: [] }).catch(() => {});
  });
}

module.exports = { handleHelp };
