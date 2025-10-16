const { ShardingManager } = require('discord.js');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

class ClusterManager {
  constructor() {
    this.clusters = [];
    this.metrics = new Map();
  }

  async start() {
    const manager = new ShardingManager(path.join(__dirname, '../index.js'), {
      token: process.env.DISCORD_BOT_TOKEN,
      totalShards: 'auto',
      shardList: 'auto',
      mode: 'process',
      respawn: true,
    });

    manager.on('shardCreate', shard => {
      console.log(`[SHARD] Launched shard ${shard.id}`);
      
      // Listen for shard metrics
      shard.on('message', message => {
        if (message.type === 'metrics') {
          this.updateMetrics(shard.id, message.data);
        }
      });

      // Track shard ready
      shard.on('ready', () => {
        console.log(`[SHARD] Shard ${shard.id} ready`);
      });

      // Track shard errors
      shard.on('error', error => {
        console.error(`[SHARD] Shard ${shard.id} error:`, error);
      });
    });

    await manager.spawn();
    this.manager = manager;

    // Start metrics collection interval
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  async collectMetrics() {
    if (!this.manager) return;

    for (const [shardId, shard] of this.manager.shards.entries()) {
      try {
        // Fetch metrics inline instead of using getMetrics() method
        const servers = await shard.fetchClientValue('this.guilds.cache.size');
        const users = await shard.fetchClientValue('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)');
        const latency = await shard.fetchClientValue('this.ws.ping');
        const uptime = await shard.fetchClientValue('this.uptime');
        const memUsage = await shard.fetchClientValue('process.memoryUsage().heapUsed');
        
        const metrics = {
          shardId,
          servers,
          users,
          latency,
          uptime,
          memUsage
        };
        
        this.updateMetrics(shardId, metrics);
        
        // Save to database
        await this.saveMetricsToDatabase(shardId, metrics);
      } catch (error) {
        console.error(`Failed to collect metrics from shard ${shardId}:`, error.message);
      }
    }
  }

  async saveMetricsToDatabase(shardId, metrics) {
    try {
      const clusterId = Math.floor(shardId / 4);
      
      // Delete old metrics for this shard (keep only latest)
      await sql`DELETE FROM shard_metrics WHERE shard_id = ${shardId}`;
      
      // Insert new metrics
      await sql`
        INSERT INTO shard_metrics (
          shard_id, cluster_id, servers, cached_users, latency,
          uptime, mem_usage, status, last_updated
        ) VALUES (
          ${shardId},
          ${clusterId},
          ${metrics.servers || 0},
          ${metrics.users || 0},
          ${metrics.latency || 0},
          ${this.formatUptime(metrics.uptime || 0)},
          ${metrics.memUsage || 0},
          'online',
          NOW()
        )
      `;
    } catch (error) {
      console.error(`Failed to save metrics for shard ${shardId}:`, error.message);
    }
  }

  updateMetrics(shardId, data) {
    const clusterId = Math.floor(shardId / 4); // 4 shards per cluster
    
    if (!this.metrics.has(clusterId)) {
      this.metrics.set(clusterId, {
        shards: [],
        servers: 0,
        cachedUsers: 0,
        latency: 0,
        uptime: 0,
        memUsage: 0,
        lastUpdated: Date.now()
      });
    }

    const cluster = this.metrics.get(clusterId);
    if (!cluster.shards.includes(shardId)) {
      cluster.shards.push(shardId);
    }

    // Aggregate metrics
    cluster.servers += data.servers || 0;
    cluster.cachedUsers += data.users || 0;
    cluster.latency = Math.max(cluster.latency, data.latency || 0);
    cluster.uptime = data.uptime || 0;
    cluster.memUsage += data.memUsage || 0;
    cluster.lastUpdated = Date.now();
  }

  getStatus() {
    const clusters = [];
    
    for (const [clusterId, data] of this.metrics.entries()) {
      clusters.push({
        id: clusterId,
        shards: data.shards.sort((a, b) => a - b),
        servers: data.servers,
        cachedUsers: data.cachedUsers,
        latency: `${data.latency}ms`,
        uptime: this.formatUptime(data.uptime),
        memUsage: `${(data.memUsage / 1024 / 1024).toFixed(2)} MB`,
        lastUpdated: Math.floor((Date.now() - data.lastUpdated) / 1000),
        status: 'online'
      });
    }

    return clusters.sort((a, b) => a.id - b.id);
  }

  formatUptime(ms) {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Just now';
  }

  findShard(serverId) {
    const shardId = Number(BigInt(serverId) >> 22n) % this.manager.totalShards;
    const clusterId = Math.floor(shardId / 4);
    return { shardId, clusterId };
  }
}

module.exports = new ClusterManager();
