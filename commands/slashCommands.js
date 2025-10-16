const { SlashCommandBuilder } = require('discord.js');
const { announcementsCommand } = require('./announcementsSystem');

const slashCommands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Xem hướng dẫn sử dụng bot'),
  
  new SlashCommandBuilder()
    .setName('setmode')
    .setDescription('[Admin] Đổi personality mode')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Chọn mode')
        .setRequired(false)
        .addChoices(
          { name: 'Lena - Cute & Nhút nhát', value: 'lena' },
          { name: 'Hỗ trợ - Chuyên nghiệp', value: 'support' },
          { name: 'Kỹ thuật - Chuyên gia', value: 'technical' },
          { name: 'Học tập - Gia sư', value: 'learning' },
          { name: 'Developer - Lập trình viên', value: 'developer' },
          { name: 'Anime Fan - Otaku', value: 'anime' }
        )),
  
  new SlashCommandBuilder()
    .setName('config')
    .setDescription('[Admin] Xem cấu hình server'),
  
  new SlashCommandBuilder()
    .setName('clearhistory')
    .setDescription('[Admin] Xóa lịch sử trò chuyện kênh hiện tại'),
  
  new SlashCommandBuilder()
    .setName('truthordare')
    .setDescription('Chơi Truth or Dare'),
  
  new SlashCommandBuilder()
    .setName('truth')
    .setDescription('Nhận câu hỏi Truth'),
  
  new SlashCommandBuilder()
    .setName('dare')
    .setDescription('Nhận thử thách Dare'),
  
  new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Rock Paper Scissors')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Chọn của bạn')
        .setRequired(true)
        .addChoices(
          { name: '✊ Rock', value: 'rock' },
          { name: '✋ Paper', value: 'paper' },
          { name: '✌️ Scissors', value: 'scissors' }
        )),
  
  new SlashCommandBuilder()
    .setName('squid')
    .setDescription('Squid Game RPS')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Chọn của bạn')
        .setRequired(true)
        .addChoices(
          { name: '✊ Rock', value: 'rock' },
          { name: '✋ Paper', value: 'paper' },
          { name: '✌️ Scissors', value: 'scissors' },
          { name: '🦑 Squid (thắng tất!)', value: 'squid' }
        )),
  
  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Hỏi quả cầu thần số 8')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Câu hỏi của bạn')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Tìm và gửi GIF')
    .addStringOption(option =>
      option.setName('keyword')
        .setDescription('Từ khóa tìm kiếm')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('randomgif')
    .setDescription('Gửi GIF ngẫu nhiên'),
  
  new SlashCommandBuilder()
    .setName('analyze')
    .setDescription('Phân tích hình ảnh với AI')
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Hình ảnh cần phân tích')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Câu hỏi về hình ảnh (tùy chọn)')
        .setRequired(false)),
  
  new SlashCommandBuilder()
    .setName('confession')
    .setDescription('Gửi confession ẩn danh')
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Nội dung confession của bạn')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('reply')
    .setDescription('Trả lời confession (cần kiểm duyệt)')
    .addIntegerOption(option =>
      option.setName('confession_id')
        .setDescription('ID của confession (xem trong thread)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Nội dung trả lời')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('confessionsetup')
    .setDescription('[Admin] Cài đặt hệ thống confession')
    .addSubcommand(subcommand =>
      subcommand
        .setName('channel')
        .setDescription('Đặt kênh gửi confession')
        .addChannelOption(option =>
          option.setName('target')
            .setDescription('Kênh để gửi confession threads')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Xóa kênh confession'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('buttons')
        .setDescription('Tùy chỉnh tên nút')
        .addStringOption(option =>
          option.setName('confession_button')
            .setDescription('Tên nút Gửi Confession')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('reply_button')
            .setDescription('Tên nút Trả lời')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Xem trạng thái cấu hình'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('[Admin] Xóa toàn bộ confession history')),
  
  new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Quản lý giveaway')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('[Admin] Tạo giveaway mới')
        .addStringOption(option =>
          option.setName('duration')
            .setDescription('Thời gian (vd: 1h, 30m, 1d)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('prize')
            .setDescription('Phần thưởng')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('winners')
            .setDescription('Số người thắng (mặc định: 1)')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('required_role')
            .setDescription('Role yêu cầu (tùy chọn)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('[Admin] Kết thúc giveaway')
        .addIntegerOption(option =>
          option.setName('giveaway_id')
            .setDescription('ID của giveaway')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('reroll')
        .setDescription('[Admin] Chọn lại người thắng')
        .addIntegerOption(option =>
          option.setName('giveaway_id')
            .setDescription('ID của giveaway')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Xem danh sách giveaway đang diễn ra'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('blacklist')
        .setDescription('[Admin] Blacklist user khỏi giveaway')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User cần blacklist')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Lý do blacklist')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('unblacklist')
        .setDescription('[Admin] Unblacklist user')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User cần unblacklist')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('listban')
        .setDescription('[Admin] Xem danh sách blacklist'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('flash')
        .setDescription('[Admin] Tạo nhiều giveaway cùng lúc')
        .addIntegerOption(option =>
          option.setName('count')
            .setDescription('Số lượng giveaway (1-10)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('duration')
            .setDescription('Thời gian (vd: 1h, 30m, 1d)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('prize')
            .setDescription('Template phần thưởng (dùng {n} cho số thứ tự)')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('winners')
            .setDescription('Số người thắng mỗi giveaway (mặc định: 1)')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('required_role')
            .setDescription('Role yêu cầu (tùy chọn)')
            .setRequired(false))),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('[Mod] Ban một user khỏi server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User cần ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do ban')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('delete_messages')
        .setDescription('Xóa tin nhắn trong bao nhiêu ngày (0-7)')
        .setRequired(false)
        .addChoices(
          { name: 'Không xóa', value: 0 },
          { name: '1 ngày', value: 1 },
          { name: '3 ngày', value: 3 },
          { name: '7 ngày', value: 7 }
        )),

  new SlashCommandBuilder()
    .setName('unban')
    .setDescription('[Mod] Unban một user')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('User ID cần unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do unban')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('[Mod] Kick một user khỏi server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User cần kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do kick')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('[Mod] Mute một user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User cần mute')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Thời gian mute (phút)')
        .setRequired(true)
        .addChoices(
          { name: '5 phút', value: 5 },
          { name: '10 phút', value: 10 },
          { name: '30 phút', value: 30 },
          { name: '1 giờ', value: 60 },
          { name: '6 giờ', value: 360 },
          { name: '12 giờ', value: 720 },
          { name: '1 ngày', value: 1440 },
          { name: '7 ngày', value: 10080 }
        ))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do mute')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('[Mod] Unmute một user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User cần unmute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do unmute')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('[Mod] Warn một user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User cần warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do warn')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('[Mod] Xóa warning của user')
    .addIntegerOption(option =>
      option.setName('warning_id')
        .setDescription('ID của warning cần xóa')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do xóa warning')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Xem warnings của user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User cần xem warnings')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('modsetup')
    .setDescription('[Admin] Cài đặt moderation logs')
    .addSubcommand(subcommand =>
      subcommand
        .setName('logchannel')
        .setDescription('Đặt kênh log moderation')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Kênh log moderation')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Xóa cấu hình moderation logs')),

  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('[Mod] Lock một channel (không cho gửi tin nhắn)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel cần lock (mặc định: channel hiện tại)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do lock')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('[Mod] Unlock một channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel cần unlock (mặc định: channel hiện tại)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do unlock')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('[Mod] Đặt slowmode cho channel')
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Thời gian slowmode (giây, 0 = tắt, max 21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel cần đặt slowmode (mặc định: channel hiện tại)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do đặt slowmode')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('purge')
    .setDescription('[Mod] Xóa tin nhắn hàng loạt (1-100)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Số lượng tin nhắn cần xóa (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Chỉ xóa tin nhắn của user này (tùy chọn)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('[Admin] Xóa toàn bộ tin nhắn trong channel (tạo lại channel mới)'),

  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('[Admin] Quản lý custom embeds')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Tạo embed mới')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed (dùng để tìm kiếm)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Tiêu đề embed')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Mô tả embed')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('color')
            .setDescription('Màu embed (hex: #FF0000)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Xóa embed')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed cần xóa')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Xem danh sách embeds'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('show')
        .setDescription('Xem chi tiết embed')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('send')
        .setDescription('Gửi embed vào channel')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel gửi (mặc định: channel hiện tại)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('editall')
        .setDescription('Chỉnh sửa toàn bộ embed')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Tiêu đề mới')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Mô tả mới')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('color')
            .setDescription('Màu mới (hex: #FF0000)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('editauthor')
        .setDescription('Chỉnh sửa author')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('author_name')
            .setDescription('Tên author')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('author_icon')
            .setDescription('Link icon author')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('editcolor')
        .setDescription('Chỉnh sửa màu')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('color')
            .setDescription('Màu mới (hex: #FF0000)')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('editdescription')
        .setDescription('Chỉnh sửa mô tả')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Mô tả mới')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('editfooter')
        .setDescription('Chỉnh sửa footer')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('footer_text')
            .setDescription('Text footer')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('footer_icon')
            .setDescription('Link icon footer')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('editimage')
        .setDescription('Chỉnh sửa hình ảnh chính')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('image_url')
            .setDescription('Link hình ảnh')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('editthumbnail')
        .setDescription('Chỉnh sửa thumbnail')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('thumbnail_url')
            .setDescription('Link thumbnail')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('addfield')
        .setDescription('Thêm field vào embed')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('field_name')
            .setDescription('Tên field')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('field_value')
            .setDescription('Giá trị field')
            .setRequired(true))
        .addBooleanOption(option =>
          option.setName('inline')
            .setDescription('Hiển thị cùng hàng? (mặc định: false)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('clearfields')
        .setDescription('Xóa toàn bộ fields')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Tên embed')
            .setRequired(true))),

  new SlashCommandBuilder()
    .setName('response')
    .setDescription('[Admin] Quản lý custom responses với embed')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Thêm custom response')
        .addStringOption(option =>
          option.setName('trigger')
            .setDescription('Từ khóa kích hoạt')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('response')
            .setDescription('Nội dung phản hồi')
            .setRequired(true))
        .addBooleanOption(option =>
          option.setName('exact')
            .setDescription('Khớp chính xác? (mặc định: false)')
            .setRequired(false))
        .addIntegerOption(option =>
          option.setName('priority')
            .setDescription('Độ ưu tiên (0-100, mặc định: 0)')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('embed')
            .setDescription('Tên embed đi kèm (tùy chọn)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Xem danh sách custom responses'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Xóa custom response')
        .addIntegerOption(option =>
          option.setName('id')
            .setDescription('ID của response')
            .setRequired(true))),

  new SlashCommandBuilder()
    .setName('github')
    .setDescription('Xem thông tin GitHub repository')
    .addStringOption(option =>
      option.setName('repo')
        .setDescription('Repository (format: owner/repo)')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('pokemon')
    .setDescription('Xem thông tin Pokemon')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Tên Pokemon')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('itunes')
    .setDescription('Tìm thông tin bài hát trên iTunes')
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Tên bài hát')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Xem thông tin chi tiết về user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User cần xem (để trống = bạn)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Tạo poll với emoji reactions (max 10 choices)')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Câu hỏi poll')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('choice1')
        .setDescription('Lựa chọn 1')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('choice2')
        .setDescription('Lựa chọn 2')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('choice3')
        .setDescription('Lựa chọn 3')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice4')
        .setDescription('Lựa chọn 4')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice5')
        .setDescription('Lựa chọn 5')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice6')
        .setDescription('Lựa chọn 6')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice7')
        .setDescription('Lựa chọn 7')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice8')
        .setDescription('Lựa chọn 8')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice9')
        .setDescription('Lựa chọn 9')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice10')
        .setDescription('Lựa chọn 10')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Thời gian tự động kết thúc (phút, mặc định: không tự động kết thúc)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10080)),

  announcementsCommand.data,

  new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Kiểm tra trạng thái Premium của bạn'),

  new SlashCommandBuilder()
    .setName('subscriptions')
    .setDescription('Xem lịch sử gói Premium'),

  new SlashCommandBuilder()
    .setName('premium-features')
    .setDescription('Xem tất cả tính năng Premium'),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Xem trạng thái bot, shard và cluster info'),

  new SlashCommandBuilder()
    .setName('shard')
    .setDescription('Tìm shard của một server')
    .addStringOption(option =>
      option.setName('server_id')
        .setDescription('ID của server cần tìm')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('confession-panel')
    .setDescription('[Admin] Tạo panel để gửi confession với button')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel để post panel (mặc định: channel hiện tại)')
        .setRequired(false))
];

module.exports = slashCommands;
