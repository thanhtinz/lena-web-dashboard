const { db } = require('../database/db');
const { giveaways, giveawayParticipants, giveawayBlacklist } = require('../database/schema');
const { eq, and } = require('drizzle-orm');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logger, LogLevel, LogCategory } = require('../utils/logger');
const { getServerConfig } = require('../database/configService');

function isAdmin(member) {
  return member && member.permissions.has('Administrator');
}

function parseDuration(durationStr) {
  const regex = /(\d+)([smhd])/g;
  let totalMs = 0;
  let match;
  
  while ((match = regex.exec(durationStr)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': totalMs += value * 1000; break;
      case 'm': totalMs += value * 60 * 1000; break;
      case 'h': totalMs += value * 60 * 60 * 1000; break;
      case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
    }
  }
  
  return totalMs;
}

function formatTimeRemaining(endTime) {
  const now = Date.now();
  const diff = endTime.getTime() - now;
  
  if (diff <= 0) return 'Đã kết thúc';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) return `${days} ngày ${hours} giờ tới`;
  if (hours > 0) return `${hours} giờ ${minutes} phút tới`;
  if (minutes > 0) return `${minutes} phút ${seconds} giây tới`;
  return `${seconds} giây tới`;
}

function createGiveawayEmbed(giveaway, participantCount = 0, guild, client) {
  const timeRemaining = formatTimeRemaining(new Date(giveaway.endTime));
  const endTimestamp = Math.floor(new Date(giveaway.endTime).getTime() / 1000);
  const lenaLove = '<:lena_love:1427387648896532593>';
  
  let description = `${lenaLove} Nhấn vào 🎉 để tham gia\n`;
  description += `${lenaLove} Đếm ngược: ${timeRemaining}\n`;
  description += `${lenaLove} Tổ chức bởi: <@${giveaway.hostId}>\n`;
  description += `${lenaLove} Đã tham gia: **${participantCount}** người`;
  
  if (giveaway.requiredRole) {
    const role = guild?.roles?.cache?.get(giveaway.requiredRole);
    description += `\n${lenaLove} Yêu cầu: ${role ? `<@&${giveaway.requiredRole}>` : 'Deleted Role'}`;
  }
  
  const embed = new EmbedBuilder()
    .setTitle(giveaway.prize)
    .setDescription(description)
    .setColor(0xEB459E);
  
  // Server logo + name as author
  if (guild) {
    embed.setAuthor({
      name: guild.name,
      iconURL: guild.iconURL({ dynamic: true }) || undefined
    });
  }
  
  // Bot logo in footer with relative time
  if (client) {
    embed.setFooter({
      text: `Giveaway với ${giveaway.winnerCount} giải`,
      iconURL: client.user.displayAvatarURL({ dynamic: true })
    });
  } else {
    embed.setFooter({ text: `Giveaway với ${giveaway.winnerCount} giải` });
  }
  
  // Add timestamp field for relative time display
  embed.setTimestamp(new Date(giveaway.endTime));
  
  // Creator avatar as thumbnail
  const host = guild?.members?.cache?.get(giveaway.hostId);
  if (host) {
    embed.setThumbnail(host.user.displayAvatarURL({ dynamic: true }));
  }
  
  return embed;
}

async function handleGiveawayCreate(interaction, args = null) {
  const isSlash = interaction.isCommand && interaction.isCommand();
  const user = interaction.user || interaction.author; // Support both slash and prefix
  
  if (!isAdmin(interaction.member)) {
    const msg = '❌ Chỉ admin mới có thể tạo giveaway!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  let duration, winnerCount, prize, requiredRole;
  
  if (isSlash) {
    duration = interaction.options.getString('duration');
    winnerCount = interaction.options.getInteger('winners') || 1;
    prize = interaction.options.getString('prize');
    requiredRole = interaction.options.getRole('required_role')?.id;
  } else {
    if (!args || args.length < 3) {
      const prefix = (await getServerConfig(interaction.guild.id)).prefix;
      return await interaction.reply(`❌ Format: \`${prefix}giveaway create <duration> <winners> <prize> [role]\`\nVí dụ: \`${prefix}giveaway create 1h 1 Nitro Classic @VIP\``);
    }
    
    duration = args[0];
    winnerCount = parseInt(args[1]) || 1;
    prize = args.slice(2).join(' ').replace(/<@&\d+>/, '').trim();
    
    const roleMatch = args.slice(2).join(' ').match(/<@&(\d+)>/);
    if (roleMatch) {
      requiredRole = roleMatch[1];
      prize = prize.replace(`<@&${requiredRole}>`, '').trim();
    }
  }
  
  const durationMs = parseDuration(duration);
  if (!durationMs || durationMs < 1000) {
    const msg = '❌ Thời gian không hợp lệ! Dùng format: 1s, 1m, 1h, 1d (ví dụ: 30m, 1h30m, 2d)';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  if (winnerCount < 1 || winnerCount > 20) {
    const msg = '❌ Số người thắng phải từ 1-20!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const endTime = new Date(Date.now() + durationMs);
  
  const result = await db.insert(giveaways).values({
    serverId: interaction.guild.id,
    channelId: interaction.channel.id,
    hostId: user.id,
    prize,
    winnerCount,
    requiredRole: requiredRole || null,
    endTime,
    status: 'active'
  }).returning();
  
  const giveaway = result[0];
  
  const embed = createGiveawayEmbed(giveaway, 0, interaction.guild, interaction.client);
  
  const giveawayMsg = await interaction.channel.send({
    content: `🎊 **GIVEAWAY BẮT ĐẦU** 🎊`,
    embeds: [embed]
  });
  
  await giveawayMsg.react('🎉');
  
  await db.update(giveaways)
    .set({ messageId: giveawayMsg.id })
    .where(eq(giveaways.id, giveaway.id));
  
  const successMsg = `✅ Giveaway đã được tạo! ID: #${giveaway.id}`;
  if (isSlash) {
    await interaction.reply({ content: successMsg, ephemeral: true });
  } else {
    await interaction.react('✅');
  }
  
  await logger.log(
    LogLevel.INFO,
    LogCategory.COMMAND,
    '🎉 Giveaway Created',
    interaction.guild,
    `ID: #${giveaway.id}\nPrize: ${prize}\nDuration: ${duration}\nHost: ${user.tag}`
  );
}

async function selectWinners(giveaway, guild) {
  const participants = await db.select()
    .from(giveawayParticipants)
    .where(eq(giveawayParticipants.giveawayId, giveaway.id));
  
  if (participants.length === 0) {
    return [];
  }
  
  const blacklisted = await db.select()
    .from(giveawayBlacklist)
    .where(eq(giveawayBlacklist.serverId, giveaway.serverId));
  
  const blacklistedIds = new Set(blacklisted.map(b => b.userId));
  
  let validParticipants = participants.filter(p => !blacklistedIds.has(p.userId));
  
  if (giveaway.requiredRole) {
    const validatedParticipants = [];
    for (const p of validParticipants) {
      try {
        const member = await guild.members.fetch(p.userId);
        if (member.roles.cache.has(giveaway.requiredRole)) {
          validatedParticipants.push(p);
        }
      } catch (err) {
        // User left server
      }
    }
    validParticipants = validatedParticipants;
  }
  
  if (validParticipants.length === 0) {
    return [];
  }
  
  const winners = [];
  const winnerCount = Math.min(giveaway.winnerCount, validParticipants.length);
  const shuffled = [...validParticipants].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < winnerCount; i++) {
    winners.push(shuffled[i].userId);
  }
  
  return winners;
}

async function handleGiveawayEnd(interaction, args = null) {
  const isSlash = interaction.isCommand && interaction.isCommand();
  
  if (!isAdmin(interaction.member)) {
    const msg = '❌ Chỉ admin mới có thể kết thúc giveaway!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  let giveawayId;
  
  if (isSlash) {
    giveawayId = interaction.options.getInteger('giveaway_id');
  } else {
    if (!args || args.length === 0) {
      const prefix = (await getServerConfig(interaction.guild.id)).prefix;
      return await interaction.reply(`❌ Format: \`${prefix}giveaway end <giveaway_id>\``);
    }
    giveawayId = parseInt(args[0]);
  }
  
  const result = await db.select()
    .from(giveaways)
    .where(and(
      eq(giveaways.id, giveawayId),
      eq(giveaways.serverId, interaction.guild.id)
    ))
    .limit(1);
  
  if (!result.length) {
    const msg = `❌ Không tìm thấy giveaway #${giveawayId}!`;
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const giveaway = result[0];
  
  if (giveaway.status !== 'active') {
    const msg = `❌ Giveaway #${giveawayId} đã kết thúc!`;
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const winners = await selectWinners(giveaway, interaction.guild);
  
  await db.update(giveaways)
    .set({ 
      status: 'ended',
      winners: winners.length > 0 ? JSON.stringify(winners) : null
    })
    .where(eq(giveaways.id, giveawayId));
  
  try {
    const channel = await interaction.guild.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);
    
    // Edit giveaway message to show it ended
    const lenaLove = '<:lena_love:1427387648896532593>';
    const endEmbed = new EmbedBuilder()
      .setTitle(giveaway.prize)
      .setColor(0x808080);
    
    let endDescription = '';
    
    if (winners.length > 0) {
      const winnerMentions = winners.map(w => `<@${w}>`).join(', ');
      endDescription += `${lenaLove} Người thắng: ${winnerMentions}\n`;
    } else {
      endDescription += `${lenaLove} Người thắng: Không có\n`;
    }
    
    endDescription += `${lenaLove} Tổ chức bởi: <@${giveaway.hostId}>\n`;
    endDescription += `${lenaLove} Kết thúc | <t:${Math.floor(Date.now() / 1000)}:R>`;
    
    endEmbed.setDescription(endDescription);
    
    // Set server logo as author
    if (interaction.guild) {
      endEmbed.setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }) || undefined
      });
    }
    
    // Set creator avatar as thumbnail
    try {
      const host = await interaction.guild.members.fetch(giveaway.hostId).catch(() => null);
      if (host) {
        endEmbed.setThumbnail(host.user.displayAvatarURL({ dynamic: true }));
      }
    } catch (err) {
      // Host might have left the server
    }
    
    await message.edit({
      content: '🏅 **GIVEAWAY ĐÃ KẾT THÚC** 🏅',
      embeds: [endEmbed]
    });
    
    // Remove reactions
    try {
      await message.reactions.removeAll();
    } catch (err) {
      console.error('Error removing reactions:', err);
    }
    
    // Send winner announcement with button
    if (winners.length > 0) {
      const lenaWin = '<:lena_win:1427373082862948422>';
      const winnerMentions = winners.map(w => `<@${w}>`).join(', ');
      const winnerMessage = `${lenaWin} Xin chúc mừng, ${winnerMentions} đã trúng giveaway **${giveaway.prize}** tổ chức bởi <@${giveaway.hostId}>`;
      
      const giveawayButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Giveaway')
            .setStyle(ButtonStyle.Link)
            .setURL(message.url)
        );
      
      await channel.send({
        content: winnerMessage,
        components: [giveawayButton]
      });
    } else {
      await channel.send(`❌ Không có người thắng hợp lệ cho giveaway **${giveaway.prize}**`);
    }
  } catch (err) {
    console.error('Error ending giveaway:', err);
  }
  
  const msg = `✅ Giveaway #${giveawayId} đã kết thúc!`;
  if (isSlash) {
    await interaction.reply({ content: msg, ephemeral: true });
  } else {
    await interaction.react('✅');
  }
}

async function handleGiveawayReroll(interaction, args = null) {
  const isSlash = interaction.isCommand && interaction.isCommand();
  
  if (!isAdmin(interaction.member)) {
    const msg = '❌ Chỉ admin mới có thể reroll giveaway!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  let giveawayId;
  
  if (isSlash) {
    giveawayId = interaction.options.getInteger('giveaway_id');
  } else {
    if (!args || args.length === 0) {
      const prefix = (await getServerConfig(interaction.guild.id)).prefix;
      return await interaction.reply(`❌ Format: \`${prefix}giveaway reroll <giveaway_id>\``);
    }
    giveawayId = parseInt(args[0]);
  }
  
  const result = await db.select()
    .from(giveaways)
    .where(and(
      eq(giveaways.id, giveawayId),
      eq(giveaways.serverId, interaction.guild.id)
    ))
    .limit(1);
  
  if (!result.length) {
    const msg = `❌ Không tìm thấy giveaway #${giveawayId}!`;
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const giveaway = result[0];
  
  if (giveaway.status !== 'ended') {
    const msg = `❌ Giveaway #${giveawayId} chưa kết thúc!`;
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const winners = await selectWinners(giveaway, interaction.guild);
  
  await db.update(giveaways)
    .set({ winners: winners.length > 0 ? JSON.stringify(winners) : null })
    .where(eq(giveaways.id, giveawayId));
  
  if (winners.length > 0) {
    await interaction.channel.send(`🎉 **Reroll Giveaway #${giveawayId}**\nNgười thắng mới: ${winners.map(w => `<@${w}>`).join(', ')} đã thắng **${giveaway.prize}**!`);
  } else {
    await interaction.channel.send(`❌ Không có người thắng hợp lệ cho Giveaway #${giveawayId}!`);
  }
  
  const msg = `✅ Đã reroll giveaway #${giveawayId}!`;
  if (isSlash) {
    await interaction.reply({ content: msg, ephemeral: true });
  } else {
    await interaction.react('✅');
  }
}

async function handleGiveawayList(interaction) {
  const isSlash = interaction.isCommand && interaction.isCommand();
  
  const activeGiveaways = await db.select()
    .from(giveaways)
    .where(and(
      eq(giveaways.serverId, interaction.guild.id),
      eq(giveaways.status, 'active')
    ));
  
  if (activeGiveaways.length === 0) {
    const msg = '📋 Không có giveaway nào đang diễn ra!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const embed = new EmbedBuilder()
    .setTitle('📋 Danh sách Giveaway đang diễn ra')
    .setColor(0xFF69B4)
    .setTimestamp();
  
  for (const g of activeGiveaways) {
    const participants = await db.select()
      .from(giveawayParticipants)
      .where(eq(giveawayParticipants.giveawayId, g.id));
    
    embed.addFields({
      name: `🎁 ${g.prize} (ID: ${g.id})`,
      value: `Kết thúc: <t:${Math.floor(new Date(g.endTime).getTime() / 1000)}:R>\nNgười thắng: ${g.winnerCount}\nTham gia: ${participants.length}`,
      inline: true
    });
  }
  
  if (isSlash) {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
}

async function handleGiveawayBlacklist(interaction, args = null) {
  const isSlash = interaction.isCommand && interaction.isCommand();
  const moderator = interaction.user || interaction.author; // Support both slash and prefix
  
  if (!isAdmin(interaction.member)) {
    const msg = '❌ Chỉ admin mới có thể blacklist!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  let user, reason;
  
  if (isSlash) {
    user = interaction.options.getUser('user');
    reason = interaction.options.getString('reason') || 'Không có lý do';
  } else {
    if (!args || args.length === 0) {
      const prefix = (await getServerConfig(interaction.guild.id)).prefix;
      return await interaction.reply(`❌ Format: \`${prefix}giveaway blacklist <@user> [reason]\``);
    }
    
    const userMatch = args[0].match(/<@!?(\d+)>/);
    if (!userMatch) {
      return await interaction.reply('❌ Vui lòng mention user cần blacklist!');
    }
    
    user = await interaction.client.users.fetch(userMatch[1]);
    reason = args.slice(1).join(' ') || 'Không có lý do';
  }
  
  const existing = await db.select()
    .from(giveawayBlacklist)
    .where(and(
      eq(giveawayBlacklist.serverId, interaction.guild.id),
      eq(giveawayBlacklist.userId, user.id)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    const msg = `❌ ${user.tag} đã bị blacklist rồi!`;
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  await db.insert(giveawayBlacklist).values({
    serverId: interaction.guild.id,
    userId: user.id,
    blacklistedBy: moderator.id,
    reason
  });
  
  const msg = `✅ Đã blacklist ${user.tag} khỏi giveaway!\nLý do: ${reason}`;
  if (isSlash) {
    await interaction.reply({ content: msg, ephemeral: true });
  } else {
    await interaction.react('✅');
  }
}

async function handleGiveawayUnblacklist(interaction, args = null) {
  const isSlash = interaction.isCommand && interaction.isCommand();
  
  if (!isAdmin(interaction.member)) {
    const msg = '❌ Chỉ admin mới có thể unblacklist!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  let user;
  
  if (isSlash) {
    user = interaction.options.getUser('user');
  } else {
    if (!args || args.length === 0) {
      const prefix = (await getServerConfig(interaction.guild.id)).prefix;
      return await interaction.reply(`❌ Format: \`${prefix}giveaway unblacklist <@user>\``);
    }
    
    const userMatch = args[0].match(/<@!?(\d+)>/);
    if (!userMatch) {
      return await interaction.reply('❌ Vui lòng mention user cần unblacklist!');
    }
    
    user = await interaction.client.users.fetch(userMatch[1]);
  }
  
  const result = await db.delete(giveawayBlacklist)
    .where(and(
      eq(giveawayBlacklist.serverId, interaction.guild.id),
      eq(giveawayBlacklist.userId, user.id)
    ))
    .returning();
  
  if (result.length === 0) {
    const msg = `❌ ${user.tag} không có trong blacklist!`;
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const msg = `✅ Đã unblacklist ${user.tag}!`;
  if (isSlash) {
    await interaction.reply({ content: msg, ephemeral: true });
  } else {
    await interaction.react('✅');
  }
}

async function handleGiveawayListBan(interaction) {
  const isSlash = interaction.isCommand && interaction.isCommand();
  
  const blacklist = await db.select()
    .from(giveawayBlacklist)
    .where(eq(giveawayBlacklist.serverId, interaction.guild.id));
  
  if (blacklist.length === 0) {
    const msg = '📋 Không có user nào bị blacklist!';
    if (isSlash) {
      return await interaction.reply({ content: msg, ephemeral: true });
    }
    return await interaction.reply(msg);
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🚫 Danh sách Blacklist Giveaway')
    .setColor(0xFF0000)
    .setTimestamp();
  
  for (const b of blacklist) {
    try {
      const user = await interaction.client.users.fetch(b.userId);
      embed.addFields({
        name: `${user.tag}`,
        value: `Lý do: ${b.reason}\nBởi: <@${b.blacklistedBy}>`,
        inline: false
      });
    } catch (err) {
      embed.addFields({
        name: `Unknown User (${b.userId})`,
        value: `Lý do: ${b.reason}\nBởi: <@${b.blacklistedBy}>`,
        inline: false
      });
    }
  }
  
  if (isSlash) {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
}

async function handleGiveawayFlash(interaction) {
  const user = interaction.user || interaction.author; // Support both slash and prefix
  
  if (!isAdmin(interaction.member)) {
    return await interaction.reply({ 
      content: '❌ Chỉ admin mới có thể sử dụng lệnh flash!', 
      ephemeral: true 
    });
  }
  
  const count = interaction.options.getInteger('count');
  const duration = interaction.options.getString('duration');
  const winnerCount = interaction.options.getInteger('winners') || 1;
  const prizeTemplate = interaction.options.getString('prize');
  const requiredRole = interaction.options.getRole('required_role')?.id;
  
  if (count < 1 || count > 10) {
    return await interaction.reply({ 
      content: '❌ Số lượng giveaway phải từ 1-10!', 
      ephemeral: true 
    });
  }
  
  const durationMs = parseDuration(duration);
  if (!durationMs || durationMs < 1000) {
    return await interaction.reply({ 
      content: '❌ Thời gian không hợp lệ! Dùng format: 1s, 1m, 1h, 1d', 
      ephemeral: true 
    });
  }
  
  await interaction.deferReply({ ephemeral: true });
  
  const endTime = new Date(Date.now() + durationMs);
  const createdIds = [];
  
  for (let i = 1; i <= count; i++) {
    const prize = prizeTemplate.replace('{n}', i).replace('{N}', i);
    
    const result = await db.insert(giveaways).values({
      serverId: interaction.guild.id,
      channelId: interaction.channel.id,
      hostId: user.id,
      prize,
      winnerCount,
      requiredRole: requiredRole || null,
      endTime,
      status: 'active'
    }).returning();
    
    const giveaway = result[0];
    createdIds.push(giveaway.id);
    
    const embed = createGiveawayEmbed(giveaway, 0, interaction.guild, interaction.client);
    
    const giveawayMsg = await interaction.channel.send({
      content: `🎊 **GIVEAWAY BẮT ĐẦU** 🎊`,
      embeds: [embed]
    });
    
    await giveawayMsg.react('🎉');
    
    await db.update(giveaways)
      .set({ messageId: giveawayMsg.id })
      .where(eq(giveaways.id, giveaway.id));
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  await interaction.editReply(`✅ Đã tạo ${count} giveaway!\nIDs: ${createdIds.join(', ')}`);
  
  await logger.log(
    LogLevel.INFO,
    LogCategory.COMMAND,
    '⚡ Flash Giveaway Created',
    interaction.guild,
    `Count: ${count}\nPrize Template: ${prizeTemplate}\nDuration: ${duration}\nHost: ${user.tag}`
  );
}

async function handleGiveawayReaction(reaction, user) {
  if (user.bot) return;
  if (reaction.emoji.name !== '🎉') return;
  
  const result = await db.select()
    .from(giveaways)
    .where(and(
      eq(giveaways.messageId, reaction.message.id),
      eq(giveaways.serverId, reaction.message.guild.id)
    ))
    .limit(1);
  
  if (!result.length) return;
  
  const giveaway = result[0];
  
  if (giveaway.status !== 'active') {
    try {
      await reaction.users.remove(user.id);
    } catch (err) {}
    return;
  }
  
  const blacklist = await db.select()
    .from(giveawayBlacklist)
    .where(and(
      eq(giveawayBlacklist.serverId, reaction.message.guild.id),
      eq(giveawayBlacklist.userId, user.id)
    ))
    .limit(1);
  
  if (blacklist.length > 0) {
    try {
      await reaction.users.remove(user.id);
      const dmChannel = await user.createDM();
      await dmChannel.send(`🚫 Bạn đã bị blacklist khỏi giveaway!\nLý do: ${blacklist[0].reason}`);
    } catch (err) {}
    return;
  }
  
  if (giveaway.requiredRole) {
    try {
      const member = await reaction.message.guild.members.fetch(user.id);
      if (!member.roles.cache.has(giveaway.requiredRole)) {
        await reaction.users.remove(user.id);
        const dmChannel = await user.createDM();
        await dmChannel.send(`❌ Bạn cần role <@&${giveaway.requiredRole}> để tham gia giveaway này!`);
        return;
      }
    } catch (err) {}
  }
  
  const existing = await db.select()
    .from(giveawayParticipants)
    .where(and(
      eq(giveawayParticipants.giveawayId, giveaway.id),
      eq(giveawayParticipants.userId, user.id)
    ))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(giveawayParticipants).values({
      giveawayId: giveaway.id,
      userId: user.id
    });
    
    const participants = await db.select()
      .from(giveawayParticipants)
      .where(eq(giveawayParticipants.giveawayId, giveaway.id));
    
    const updatedEmbed = createGiveawayEmbed(giveaway, participants.length, reaction.message.guild, reaction.client);
    
    try {
      await reaction.message.edit({
        embeds: [updatedEmbed]
      });
    } catch (err) {
      console.error('Error updating giveaway embed:', err);
    }
    
    console.log(`✅ User ${user.tag} joined giveaway #${giveaway.id} (${participants.length} total)`);
  }
}

async function handleGiveawayReactionRemove(reaction, user) {
  if (user.bot) return;
  if (reaction.emoji.name !== '🎉') return;
  
  const result = await db.select()
    .from(giveaways)
    .where(and(
      eq(giveaways.messageId, reaction.message.id),
      eq(giveaways.serverId, reaction.message.guild.id)
    ))
    .limit(1);
  
  if (!result.length) return;
  
  const giveaway = result[0];
  
  if (giveaway.status !== 'active') return;
  
  await db.delete(giveawayParticipants)
    .where(and(
      eq(giveawayParticipants.giveawayId, giveaway.id),
      eq(giveawayParticipants.userId, user.id)
    ));
  
  const participants = await db.select()
    .from(giveawayParticipants)
    .where(eq(giveawayParticipants.giveawayId, giveaway.id));
  
  const updatedEmbed = createGiveawayEmbed(giveaway, participants.length, reaction.message.guild, reaction.client);
  
  try {
    await reaction.message.edit({
      embeds: [updatedEmbed]
    });
  } catch (err) {
    console.error('Error updating giveaway embed:', err);
  }
  
  console.log(`❌ User ${user.tag} left giveaway #${giveaway.id} (${participants.length} total)`);
}

module.exports = {
  handleGiveawayCreate,
  handleGiveawayEnd,
  handleGiveawayReroll,
  handleGiveawayList,
  handleGiveawayBlacklist,
  handleGiveawayUnblacklist,
  handleGiveawayListBan,
  handleGiveawayFlash,
  handleGiveawayReaction,
  handleGiveawayReactionRemove,
  selectWinners,
  createGiveawayEmbed
};
