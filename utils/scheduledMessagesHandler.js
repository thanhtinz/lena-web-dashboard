const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

// Store active cron jobs
const activeJobs = new Map();

// Initialize scheduler - load all scheduled messages and start cron jobs
async function initScheduler(client, db) {
  console.log('🕐 Initializing scheduled messages...');
  
  try {
    const { scheduledMessages } = await import('../database/schema.js');
    const { eq } = await import('drizzle-orm');
    
    // Load all active scheduled messages
    const messages = await db.select()
      .from(scheduledMessages)
      .where(eq(scheduledMessages.enabled, true));
    
    for (const msg of messages) {
      startCronJob(client, db, msg);
    }
    
    console.log(`✅ Loaded ${messages.length} scheduled messages`);
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error);
  }
}

// Start a cron job for a scheduled message
function startCronJob(client, db, messageData) {
  const { id, serverId, channelId, message, embedData, cronExpression } = messageData;
  
  // Stop existing job if any
  if (activeJobs.has(id)) {
    activeJobs.get(id).stop();
    activeJobs.delete(id);
  }
  
  // Validate cron expression
  if (!cron.validate(cronExpression)) {
    console.error(`❌ Invalid cron expression for message ${id}: ${cronExpression}`);
    return;
  }
  
  // Create and start cron job
  const job = cron.schedule(cronExpression, async () => {
    try {
      const guild = await client.guilds.fetch(serverId).catch(() => null);
      if (!guild) return;
      
      const channel = await guild.channels.fetch(channelId).catch(() => null);
      if (!channel || !channel.isTextBased()) return;
      
      // Prepare message
      const messageOptions = {};
      
      if (message) {
        messageOptions.content = message;
      }
      
      if (embedData) {
        const embed = new EmbedBuilder()
          .setTitle(embedData.title || null)
          .setDescription(embedData.description || null)
          .setColor(embedData.color || 0x5865F2);
        
        if (embedData.footer) {
          embed.setFooter({ text: embedData.footer });
        }
        
        if (embedData.thumbnail) {
          embed.setThumbnail(embedData.thumbnail);
        }
        
        if (embedData.image) {
          embed.setImage(embedData.image);
        }
        
        messageOptions.embeds = [embed];
      }
      
      // Send message
      await channel.send(messageOptions);
      
      // Update last sent timestamp
      const { scheduledMessages } = await import('../database/schema.js');
      const { eq } = await import('drizzle-orm');
      
      await db.update(scheduledMessages)
        .set({ lastSent: new Date() })
        .where(eq(scheduledMessages.id, id));
      
      console.log(`📨 Sent scheduled message #${id} to ${guild.name}`);
    } catch (error) {
      console.error(`❌ Failed to send scheduled message #${id}:`, error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });
  
  activeJobs.set(id, job);
  console.log(`🕐 Started cron job for message #${id}: ${cronExpression}`);
}

// Stop a cron job
function stopCronJob(messageId) {
  if (activeJobs.has(messageId)) {
    activeJobs.get(messageId).stop();
    activeJobs.delete(messageId);
    console.log(`⏹️ Stopped cron job for message #${messageId}`);
  }
}

// Reload scheduled messages for a server
async function reloadScheduledMessages(client, db, serverId) {
  try {
    const { scheduledMessages } = await import('../database/schema.js');
    const { eq, and } = await import('drizzle-orm');
    
    // Stop all jobs for this server
    const allJobs = Array.from(activeJobs.keys());
    for (const jobId of allJobs) {
      // Check if this job belongs to the server (we need to query)
      const msg = await db.select()
        .from(scheduledMessages)
        .where(and(
          eq(scheduledMessages.id, jobId),
          eq(scheduledMessages.serverId, serverId)
        ))
        .limit(1);
      
      if (msg.length > 0) {
        stopCronJob(jobId);
      }
    }
    
    // Load and start new jobs
    const messages = await db.select()
      .from(scheduledMessages)
      .where(and(
        eq(scheduledMessages.serverId, serverId),
        eq(scheduledMessages.enabled, true)
      ));
    
    for (const msg of messages) {
      startCronJob(client, db, msg);
    }
    
    console.log(`🔄 Reloaded ${messages.length} scheduled messages for server ${serverId}`);
  } catch (error) {
    console.error('❌ Failed to reload scheduled messages:', error);
  }
}

module.exports = {
  initScheduler,
  startCronJob,
  stopCronJob,
  reloadScheduledMessages
};
