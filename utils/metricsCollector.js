const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

class MetricsCollector {
  constructor(client) {
    this.client = client;
    this.startTime = Date.now();
  }

  getMetrics() {
    return {
      shardId: this.client.shard?.ids[0] || 0,
      servers: this.client.guilds.cache.size,
      users: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      latency: this.client.ws.ping,
      uptime: Date.now() - this.startTime,
      memUsage: process.memoryUsage().heapUsed,
      timestamp: Date.now()
    };
  }

  formatUptime(ms) {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Just now';
  }

  async saveMetricsToDatabase() {
    try {
      const metrics = this.getMetrics();
      const clusterId = Math.floor(metrics.shardId / 4);
      
      // Delete old metrics for this shard (keep only latest)
      await sql`DELETE FROM shard_metrics WHERE shard_id = ${metrics.shardId}`;
      
      // Insert new metrics
      await sql`
        INSERT INTO shard_metrics (
          shard_id, cluster_id, servers, cached_users, latency,
          uptime, mem_usage, status, last_updated
        ) VALUES (
          ${metrics.shardId},
          ${clusterId},
          ${metrics.servers},
          ${metrics.users},
          ${metrics.latency},
          ${this.formatUptime(metrics.uptime)},
          ${metrics.memUsage},
          'online',
          NOW()
        )
      `;
      
      console.log(`📊 [Metrics] Shard ${metrics.shardId}: ${metrics.servers} servers, ${metrics.users} users, ${metrics.latency}ms`);
    } catch (error) {
      console.error(`Failed to save metrics to database:`, error.message);
    }
  }

  startReporting() {
    // Save metrics to database directly every 30 seconds
    setInterval(async () => {
      await this.saveMetricsToDatabase();
      
      // Also send to shard manager if in sharding mode
      if (this.client.shard) {
        this.client.shard.send({
          type: 'metrics',
          data: this.getMetrics()
        });
      }
    }, 30000);
    
    // Save initial metrics after 5 seconds
    setTimeout(async () => {
      await this.saveMetricsToDatabase();
    }, 5000);
  }
}

module.exports = MetricsCollector;
