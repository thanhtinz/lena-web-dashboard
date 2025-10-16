const { EmbedBuilder } = require('discord.js');

// Log levels
const LogLevel = {
  ERROR: { name: 'ERROR', color: 0xFF0000, emoji: '🔴', priority: 4 },
  WARN: { name: 'WARN', color: 0xFFA500, emoji: '🟠', priority: 3 },
  INFO: { name: 'INFO', color: 0x0099FF, emoji: '🔵', priority: 2 },
  DEBUG: { name: 'DEBUG', color: 0x808080, emoji: '⚪', priority: 1 }
};

// Log categories
const LogCategory = {
  COMMAND: '📝 Command',
  ERROR: '❌ Error',
  EVENT: '🎉 Event',
  SYSTEM: '⚙️ System',
  SECURITY: '🔒 Security',
  API: '🌐 API',
  DATABASE: '🗄️ Database',
  MODERATION: '🛡️ Moderation',
  CONFIG: '⚙️ Config'
};

class Logger {
  constructor() {
    this.logChannelId = null;
    this.logServerId = null;
    this.client = null;
    this.currentLogLevel = LogLevel.INFO;
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Initialize logger with Discord client and channel info
   */
  initialize(client, logChannelId, logServerId) {
    this.client = client;
    this.logChannelId = logChannelId;
    this.logServerId = logServerId;
    console.log(`✅ Logger initialized - Logs will be sent to channel ${logChannelId}`);
  }

  /**
   * Set minimum log level
   */
  setLogLevel(level) {
    this.currentLogLevel = level;
    console.log(`📊 Log level set to: ${level.name}`);
  }

  /**
   * Check if log level should be processed
   */
  shouldLog(level) {
    return level.priority >= this.currentLogLevel.priority;
  }

  /**
   * Send log to Discord channel
   */
  async sendToDiscord(embed) {
    if (!this.client || !this.logChannelId) {
      console.log('⚠️ Logger not initialized, skipping Discord log');
      return;
    }

    try {
      const channel = await this.client.channels.fetch(this.logChannelId);
      if (channel && channel.isTextBased()) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('❌ Failed to send log to Discord:', error.message);
    }
  }

  /**
   * Add log to queue and process
   */
  async addToQueue(embed) {
    this.queue.push(embed);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Process log queue to avoid rate limits
   */
  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const embed = this.queue.shift();
    await this.sendToDiscord(embed);
    
    // Wait 1 second between logs to avoid rate limits
    setTimeout(() => this.processQueue(), 1000);
  }

  /**
   * Create embed for log
   */
  createEmbed(level, category, message, details = {}) {
    const embed = new EmbedBuilder()
      .setColor(level.color)
      .setTitle(`${level.emoji} ${level.name} - ${category}`)
      .setDescription(message)
      .setTimestamp();

    // Add fields for details
    if (details.server) {
      embed.addFields({ name: '🏠 Server', value: details.server, inline: true });
    }
    if (details.user) {
      embed.addFields({ name: '👤 User', value: details.user, inline: true });
    }
    if (details.channel) {
      embed.addFields({ name: '📢 Channel', value: details.channel, inline: true });
    }
    if (details.command) {
      embed.addFields({ name: '⚡ Command', value: `\`${details.command}\``, inline: true });
    }
    if (details.error) {
      embed.addFields({ name: '🐛 Error Details', value: `\`\`\`${details.error.substring(0, 1000)}\`\`\``, inline: false });
    }
    if (details.stack) {
      embed.addFields({ name: '📋 Stack Trace', value: `\`\`\`${details.stack.substring(0, 1000)}\`\`\``, inline: false });
    }
    if (details.extra) {
      embed.addFields({ name: 'ℹ️ Additional Info', value: details.extra, inline: false });
    }

    return embed;
  }

  /**
   * Log methods
   */
  async error(category, message, details = {}) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    console.error(`🔴 [ERROR] [${category}] ${message}`, details);
    const embed = this.createEmbed(LogLevel.ERROR, category, message, details);
    await this.addToQueue(embed);
  }

  async warn(category, message, details = {}) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    console.warn(`🟠 [WARN] [${category}] ${message}`, details);
    const embed = this.createEmbed(LogLevel.WARN, category, message, details);
    await this.addToQueue(embed);
  }

  async info(category, message, details = {}) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    console.log(`🔵 [INFO] [${category}] ${message}`, details);
    const embed = this.createEmbed(LogLevel.INFO, category, message, details);
    await this.addToQueue(embed);
  }

  async debug(category, message, details = {}) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    console.log(`⚪ [DEBUG] [${category}] ${message}`, details);
    const embed = this.createEmbed(LogLevel.DEBUG, category, message, details);
    await this.addToQueue(embed);
  }

  /**
   * Specialized log methods
   */
  async logCommand(commandName, user, server, channel, success = true) {
    const message = success 
      ? `✅ Command executed successfully`
      : `❌ Command execution failed`;
    
    await this.info(LogCategory.COMMAND, message, {
      command: commandName,
      user: `${user.tag} (${user.id})`,
      server: `${server.name} (${server.id})`,
      channel: `#${channel.name} (${channel.id})`
    });
  }

  async logError(errorMessage, error, context = {}) {
    await this.error(LogCategory.ERROR, errorMessage, {
      ...context,
      error: error.message,
      stack: error.stack
    });
  }

  async logEvent(eventName, details = {}) {
    await this.info(LogCategory.EVENT, eventName, details);
  }

  async logSecurity(message, details = {}) {
    await this.warn(LogCategory.SECURITY, message, details);
  }

  async logAPI(apiName, success, details = {}) {
    const message = success 
      ? `✅ ${apiName} API call successful`
      : `❌ ${apiName} API call failed`;
    
    await this.info(LogCategory.API, message, details);
  }

  async logDatabase(operation, success, details = {}) {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = success 
      ? `✅ Database ${operation} successful`
      : `❌ Database ${operation} failed`;
    
    if (success) {
      await this.info(LogCategory.DATABASE, message, details);
    } else {
      await this.error(LogCategory.DATABASE, message, details);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      currentLevel: this.currentLogLevel.name,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      channelId: this.logChannelId,
      serverId: this.logServerId
    };
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = {
  logger,
  LogLevel,
  LogCategory
};
