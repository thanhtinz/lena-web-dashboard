const { logger, LogLevel } = require('../utils/logger');

/**
 * Set logging level
 * Usage: !loglevel <error|warn|info|debug>
 */
async function handleSetLogLevel(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể thay đổi log level!');
  }

  if (args.length === 0) {
    const currentLevel = logger.getStats().currentLevel;
    return message.reply(`📊 Log level hiện tại: **${currentLevel}**\n\n` +
      `Các level khả dụng: \`error\`, \`warn\`, \`info\`, \`debug\`\n` +
      `Sử dụng: \`!loglevel <level>\``);
  }

  const levelName = args[0].toUpperCase();
  const level = LogLevel[levelName];

  if (!level) {
    return message.reply('❌ Log level không hợp lệ! Chọn: `error`, `warn`, `info`, `debug`');
  }

  logger.setLogLevel(level);
  
  await logger.info('⚙️ System', `Log level changed to ${level.name}`, {
    user: `${message.author.tag} (${message.author.id})`,
    server: `${message.guild.name} (${message.guild.id})`
  });

  return message.reply(`✅ Đã đổi log level thành: **${level.name}**\n` +
    `${level.emoji} Priority: ${level.priority}`);
}

/**
 * View logging statistics
 * Usage: !logstats
 */
async function handleLogStats(message) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể xem log stats!');
  }

  const stats = logger.getStats();

  const embed = {
    color: 0x0099FF,
    title: '📊 Logging System Statistics',
    fields: [
      {
        name: '📈 Current Log Level',
        value: `**${stats.currentLevel}**`,
        inline: true
      },
      {
        name: '📝 Queue Length',
        value: `${stats.queueLength} logs`,
        inline: true
      },
      {
        name: '⚙️ Processing',
        value: stats.isProcessing ? '✅ Active' : '⏸️ Idle',
        inline: true
      },
      {
        name: '📢 Log Channel',
        value: `<#${stats.channelId}>`,
        inline: true
      },
      {
        name: '🏠 Log Server',
        value: stats.serverId,
        inline: true
      },
      {
        name: '📚 Available Levels',
        value: '`ERROR` (🔴)\n`WARN` (🟠)\n`INFO` (🔵)\n`DEBUG` (⚪)',
        inline: false
      }
    ],
    footer: {
      text: 'Use !loglevel <level> to change log level'
    },
    timestamp: new Date()
  };

  return message.reply({ embeds: [embed] });
}

/**
 * Test logging system
 * Usage: !logtest
 */
async function handleLogTest(message) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Chỉ admin mới có thể test logging!');
  }

  await message.reply('🧪 Testing logging system...');

  // Test different log levels
  await logger.debug('📝 Command', 'Test DEBUG log', {
    user: `${message.author.tag}`,
    server: `${message.guild.name}`
  });

  await logger.info('📝 Command', 'Test INFO log', {
    user: `${message.author.tag}`,
    server: `${message.guild.name}`
  });

  await logger.warn('📝 Command', 'Test WARN log', {
    user: `${message.author.tag}`,
    server: `${message.guild.name}`
  });

  await logger.error('📝 Command', 'Test ERROR log', {
    user: `${message.author.tag}`,
    server: `${message.guild.name}`,
    error: 'This is a test error message',
    stack: 'No real stack trace (this is a test)'
  });

  return message.reply('✅ Test logs đã được gửi! Kiểm tra log channel.');
}

module.exports = {
  handleSetLogLevel,
  handleLogStats,
  handleLogTest
};
