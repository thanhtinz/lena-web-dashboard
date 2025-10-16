const choices = ['🪨 Rock', '📄 Paper', '✂️ Scissors'];
const squidGameChoices = ['🪨 Rock', '📄 Paper', '✂️ Scissors', '🦑 Squid'];

const emojis = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
  squid: '🦑'
};

function determineWinner(player, bot, isSquidGame = false) {
  if (player === bot) return 'draw';
  
  if (isSquidGame && bot.includes('Squid')) {
    return 'bot';
  }
  
  if (isSquidGame && player.includes('Squid')) {
    return 'player';
  }
  
  if (
    (player.includes('Rock') && bot.includes('Scissors')) ||
    (player.includes('Paper') && bot.includes('Rock')) ||
    (player.includes('Scissors') && bot.includes('Paper'))
  ) {
    return 'player';
  }
  
  return 'bot';
}

async function playRockPaperScissors(message, userChoice) {
  userChoice = userChoice?.toLowerCase();
  
  const validChoices = ['rock', 'paper', 'scissors', 'kéo', 'búa', 'bao'];
  const choiceMap = {
    'rock': '🪨 Rock',
    'búa': '🪨 Rock',
    'paper': '📄 Paper',
    'bao': '📄 Paper',
    'scissors': '✂️ Scissors',
    'kéo': '✂️ Scissors'
  };
  
  if (!userChoice || !validChoices.includes(userChoice)) {
    return message.reply('💡 Sử dụng: `!rps <rock/paper/scissors>` hoặc `!rps <búa/bao/kéo>`');
  }
  
  const playerChoice = choiceMap[userChoice];
  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  
  const result = determineWinner(playerChoice, botChoice);
  
  let resultText = `🎮 **Rock Paper Scissors**\n\n`;
  resultText += `Bạn chọn: ${playerChoice}\n`;
  resultText += `Bot chọn: ${botChoice}\n\n`;
  
  if (result === 'draw') {
    resultText += `🤝 **HÒA!**`;
  } else if (result === 'player') {
    resultText += `🎉 **BẠN THẮNG!** Chúc mừng!`;
  } else {
    resultText += `😢 **BẠN THUA!** Lần sau may mắn hơn nhé!`;
  }
  
  await message.reply(resultText);
}

async function playSquidGameRPS(message, userChoice) {
  userChoice = userChoice?.toLowerCase();
  
  const validChoices = ['rock', 'paper', 'scissors', 'squid', 'kéo', 'búa', 'bao', 'mực'];
  const choiceMap = {
    'rock': '🪨 Rock',
    'búa': '🪨 Rock',
    'paper': '📄 Paper',
    'bao': '📄 Paper',
    'scissors': '✂️ Scissors',
    'kéo': '✂️ Scissors',
    'squid': '🦑 Squid',
    'mực': '🦑 Squid'
  };
  
  if (!userChoice || !validChoices.includes(userChoice)) {
    return message.reply('💡 Sử dụng: `!squid <rock/paper/scissors/squid>`\n\n⚠️ **Squid thắng mọi thứ!** Nhưng bot cũng có thể chọn Squid!');
  }
  
  const playerChoice = choiceMap[userChoice];
  const botChoice = squidGameChoices[Math.floor(Math.random() * squidGameChoices.length)];
  
  const result = determineWinner(playerChoice, botChoice, true);
  
  let resultText = `🦑 **SQUID GAME - Rock Paper Scissors**\n\n`;
  resultText += `Bạn chọn: ${playerChoice}\n`;
  resultText += `Bot chọn: ${botChoice}\n\n`;
  
  if (result === 'draw') {
    resultText += `🤝 **HÒA!**`;
  } else if (result === 'player') {
    resultText += `🎉 **BẠN THẮNG!** Bạn sống sót!`;
  } else {
    resultText += `💀 **BẠN THUA!** Game Over...`;
  }
  
  await message.reply(resultText);
}

module.exports = {
  playRockPaperScissors,
  playSquidGameRPS
};
