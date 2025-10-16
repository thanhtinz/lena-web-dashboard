const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { pool } = require('../database/db');

// In-memory tracker for message counts (cleared on bot restart)
const messageCounters = new Map(); // channelId -> count

// Active sticky timers
const stickyTimers = new Map(); // channelId -> timeout

/**
 * Handle sticky message creation
 */
async function handleStick(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ You need `Manage Messages` permission to use this command!');
  }

  if (args.length === 0) {
    return message.reply('❌ Usage: `!stick <message>` or `!stick <mode:message|time> <value> <message>`\n\nExamples:\n`!stick Welcome to the server!` - Resend after 1 message (default)\n`!stick message 5 Join our Discord!` - Resend after 5 messages\n`!stick time 300 Check out announcements!` - Resend every 300 seconds (5 min)');
  }

  const channelId = message.channel.id;
  const serverId = message.guild.id;

  // Check if sticky already exists
  const existing = await pool.query(
    `SELECT id FROM sticky_messages WHERE server_id = $1 AND channel_id = $2 AND is_active = true LIMIT 1`,
    [serverId, channelId]
  );

  if (existing.rows.length > 0) {
    return message.reply('❌ A sticky message already exists in this channel! Use `!stickremove` to delete it first.');
  }

  // Parse arguments
  let mode = 'message';
  let value = 1;
  let content = args.join(' ');

  if (args[0] === 'message' || args[0] === 'time') {
    mode = args[0];
    value = parseInt(args[1]);
    
    if (isNaN(value) || value < 1) {
      return message.reply(`❌ Invalid ${mode} value! Must be a positive number.`);
    }

    if (mode === 'message' && value > 50) {
      return message.reply('❌ Message count cannot exceed 50!');
    }

    if (mode === 'time' && value < 10) {
      return message.reply('❌ Time interval must be at least 10 seconds!');
    }

    content = args.slice(2).join(' ');
  }

  if (!content || content.trim().length === 0) {
    return message.reply('❌ Sticky message cannot be empty!');
  }

  // Send initial sticky message
  const stickyMsg = await message.channel.send(content);

  // Save to database
  const result = await pool.query(
    `INSERT INTO sticky_messages (server_id, channel_id, message_content, mode, message_count, time_interval, current_message_id, created_by, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
     RETURNING id`,
    [
      serverId,
      channelId,
      content,
      mode,
      mode === 'message' ? value : 1,
      mode === 'time' ? value : null,
      stickyMsg.id,
      message.author.id
    ]
  );

  // Initialize counter/timer
  if (mode === 'message') {
    messageCounters.set(channelId, 0);
  } else {
    startStickyTimer(message.client, serverId, channelId, value, content, stickyMsg.id);
  }

  await message.reply(`✅ Sticky message created! Mode: **${mode}** ${mode === 'message' ? `(resend after ${value} message${value > 1 ? 's' : ''})` : `(resend every ${value} seconds)`}`);
  
  // Delete command message after 5 seconds
  setTimeout(() => message.delete().catch(() => {}), 5000);
}

/**
 * Handle sticky stop (pause)
 */
async function handleStickStop(message) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ You need `Manage Messages` permission!');
  }

  const channelId = message.channel.id;
  const serverId = message.guild.id;

  const result = await pool.query(
    `UPDATE sticky_messages SET is_active = false, updated_at = NOW()
     WHERE server_id = $1 AND channel_id = $2 AND is_active = true
     RETURNING id`,
    [serverId, channelId]
  );

  if (result.rows.length === 0) {
    return message.reply('❌ No active sticky message found in this channel!');
  }

  // Clear timer if exists
  const timer = stickyTimers.get(channelId);
  if (timer) {
    clearTimeout(timer);
    stickyTimers.delete(channelId);
  }

  // Clear counter
  messageCounters.delete(channelId);

  await message.reply('⏸️ Sticky message paused. Use `!stickstart` to resume.');
}

/**
 * Handle sticky start/resume
 */
async function handleStickStart(message) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ You need `Manage Messages` permission!');
  }

  const channelId = message.channel.id;
  const serverId = message.guild.id;

  const result = await pool.query(
    `UPDATE sticky_messages SET is_active = true, updated_at = NOW()
     WHERE server_id = $1 AND channel_id = $2 AND is_active = false
     RETURNING id, mode, message_count, time_interval, message_content, current_message_id`,
    [serverId, channelId]
  );

  if (result.rows.length === 0) {
    return message.reply('❌ No paused sticky message found! Use `!stick` to create one.');
  }

  const sticky = result.rows[0];

  // Restart counter/timer
  if (sticky.mode === 'message') {
    messageCounters.set(channelId, 0);
  } else {
    startStickyTimer(message.client, serverId, channelId, sticky.time_interval, sticky.message_content, sticky.current_message_id);
  }

  await message.reply('▶️ Sticky message resumed!');
}

/**
 * Handle sticky remove
 */
async function handleStickRemove(message) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ You need `Manage Messages` permission!');
  }

  const channelId = message.channel.id;
  const serverId = message.guild.id;

  const result = await pool.query(
    `DELETE FROM sticky_messages WHERE server_id = $1 AND channel_id = $2
     RETURNING id, current_message_id`,
    [serverId, channelId]
  );

  if (result.rows.length === 0) {
    return message.reply('❌ No sticky message found in this channel!');
  }

  // Clear timer
  const timer = stickyTimers.get(channelId);
  if (timer) {
    clearTimeout(timer);
    stickyTimers.delete(channelId);
  }

  // Clear counter
  messageCounters.delete(channelId);

  // Delete the sticky message from Discord
  try {
    const msgId = result.rows[0].current_message_id;
    if (msgId) {
      const stickyMsg = await message.channel.messages.fetch(msgId).catch(() => null);
      if (stickyMsg) await stickyMsg.delete().catch(() => {});
    }
  } catch (error) {
    console.error('Failed to delete sticky message:', error);
  }

  await message.reply('🗑️ Sticky message removed completely!');
}

/**
 * Get all stickies in server
 */
async function handleGetStickies(message) {
  const serverId = message.guild.id;

  const result = await pool.query(
    `SELECT channel_id, message_content, mode, message_count, time_interval, is_active
     FROM sticky_messages WHERE server_id = $1 ORDER BY created_at DESC`,
    [serverId]
  );

  if (result.rows.length === 0) {
    return message.reply('📌 No sticky messages found in this server!');
  }

  const embed = new EmbedBuilder()
    .setTitle('📌 Active Sticky Messages')
    .setColor(0x5865F2)
    .setDescription(result.rows.map((s, i) => {
      const channel = `<#${s.channel_id}>`;
      const status = s.is_active ? '✅' : '⏸️';
      const modeText = s.mode === 'message' 
        ? `After ${s.message_count} msg${s.message_count > 1 ? 's' : ''}` 
        : `Every ${s.time_interval}s`;
      const preview = s.message_content.length > 50 
        ? s.message_content.substring(0, 50) + '...' 
        : s.message_content;
      return `**${i + 1}.** ${status} ${channel} - ${modeText}\n\`${preview}\``;
    }).join('\n\n'))
    .setFooter({ text: `${result.rows.length} sticky message${result.rows.length > 1 ? 's' : ''}` })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

/**
 * Start time-based sticky timer
 */
function startStickyTimer(client, serverId, channelId, interval, content, previousMsgId) {
  // Clear existing timer
  const existing = stickyTimers.get(channelId);
  if (existing) clearTimeout(existing);

  const timer = setInterval(async () => {
    try {
      // Check if sticky is still active
      const check = await pool.query(
        `SELECT id, is_active FROM sticky_messages WHERE server_id = $1 AND channel_id = $2`,
        [serverId, channelId]
      );

      if (check.rows.length === 0 || !check.rows[0].is_active) {
        clearInterval(timer);
        stickyTimers.delete(channelId);
        return;
      }

      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) {
        clearInterval(timer);
        stickyTimers.delete(channelId);
        return;
      }

      // Delete previous sticky message
      if (previousMsgId) {
        const oldMsg = await channel.messages.fetch(previousMsgId).catch(() => null);
        if (oldMsg) await oldMsg.delete().catch(() => {});
      }

      // Send new sticky
      const newMsg = await channel.send(content);

      // Update database
      await pool.query(
        `UPDATE sticky_messages SET current_message_id = $1, last_sent_at = NOW()
         WHERE server_id = $2 AND channel_id = $3`,
        [newMsg.id, serverId, channelId]
      );

      previousMsgId = newMsg.id;
    } catch (error) {
      console.error('Sticky timer error:', error);
    }
  }, interval * 1000);

  stickyTimers.set(channelId, timer);
}

/**
 * Handle message-based sticky (called from messageCreate event)
 */
async function checkStickyMessage(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  const channelId = message.channel.id;
  const serverId = message.guild.id;

  // Get sticky config
  const result = await pool.query(
    `SELECT id, message_content, mode, message_count, current_message_id, current_message_count, embed_config
     FROM sticky_messages WHERE server_id = $1 AND channel_id = $2 AND is_active = true AND mode = 'message'`,
    [serverId, channelId]
  );

  if (result.rows.length === 0) return;

  const sticky = result.rows[0];
  let count = messageCounters.get(channelId) || 0;
  count++;
  messageCounters.set(channelId, count);

  if (count >= sticky.message_count) {
    // Reset counter
    messageCounters.set(channelId, 0);

    // Delete old sticky
    try {
      if (sticky.current_message_id) {
        const oldMsg = await message.channel.messages.fetch(sticky.current_message_id).catch(() => null);
        if (oldMsg) await oldMsg.delete().catch(() => {});
      }
    } catch (error) {
      console.error('Failed to delete old sticky:', error);
    }

    // Send new sticky
    let newMsg;
    if (sticky.embed_config) {
      const embed = new EmbedBuilder()
        .setTitle(sticky.embed_config.title || null)
        .setDescription(sticky.embed_config.description || null)
        .setColor(sticky.embed_config.color || 0x5865F2);
      
      if (sticky.embed_config.thumbnail) embed.setThumbnail(sticky.embed_config.thumbnail);
      if (sticky.embed_config.image) embed.setImage(sticky.embed_config.image);
      if (sticky.embed_config.footer) embed.setFooter(sticky.embed_config.footer);
      
      newMsg = await message.channel.send({ embeds: [embed] });
    } else {
      newMsg = await message.channel.send(sticky.message_content);
    }

    // Update database
    await pool.query(
      `UPDATE sticky_messages SET current_message_id = $1, current_message_count = 0, last_sent_at = NOW()
       WHERE id = $2`,
      [newMsg.id, sticky.id]
    );
  } else {
    // Update counter in database
    await pool.query(
      `UPDATE sticky_messages SET current_message_count = $1 WHERE id = $2`,
      [count, sticky.id]
    );
  }
}

/**
 * Initialize sticky system on bot startup
 */
async function initializeStickySystem(client) {
  try {
    const result = await pool.query(
      `SELECT server_id, channel_id, mode, time_interval, message_content, current_message_id
       FROM sticky_messages WHERE is_active = true AND mode = 'time'`
    );

    for (const sticky of result.rows) {
      startStickyTimer(
        client, 
        sticky.server_id, 
        sticky.channel_id, 
        sticky.time_interval, 
        sticky.message_content, 
        sticky.current_message_id
      );
    }

    console.log(`✅ Initialized ${result.rows.length} time-based sticky messages`);
  } catch (error) {
    console.error('Failed to initialize sticky system:', error);
  }
}

module.exports = {
  handleStick,
  handleStickStop,
  handleStickStart,
  handleStickRemove,
  handleGetStickies,
  checkStickyMessage,
  initializeStickySystem
};
