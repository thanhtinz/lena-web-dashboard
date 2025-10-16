'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faArrowRight, faServer, faUsers, faClock, faMemory } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface Cluster {
  id: number;
  shards: number[];
  servers: number;
  cachedUsers: number;
  latency: string;
  uptime: string;
  memUsage: string;
  lastUpdated: number;
  status: 'online' | 'offline' | 'degraded';
}

interface StatusData {
  success: boolean;
  clusters: Cluster[];
  totalShards: number;
  totalServers: number;
  totalUsers: number;
  activeConversations: number;
  lastUpdated: number;
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [serverId, setServerId] = useState('');
  const [foundShard, setFoundShard] = useState<{ shardId: number; clusterId: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/bot-status');
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const findShard = async () => {
    if (!serverId.trim()) return;
    
    try {
      const response = await fetch('/api/bot-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId })
      });
      
      const result = await response.json();
      if (result.success) {
        setFoundShard({ shardId: result.shardId, clusterId: result.clusterId });
      }
    } catch (error) {
      console.error('Failed to find shard:', error);
      alert('Invalid server ID');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'degraded': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500/10';
      case 'offline': return 'bg-red-500/10';
      case 'degraded': return 'bg-yellow-500/10';
      default: return 'bg-slate-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
            ← Back to Home
          </Link>
          <div className="text-sm text-slate-400">
            Bot Status Dashboard
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Bot Status
          </h1>
          
          <p className="text-slate-400 text-lg mb-6">
            Real-time monitoring of all clusters and shards
          </p>

          {/* Overall Stats */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-8">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">{data.totalShards}</div>
                <div className="text-sm text-slate-400">Total Shards</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">{data.totalServers.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Servers</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">{data.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Users</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">{data.activeConversations.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Active 24h</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCircle} className="h-3 w-3 text-green-400 animate-pulse" />
                  <div className="text-2xl font-bold text-green-400">Online</div>
                </div>
                <div className="text-sm text-slate-400">Status</div>
              </div>
            </div>
          )}

          {/* Server ID Lookup */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Find Your Shard</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                placeholder="Enter server ID..."
                className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:border-blue-500 focus:outline-none text-white placeholder-slate-500"
                onKeyPress={(e) => e.key === 'Enter' && findShard()}
              />
              <button
                onClick={findShard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            
            {foundShard && (
              <div className="mt-4 text-sm text-slate-300 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                Found: Shard <span className="font-bold text-blue-400">#{foundShard.shardId}</span> in Cluster <span className="font-bold text-blue-400">#{foundShard.clusterId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Clusters Grid */}
        {loading ? (
          <div className="text-center text-slate-400 text-xl">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <div>Loading cluster data...</div>
          </div>
        ) : data && data.clusters.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.clusters.map((cluster) => (
              <div
                key={cluster.id}
                className={`bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all ${getStatusBg(cluster.status)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon 
                      icon={faCircle} 
                      className={`h-3 w-3 ${getStatusColor(cluster.status)} ${cluster.status === 'online' ? 'animate-pulse' : ''}`} 
                    />
                    <h3 className="text-xl font-bold text-white">
                      Cluster {cluster.id}
                    </h3>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(cluster.status)} ${getStatusBg(cluster.status)}`}>
                    {cluster.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Shards:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cluster.shards.map((s) => (
                        <span key={s} className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                          #{s}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <FontAwesomeIcon icon={faServer} className="h-4 w-4 text-blue-400 mb-1" />
                      <div className="text-lg font-bold text-white">{cluster.servers.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Servers</div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-blue-400 mb-1" />
                      <div className="text-lg font-bold text-white">{cluster.cachedUsers.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Users</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="h-3 w-3 text-slate-500" />
                      <span className="text-slate-400">Latency:</span>
                      <span className="text-white font-semibold">{cluster.latency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faMemory} className="h-3 w-3 text-slate-500" />
                      <span className="text-white font-semibold">{cluster.memUsage}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 pt-1">
                    Uptime: {cluster.uptime} • Updated {cluster.lastUpdated}s ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-slate-800 border border-slate-700 rounded-xl p-12">
            <div className="text-slate-400 text-lg mb-2">No cluster data available</div>
            <div className="text-slate-500 text-sm">Bot may be offline or starting up</div>
          </div>
        )}
      </div>
    </div>
  );
}
