import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch stats from database
    const statsResult = await db.execute(sql`
      SELECT 
        (SELECT COUNT(DISTINCT server_id) FROM server_configs) as total_servers,
        (SELECT COUNT(DISTINCT user_id) FROM conversation_history) as total_users,
        (SELECT COUNT(*) FROM conversation_history WHERE created_at > NOW() - INTERVAL '24 hours') as active_conversations
    `);
    
    const stats = statsResult.rows[0];
    const activeConversations = Number(stats.active_conversations) || 0;

    // Fetch shard metrics from database
    const shardMetricsResult = await db.execute(sql`
      SELECT 
        shard_id,
        cluster_id,
        servers,
        cached_users,
        latency,
        uptime,
        mem_usage,
        status,
        EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER as seconds_ago
      FROM shard_metrics
      ORDER BY cluster_id, shard_id
    `);

    // Group shards by cluster
    const clusterMap = new Map();
    let totalServers = 0;
    let totalUsers = 0;
    let totalShards = 0;

    for (const row of shardMetricsResult.rows) {
      const clusterId = Number(row.cluster_id);
      const shardId = Number(row.shard_id);
      const servers = Number(row.servers) || 0;
      const users = Number(row.cached_users) || 0;
      const secondsAgo = Number(row.seconds_ago) || 0;
      
      totalServers += servers;
      totalUsers += users;
      totalShards++;

      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, {
          id: clusterId,
          shards: [],
          servers: 0,
          cachedUsers: 0,
          latency: `${row.latency}ms`,
          uptime: row.uptime || 'Unknown',
          memUsage: `${(Number(row.mem_usage) / 1024 / 1024).toFixed(2)} MB`,
          lastUpdated: secondsAgo,
          status: row.status as 'online' | 'offline' | 'degraded'
        });
      }

      const cluster = clusterMap.get(clusterId);
      cluster.shards.push(shardId);
      cluster.servers += servers;
      cluster.cachedUsers += users;
    }

    const clusters = Array.from(clusterMap.values()).sort((a, b) => a.id - b.id);

    // If no metrics yet (bot just started), return default
    if (clusters.length === 0) {
      clusters.push({
        id: 0,
        shards: [0],
        servers: Number(stats.total_servers) || 0,
        cachedUsers: Number(stats.total_users) || 0,
        latency: '0ms',
        uptime: 'Starting...',
        memUsage: '0 MB',
        lastUpdated: 0,
        status: 'online' as const
      });
      totalShards = 1;
      totalServers = Number(stats.total_servers) || 0;
      totalUsers = Number(stats.total_users) || 0;
    }

    return NextResponse.json({
      success: true,
      clusters,
      totalShards,
      totalServers,
      totalUsers,
      activeConversations,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error fetching bot status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { serverId } = await request.json();
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
    }

    // Get total shards from database
    const shardCountResult = await db.execute(sql`
      SELECT COUNT(DISTINCT shard_id) as total_shards FROM shard_metrics
    `);
    
    let totalShards = Number(shardCountResult.rows[0]?.total_shards) || 1;
    if (totalShards === 0) totalShards = 1; // Fallback if no metrics yet
    
    const shardsPerCluster = 4;
    const shardId = Number(BigInt(serverId) >> BigInt(22)) % totalShards;
    const clusterId = Math.floor(shardId / shardsPerCluster);

    return NextResponse.json({
      success: true,
      serverId,
      shardId,
      clusterId
    });
  } catch (error) {
    console.error('Error finding shard:', error);
    return NextResponse.json(
      { error: 'Invalid server ID' },
      { status: 400 }
    );
  }
}
