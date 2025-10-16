const fetch = require('node-fetch');
const { db } = require('../database/db');
const { settings } = require('../database/schema');
const { eq } = require('drizzle-orm');

class TopGGService {
  constructor() {
    this.baseUrl = 'https://top.gg/api';
    this.apiKey = null;
    this.autoPost = false;
    this.postInterval = null;
  }

  async loadConfig() {
    try {
      const config = await db.select().from(settings).where(eq(settings.id, 'global')).limit(1);
      if (config[0]) {
        this.apiKey = config[0].topggApiKey;
        this.autoPost = config[0].topggAutoPost || false;
      }
    } catch (error) {
      console.error('[Top.gg] Failed to load config:', error);
    }
  }

  async postStats(client) {
    if (!this.apiKey) {
      console.log('[Top.gg] API key not configured, skipping stats post');
      return;
    }

    try {
      const serverCount = client.guilds.cache.size;
      const shardCount = client.shard ? client.shard.count : 1;

      const response = await fetch(`${this.baseUrl}/bots/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          server_count: serverCount,
          shard_count: shardCount
        })
      });

      if (response.ok) {
        console.log(`[Top.gg] ✅ Posted stats: ${serverCount} servers`);
      } else {
        const error = await response.text();
        console.error('[Top.gg] Failed to post stats:', error);
      }
    } catch (error) {
      console.error('[Top.gg] Error posting stats:', error);
    }
  }

  async getBotStats(botId) {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/bots/${botId}`, {
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('[Top.gg] Error fetching bot stats:', error);
      return null;
    }
  }

  async checkVote(userId) {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/bots/${process.env.DISCORD_CLIENT_ID}/check?userId=${userId}`, {
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.voted === 1;
      }
      return false;
    } catch (error) {
      console.error('[Top.gg] Error checking vote:', error);
      return false;
    }
  }

  startAutoPost(client) {
    this.loadConfig().then(() => {
      if (this.autoPost && this.apiKey) {
        // Post immediately
        this.postStats(client);

        // Then post every 30 minutes
        this.postInterval = setInterval(() => {
          this.postStats(client);
        }, 30 * 60 * 1000);

        console.log('[Top.gg] ✅ Auto-post enabled (every 30 minutes)');
      }
    });
  }

  stopAutoPost() {
    if (this.postInterval) {
      clearInterval(this.postInterval);
      this.postInterval = null;
      console.log('[Top.gg] Auto-post stopped');
    }
  }
}

module.exports = new TopGGService();
