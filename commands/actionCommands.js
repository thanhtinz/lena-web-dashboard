const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const OTAKU_API_BASE = 'https://api.otakugifs.xyz/gif';

const actionsList = [
  'airkiss', 'angrystare', 'bite', 'bleh', 'blush', 'brofist', 'celebrate', 'cheers', 
  'clap', 'confused', 'cool', 'cry', 'cuddle', 'dance', 'drool', 'evillaugh', 'facepalm', 
  'handhold', 'happy', 'headbang', 'hug', 'huh', 'kiss', 'laugh', 'lick', 'love', 'mad', 
  'nervous', 'no', 'nom', 'nosebleed', 'nuzzle', 'nyah', 'pat', 'peek', 'pinch', 'poke', 
  'pout', 'punch', 'roll', 'run', 'sad', 'scared', 'shout', 'shrug', 'shy', 'sigh', 'sip', 
  'slap', 'sleep', 'slowclap', 'smack', 'smile', 'smug', 'sneeze', 'sorry', 'stare', 'stop', 
  'surprised', 'sweat', 'thumbsup', 'tickle', 'tired', 'wave', 'wink', 'woah', 'yawn', 'yay', 'yes'
];

const actionDescriptions = {
  'airkiss': '😘 gửi nụ hôn bay',
  'angrystare': '😠 nhìn chằm chằm tức giận',
  'bite': '😬 cắn',
  'bleh': '😛 lè lưỡi',
  'blush': '😊 đỏ mặt',
  'brofist': '👊 đấm bro',
  'celebrate': '🎉 ăn mừng với',
  'cheers': '🍻 cạn ly với',
  'clap': '👏 vỗ tay cho',
  'confused': '😕 bối rối với',
  'cool': '😎 ngầu với',
  'cry': '😢 khóc với',
  'cuddle': '🤗 ôm ấp',
  'dance': '💃 nhảy múa với',
  'drool': '🤤 chảy nước miếng vì',
  'evillaugh': '😈 cười nham hiểm',
  'facepalm': '🤦 facepalm',
  'handhold': '🤝 nắm tay',
  'happy': '😊 vui vẻ với',
  'headbang': '🤘 lắc đầu với',
  'hug': '🤗 ôm',
  'huh': '🤔 ngạc nhiên với',
  'kiss': '😘 hôn',
  'laugh': '😂 cười với',
  'lick': '👅 liếm',
  'love': '💕 yêu',
  'mad': '😡 tức giận với',
  'nervous': '😰 lo lắng với',
  'no': '🙅 từ chối',
  'nom': '😋 ăn ngon',
  'nosebleed': '🩸 chảy máu mũi vì',
  'nuzzle': '🥰 cọ mũi với',
  'nyah': '😜 trêu',
  'pat': '😊 vỗ đầu',
  'peek': '👀 nhìn trộm',
  'pinch': '👌 véo',
  'poke': '👉 chọc',
  'pout': '😤 bĩu môi với',
  'punch': '👊 đấm',
  'roll': '🙄 lăn mắt với',
  'run': '🏃 chạy trốn',
  'sad': '😢 buồn với',
  'scared': '😱 sợ',
  'shout': '😠 la hét với',
  'shrug': '🤷 nhún vai',
  'shy': '😳 ngại ngùng với',
  'sigh': '😔 thở dài với',
  'sip': '🍵 nhâm nhi với',
  'slap': '👋 tát',
  'sleep': '😴 ngủ với',
  'slowclap': '👏 vỗ tay chậm',
  'smack': '💥 đập',
  'smile': '😊 mỉm cười với',
  'smug': '😏 cười nham hiểm',
  'sneeze': '🤧 hắt hơi',
  'sorry': '🙏 xin lỗi',
  'stare': '👀 nhìn chằm chằm',
  'stop': '✋ dừng lại',
  'surprised': '😲 ngạc nhiên với',
  'sweat': '😅 đổ mồ hôi',
  'thumbsup': '👍 thích',
  'tickle': '😆 cù',
  'tired': '😩 mệt mỏi',
  'wave': '👋 vẫy tay chào',
  'wink': '😉 nháy mắt với',
  'woah': '😮 wow với',
  'yawn': '🥱 ngáp',
  'yay': '🎉 hoan hô',
  'yes': '✅ đồng ý với'
};

const selfActionRoasts = [
  'Ơ kìa, {user} đang tự {action} mình à? Có người độc thân đang tự an ủi bản thân đây này~ 😅',
  '{user} ơi... đừng ảo tưởng nữa, đi kiếm người thật đi bạn êi! 🥺💕',
  'Aww, {user} đang cô đơn đến mức phải tự {action} mình rồi sao~ Thương quá! 😢✨',
  'Lena thấy {user} đang tự {action} đó nè! Ai dạy bạn tự yêu bản thân thế này? 🤭💫',
  'Ủa, {user} đang làm gì vậy? Tự {action} thì có vui đâu, để Lena tìm ai đó giúp nha! 🌸',
  '{user} à... bình tĩnh đi bạn, đừng tự {action} nữa, nó không có ý nghĩa đâu! 😳💕',
  'Có ai đó tên {user} đang tự {action} kìa! Chắc cô đơn lắm đây~ 🥺✨',
  'Lena khuyên {user} nên đi ra ngoài giao lưu thay vì tự {action} đấy nhé! 💫😊',
  '{user} ơi, tự {action} thế này thì hơi... cô đơn nhỉ? 😅 Lena lo cho bạn quá!',
  'Ồ, {user} đang thực hiện nghệ thuật tự {action}! Độc thân cao cấp đây rồi~ 🌸😂',
  '{user} này, đừng ảo nữa! Hãy tìm người thật để {action} đi chứ! 💕🥺',
  'Ai bảo {user} tự {action} vậy? Lena thấy thương thương luôn á~ 😢✨',
  'Ê {user}, tự {action} là sao? Cô đơn đến vậy rồi sao bạn êi! 🥺💫',
  '{user} đang tự {action}... Lena nghĩ bạn cần ai đó thật sự hơn đó! 😊🌸',
  'Ủa {user} ơi, tự {action} thế này thì buồn lắm á! Lena giới thiệu bạn bè nhé! 💕😅'
];

const actionCuteMessages = {
  hug: [
    'Ôm ấm áp quá~ 💕🤗',
    'Cái ôm siêu ngọt ngào! 🥺✨',
    'Hug chặt chặt nè! 💖🌸',
    'Moment ôm đáng yêu quá! 🤗💫',
    'Lena cũng muốn được ôm~ 🥺💕'
  ],
  kiss: [
    'Mlem mlem~ 😘💕',
    'Kiss ngọt lắm nè! 💋✨',
    'Cái hôn siêu lãng mạn! 😍💫',
    'Aww đáng yêu ghê á~ 😘🌸',
    'Thấy ghen tị luôn! 💕🥺'
  ],
  slap: [
    'Éc đau quá! 😭💥',
    'Tát mạnh dữ vậy! 👋😢',
    'Ouch! Nhẹ tay chứ! 😣✨',
    'Đau thiệt đó huhu~ 😢💫',
    'Ai cho phép bạn tát người ta vậy! 😤💕'
  ],
  bite: [
    'Ouch cắn đau á! 😣💢',
    'Nhẹ răng thôi nha! 😬💫',
    'Éc ê ẩm hết! 😭✨',
    'Cắn như thỏ con vậy~ 🐰💕',
    'Dễ thương nhưng đau! 😢🌸'
  ],
  pat: [
    'Vỗ đầu siêu yêu! 🥺💕',
    'Headpat dễ thương ghê~ 😊✨',
    'Được vỗ đầu hạnh phúc quá! 💖🌸',
    'Mọi người đều thích headpat! 🥰💫',
    'Aww moment ngọt ngào! 😊💕'
  ],
  cuddle: [
    'Ôm ấp siêu ngọt! 🥰💕',
    'Cuddle dễ thương ghê~ 🤗✨',
    'Lena cũng muốn cuddle! 🥺💖',
    'Moment ấm áp quá á~ 💕🌸',
    'Thấy ấm lòng thiệt! 🥰💫'
  ],
  poke: [
    'Chọc chọc nè~ 👉😆',
    'Đừng chọc nữa má! 😤💫',
    'Chọc hoài vậy hả? 😊✨',
    'Poke poke dễ thương~ 👉💕',
    'Ai cho phép chọc người ta! 😳🌸'
  ],
  punch: [
    'Đấm đau quá á! 😭💥',
    'Ouch! Mạnh dữ vậy! 😢💢',
    'Nhẹ tay chứ huhu~ 😣✨',
    'Éc đấm kinh khủng! 💫😭',
    'Ai bảo đấm người ta! 😤💕'
  ],
  wave: [
    'Vẫy tay chào cute~ 👋😊',
    'Helloooo! 💕✨',
    'Chào đáng yêu ghê! 👋🌸',
    'Hi hi vẫy tay nè~ 😊💫',
    'Moment chào siêu ngọt! 👋💖'
  ],
  cry: [
    'Đừng khóc nữa má~ 😢💕',
    'Lena cũng muốn khóc theo! 😭✨',
    'Huhu ai làm buồn vậy! 😢🌸',
    'Thấy thương quá đi mất! 🥺💫',
    'Đừng khóc, có Lena đây! 😭💖'
  ],
  laugh: [
    'Cười vui quá! 😂💕',
    'Haha moment vui vẻ~ 😆✨',
    'Nghe cười Lena cũng vui! 😊🌸',
    'Cười siêu dễ thương! 😂💫',
    'Happy moment nè~ 😄💖'
  ],
  blush: [
    'Đỏ mặt cute ghê á~ 😊💕',
    'Ai bảo ngại ngùng vậy! 🥺✨',
    'Thấy đỏ mặt dễ thương! 😳🌸',
    'Aww xấu hổ rồi~ 😊💫',
    'Blush siêu ngọt ngào! 😳💖'
  ],
  love: [
    'Yêu thiệt sao~ 💕✨',
    'Tình yêu trong không khí! 💖🌸',
    'Ship quá á! 💞💫',
    'Moment lãng mạn ghê~ 💕😊',
    'Love is in the air! 💖✨'
  ],
  dance: [
    'Nhảy đi nào~ 💃✨',
    'Dance party nè! 🕺💕',
    'Nhảy siêu vui! 💃🌸',
    'Let\'s dance together! 🕺💫',
    'Moment vui vẻ quá! 💃💖'
  ],
  smile: [
    'Nụ cười đẹp quá~ 😊💕',
    'Cười dễ thương ghê! 😄✨',
    'Smile siêu tươi! 😊🌸',
    'Thấy vui theo luôn! 😄💫',
    'Nụ cười ngọt ngào! 😊💖'
  ],
  // Default messages cho các actions khác
  default: [
    'Aww dễ thương quá đi~ 💕✨',
    'Cute ghê á! 🥺💫',
    'Lena thấy ngọt ngào quá~ 😊🌸',
    'Ôi trời, dễ thương dữ vậy! 💖🎀',
    'Moment đáng yêu này ní~ ✨💕',
    'Tình cảm ghê! 🥰💫',
    'Ship quá á~ 💞🌟',
    'Ngọt ngào thiệt đó! 😍✨',
    'Thấy ghen tị luôn á~ 🥺💕',
    'Khoảnh khắc siêu cute! 🌸💖'
  ]
};

function getRandomSelfRoast(username, action) {
  const randomRoast = selfActionRoasts[Math.floor(Math.random() * selfActionRoasts.length)];
  const actionText = actionDescriptions[action] || action;
  return randomRoast.replace(/{user}/g, username).replace(/{action}/g, actionText);
}

function getRandomCuteMessage(action) {
  const messages = actionCuteMessages[action] || actionCuteMessages.default;
  return messages[Math.floor(Math.random() * messages.length)];
}

async function fetchActionGif(reaction) {
  try {
    const response = await fetch(`${OTAKU_API_BASE}?reaction=${reaction}&format=gif`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error(`Error fetching ${reaction} GIF:`, error);
    return null;
  }
}

async function handleAction(message, action, args) {
  if (!actionsList.includes(action)) {
    return;
  }
  
  const target = message.mentions.users.first();
  const author = message.author;
  
  // Check if user is trying to action themselves
  if (target && target.id === author.id) {
    const roastMessage = getRandomSelfRoast(author.username, action);
    return message.reply(roastMessage);
  }
  
  const gifUrl = await fetchActionGif(action);
  
  if (!gifUrl) {
    return message.reply('❌ Không thể tải GIF lúc này, thử lại sau nhé! 🥺');
  }
  
  const description = actionDescriptions[action] || action;
  let embedDescription = '';
  
  if (target && target.id !== author.id) {
    const cuteMessage = getRandomCuteMessage(action);
    embedDescription = `<@${author.id}> ${description} <@${target.id}>\n${cuteMessage}`;
  }
  
  const embed = new EmbedBuilder()
    .setDescription(embedDescription || null)
    .setImage(gifUrl)
    .setColor(0xEB459E)
    .setFooter({ text: 'Powered by OtakuGIFs' })
    .setTimestamp();
  
  await message.reply({ 
    embeds: [embed] 
  });
}

function isActionCommand(command) {
  return actionsList.includes(command);
}

function getActionsList() {
  return actionsList;
}

module.exports = {
  handleAction,
  isActionCommand,
  getActionsList,
  actionsList
};
