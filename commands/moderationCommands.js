const { PermissionFlagsBits } = require('discord.js');

async function handlePurge(message, args) {
  if (!message.guild) {
    return message.reply('❌ Lệnh này chỉ dùng được trong server!');
  }

  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ Bạn cần quyền "Quản lý tin nhắn" để dùng lệnh này! 🥺');
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ Em cần quyền "Quản lý tin nhắn" để xóa được nha! 🥺');
  }

  const amount = parseInt(args[0]);

  if (isNaN(amount) || amount < 1 || amount > 100) {
    return message.reply('❌ Số tin nhắn phải từ 1 đến 100! Ví dụ: `!purge 10` để xóa 10 tin nhắn gần nhất');
  }

  try {
    // Delete the command message first
    await message.delete().catch(() => {});

    // Fetch and delete messages
    const messages = await message.channel.messages.fetch({ limit: amount });
    const deleted = await message.channel.bulkDelete(messages, true);

    const confirmMsg = await message.channel.send(`✅ Đã xóa ${deleted.size} tin nhắn! 🧹✨`);
    
    // Auto delete confirmation after 3 seconds
    setTimeout(() => {
      confirmMsg.delete().catch(() => {});
    }, 3000);

    console.log(`🗑️ Purged ${deleted.size} messages in ${message.guild.name}/#${message.channel.name} by ${message.author.tag}`);

  } catch (error) {
    console.error('❌ Error purging messages:', error);
    return message.reply('❌ Có lỗi khi xóa tin nhắn! Có thể tin nhắn quá cũ (>14 ngày) 🥺');
  }
}

async function handleNuke(message) {
  if (!message.guild) {
    return message.reply('❌ Lệnh này chỉ dùng được trong server!');
  }

  if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply('❌ Bạn cần quyền "Quản lý kênh" để dùng lệnh này! 🥺');
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply('❌ Em cần quyền "Quản lý kênh" để nuke được nha! 🥺');
  }

  try {
    const channel = message.channel;
    const channelName = channel.name;
    const channelPosition = channel.position;
    const channelParent = channel.parent;
    const channelTopic = channel.topic;
    const channelNsfw = channel.nsfw;
    const channelRateLimitPerUser = channel.rateLimitPerUser;
    const channelPermissionOverwrites = channel.permissionOverwrites.cache;

    // Clone channel
    const newChannel = await channel.clone({
      name: channelName,
      topic: channelTopic,
      nsfw: channelNsfw,
      rateLimitPerUser: channelRateLimitPerUser,
      parent: channelParent,
      position: channelPosition,
      permissionOverwrites: channelPermissionOverwrites,
      reason: `Channel nuked by ${message.author.tag}`
    });

    // Delete old channel
    await channel.delete(`Nuked by ${message.author.tag}`);

    // Send confirmation in new channel
    await newChannel.send(`💣 Channel đã được nuke bởi ${message.author}! Tất cả tin nhắn cũ đã bị xóa sạch! ✨`);

    console.log(`💣 Nuked channel ${channelName} in ${message.guild.name} by ${message.author.tag}`);

  } catch (error) {
    console.error('❌ Error nuking channel:', error);
    return message.reply('❌ Có lỗi khi nuke channel! 🥺');
  }
}

async function handleLock(message, args) {
  if (!message.member.permissions.has('ManageChannels')) {
    return message.reply('❌ Bạn cần quyền "Quản lý kênh" để khóa channel!');
  }

  try {
    const reason = args.join(' ') || 'No reason provided';
    const channel = message.channel;

    await channel.permissionOverwrites.edit(message.guild.id, {
      SendMessages: false
    });

    const embed = {
      color: 0xff6b6b,
      title: '🔒 Channel đã được khóa',
      description: `Channel này đã bị khóa bởi ${message.author}`,
      fields: [
        { name: 'Lý do', value: reason, inline: false },
        { name: 'Moderator', value: `${message.author.tag}`, inline: true }
      ],
      timestamp: new Date()
    };

    await message.channel.send({ embeds: [embed] });
    console.log(`🔒 Locked channel ${channel.name} in ${message.guild.name} by ${message.author.tag}`);

  } catch (error) {
    console.error('❌ Error locking channel:', error);
    return message.reply('❌ Có lỗi khi khóa channel!');
  }
}

async function handleUnlock(message) {
  if (!message.member.permissions.has('ManageChannels')) {
    return message.reply('❌ Bạn cần quyền "Quản lý kênh" để mở khóa channel!');
  }

  try {
    const channel = message.channel;

    await channel.permissionOverwrites.edit(message.guild.id, {
      SendMessages: null
    });

    const embed = {
      color: 0x51cf66,
      title: '🔓 Channel đã được mở khóa',
      description: `Channel này đã được mở khóa bởi ${message.author}`,
      fields: [
        { name: 'Moderator', value: `${message.author.tag}`, inline: true }
      ],
      timestamp: new Date()
    };

    await message.channel.send({ embeds: [embed] });
    console.log(`🔓 Unlocked channel ${channel.name} in ${message.guild.name} by ${message.author.tag}`);

  } catch (error) {
    console.error('❌ Error unlocking channel:', error);
    return message.reply('❌ Có lỗi khi mở khóa channel!');
  }
}

async function handleSlowmode(message, args) {
  if (!message.member.permissions.has('ManageChannels')) {
    return message.reply('❌ Bạn cần quyền "Quản lý kênh" để đặt slowmode!');
  }

  const seconds = parseInt(args[0]);

  if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
    return message.reply('❌ Slowmode phải từ 0-21600 giây (6 giờ)! Ví dụ: `!slowmode 10`');
  }

  try {
    await message.channel.setRateLimitPerUser(seconds);

    const timeStr = seconds === 0 ? 'đã tắt' : `${seconds} giây`;
    const embed = {
      color: seconds === 0 ? 0x51cf66 : 0x4dabf7,
      title: seconds === 0 ? '⏱️ Slowmode đã tắt' : '⏱️ Slowmode đã bật',
      description: `Slowmode ${timeStr}`,
      fields: [
        { name: 'Moderator', value: `${message.author.tag}`, inline: true }
      ],
      timestamp: new Date()
    };

    await message.channel.send({ embeds: [embed] });
    console.log(`⏱️ Set slowmode to ${seconds}s in ${message.channel.name} by ${message.author.tag}`);

  } catch (error) {
    console.error('❌ Error setting slowmode:', error);
    return message.reply('❌ Có lỗi khi đặt slowmode!');
  }
}

module.exports = {
  handlePurge,
  handleNuke,
  handleLock,
  handleUnlock,
  handleSlowmode
};
