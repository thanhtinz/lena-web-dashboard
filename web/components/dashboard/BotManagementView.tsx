'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faPlay, 
  faStop, 
  faRotate,
  faKey,
  faLink,
  faChartLine,
  faFileLines,
  faCog,
  faHeart,
  faServer,
  faUsers,
  faMemory,
  faWifi,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faCopy
} from '@fortawesome/free-solid-svg-icons';

interface CustomBot {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  serverId: string;
  clientId: string;
  status: 'online' | 'offline' | 'maintenance';
  config: {
    prefix?: string;
    personalityMode?: string;
    statusMessage?: string;
    enabledFeatures?: string[];
    intents?: number[];
    permissions?: string[];
    webhookUrl?: string;
  };
  metrics?: {
    ping?: number;
    uptime?: number;
    memoryUsage?: number;
    guildCount?: number;
    userCount?: number;
    lastHeartbeat?: string;
  };
}

export default function BotManagementView({ botId }: { botId: string }) {
  const [bot, setBot] = useState<CustomBot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'analytics' | 'logs' | 'config'>('overview');

  useEffect(() => {
    fetchBot();
  }, [botId]);

  const fetchBot = async () => {
    try {
      const res = await fetch(`/api/custom-bots/${botId}`);
      if (!res.ok) throw new Error('Failed to fetch bot');
      const data = await res.json();
      setBot(data.bot);
    } catch (err) {
      setError('Failed to load bot details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
        {error || 'Bot not found'}
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: faRobot },
    { id: 'control', label: 'Control Panel', icon: faCog },
    { id: 'analytics', label: 'Analytics', icon: faChartLine },
    { id: 'logs', label: 'Logs', icon: faFileLines },
    { id: 'config', label: 'Advanced Config', icon: faCog },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Bot Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {bot.avatarUrl ? (
              <img src={bot.avatarUrl} alt={bot.name} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faRobot} className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-white">{bot.name}</h3>
              <p className="text-slate-400">{bot.username || 'No username set'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  bot.status === 'online' ? 'bg-green-900/50 text-green-400' :
                  bot.status === 'offline' ? 'bg-gray-900/50 text-gray-400' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {bot.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">Client ID: {bot.clientId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border-t border-x border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        {activeTab === 'overview' && <BotOverview bot={bot} onRefresh={fetchBot} />}
        {activeTab === 'control' && <BotControlPanel bot={bot} onRefresh={fetchBot} />}
        {activeTab === 'analytics' && <BotAnalytics botId={bot.id} />}
        {activeTab === 'logs' && <BotLogs botId={bot.id} />}
        {activeTab === 'config' && <BotAdvancedConfig bot={bot} onRefresh={fetchBot} />}
      </div>
    </div>
  );
}

// Bot Overview Component
function BotOverview({ bot, onRefresh }: { bot: CustomBot; onRefresh: () => void }) {
  const metrics = bot.metrics || {};
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate OAuth invite link
    const permissions = bot.config.permissions?.join('') || '8'; // Default: Administrator
    const link = `https://discord.com/api/oauth2/authorize?client_id=${bot.clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
    setInviteLink(link);
  }, [bot.clientId, bot.config.permissions]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Health Status */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faHeart} className="text-red-500" />
          Bot Health
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <FontAwesomeIcon icon={faWifi} className="text-blue-500 h-5 w-5" />
              <span className="text-2xl font-bold text-white">{metrics.ping || 0}ms</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Latency</p>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <FontAwesomeIcon icon={faClock} className="text-green-500 h-5 w-5" />
              <span className="text-2xl font-bold text-white">
                {Math.floor((metrics.uptime || 0) / 60)}h
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Uptime</p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <FontAwesomeIcon icon={faServer} className="text-purple-500 h-5 w-5" />
              <span className="text-2xl font-bold text-white">{metrics.guildCount || 0}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Servers</p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <FontAwesomeIcon icon={faMemory} className="text-orange-500 h-5 w-5" />
              <span className="text-2xl font-bold text-white">{metrics.memoryUsage || 0}MB</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Memory</p>
          </div>
        </div>
      </div>

      {/* Invite Link */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faLink} className="text-blue-500" />
          Invite Link
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-4 py-2.5 text-sm"
          />
          <button
            onClick={copyInviteLink}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
          >
            <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} className="mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Use this link to invite your bot to Discord servers
        </p>
      </div>

      {/* Bot Configuration */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Current Configuration</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400">Prefix</p>
            <p className="text-white font-mono mt-1">{bot.config.prefix || '!'}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400">Personality Mode</p>
            <p className="text-white mt-1">{bot.config.personalityMode || 'Default'}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 md:col-span-2">
            <p className="text-sm text-slate-400">Status Message</p>
            <p className="text-white mt-1">{bot.config.statusMessage || 'No status set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bot Control Panel Component
function BotControlPanel({ bot, onRefresh }: { bot: CustomBot; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [conflictCheck, setConflictCheck] = useState<{
    checking: boolean;
    hasConflict: boolean;
    message?: string;
  }>({ checking: true, hasConflict: false });

  useEffect(() => {
    checkMainBotConflict();
  }, [bot.id]);

  const checkMainBotConflict = async () => {
    try {
      const res = await fetch(`/api/custom-bots/check-conflict/${bot.serverId}`);
      if (res.ok) {
        const data = await res.json();
        setConflictCheck({
          checking: false,
          hasConflict: data.hasMainBot || false,
          message: data.message,
        });
      } else {
        setConflictCheck({ checking: false, hasConflict: false });
      }
    } catch (err) {
      console.error('Error checking conflict:', err);
      setConflictCheck({ checking: false, hasConflict: false });
    }
  };

  const handleControl = async (action: 'start' | 'stop' | 'restart') => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/custom-bots/${bot.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Control action failed');
      }

      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Bot Controls</h4>
        
        {/* Main Bot Conflict Warning */}
        {conflictCheck.checking && (
          <div className="bg-blue-900/30 border border-blue-700 text-blue-400 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <p>Checking for bot conflicts...</p>
          </div>
        )}
        
        {!conflictCheck.checking && conflictCheck.hasConflict && (
          <div className="bg-orange-900/30 border border-orange-700 text-orange-300 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-2">⚠️ Main Bot Conflict Detected</p>
                <p className="text-sm text-orange-200 mb-3">
                  {conflictCheck.message || 'The main bot (Lena) is still present in your server. You must remove the main bot before starting your custom bot to avoid conflicts.'}
                </p>
                <div className="bg-orange-950/50 p-3 rounded border border-orange-800">
                  <p className="text-sm font-semibold text-orange-300 mb-2">🔧 How to fix:</p>
                  <ol className="text-sm text-orange-200 space-y-1 list-decimal list-inside">
                    <li>Go to your Discord server</li>
                    <li>Find the main bot "Lena" in the member list</li>
                    <li>Right-click → Kick from server</li>
                    <li>Come back and click "Check Again" below</li>
                  </ol>
                </div>
                <button
                  onClick={checkMainBotConflict}
                  className="mt-3 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded transition text-sm font-medium"
                >
                  🔄 Check Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!conflictCheck.checking && !conflictCheck.hasConflict && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">✅ No bot conflicts detected. You can start your custom bot safely.</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleControl('start')}
            disabled={loading || bot.status === 'online' || conflictCheck.hasConflict}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
            title={conflictCheck.hasConflict ? 'Remove main bot first' : ''}
          >
            <FontAwesomeIcon icon={faPlay} className="mr-2" />
            Start Bot
          </button>
          <button
            onClick={() => handleControl('stop')}
            disabled={loading || bot.status === 'offline'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
          >
            <FontAwesomeIcon icon={faStop} className="mr-2" />
            Stop Bot
          </button>
          <button
            onClick={() => handleControl('restart')}
            disabled={loading || conflictCheck.hasConflict}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
            title={conflictCheck.hasConflict ? 'Remove main bot first' : ''}
          >
            <FontAwesomeIcon icon={faRotate} className="mr-2" />
            Restart Bot
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faKey} className="text-yellow-500" />
          Token Management
        </h4>
        <p className="text-slate-400 text-sm mb-4">
          Update your bot token securely. Token sẽ được mã hóa trước khi lưu.
        </p>
        <button
          onClick={() => setShowTokenModal(true)}
          className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
        >
          <FontAwesomeIcon icon={faKey} className="mr-2" />
          Update Token
        </button>
      </div>

      {showTokenModal && (
        <TokenUpdateModal
          botId={bot.id}
          onClose={() => setShowTokenModal(false)}
          onSuccess={() => {
            setShowTokenModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Token Update Modal
function TokenUpdateModal({ botId, onClose, onSuccess }: { botId: string; onClose: () => void; onSuccess: () => void }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/custom-bots/${botId}/token`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to update token');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-lg w-full">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Update Bot Token</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-yellow-900/20 border border-yellow-700/50 text-yellow-400 px-4 py-3 rounded-lg text-sm">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            <strong>Warning:</strong> Token cũ sẽ bị thay thế. Bot cần restart để sử dụng token mới.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Bot Token *
            </label>
            <input
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              placeholder="Your new Discord bot token"
            />
            <p className="text-xs text-slate-500 mt-2">
              Get your token from Discord Developer Portal → Your App → Bot → Token
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bot Analytics Component
function BotAnalytics({ botId }: { botId: string }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [botId]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/custom-bots/${botId}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading analytics...</div>;
  }

  if (!analytics || analytics.analytics.length === 0) {
    return (
      <div className="text-center text-slate-400 py-12">
        <FontAwesomeIcon icon={faChartLine} className="h-12 w-12 mb-4 opacity-50" />
        <p>No analytics data available yet</p>
        <p className="text-sm text-slate-500 mt-2">Data will appear once your bot is active</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Total Messages</p>
          <p className="text-2xl font-bold text-white mt-1">{analytics.totals.totalMessages.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Total Commands</p>
          <p className="text-2xl font-bold text-white mt-1">{analytics.totals.totalCommands.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Total Errors</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{analytics.totals.totalErrors.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Total Uptime</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{Math.floor(analytics.totals.totalUptime / 60)}h</p>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Daily Statistics (Last 30 days)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Messages</th>
                <th className="text-right py-2">Commands</th>
                <th className="text-right py-2">Errors</th>
                <th className="text-right py-2">Uptime (min)</th>
              </tr>
            </thead>
            <tbody>
              {analytics.analytics.map((day: any) => (
                <tr key={day.id} className="border-b border-slate-800 text-slate-300">
                  <td className="py-2">{day.date}</td>
                  <td className="text-right">{day.messageCount}</td>
                  <td className="text-right">{day.commandCount}</td>
                  <td className="text-right text-red-400">{day.errorCount}</td>
                  <td className="text-right">{day.uptimeMinutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Bot Logs Component  
function BotLogs({ botId }: { botId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');

  useEffect(() => {
    fetchLogs();
  }, [botId, filter]);

  const fetchLogs = async () => {
    try {
      const url = filter === 'all' 
        ? `/api/custom-bots/${botId}/logs`
        : `/api/custom-bots/${botId}/logs?level=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/30';
      case 'warn': return 'text-yellow-400 bg-yellow-900/30';
      case 'info': return 'text-blue-400 bg-blue-900/30';
      case 'debug': return 'text-slate-400 bg-slate-900/30';
      default: return 'text-slate-400 bg-slate-900/30';
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading logs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Filter:</span>
        {['all', 'info', 'warn', 'error', 'debug'].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level as any)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              filter === level
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900/50 text-slate-400 hover:bg-slate-900'
            }`}
          >
            {level.toUpperCase()}
          </button>
        ))}
        <button
          onClick={fetchLogs}
          className="ml-auto px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
        >
          <FontAwesomeIcon icon={faRotate} className="mr-1" />
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center text-slate-400 py-12">
          <FontAwesomeIcon icon={faFileLines} className="h-12 w-12 mb-4 opacity-50" />
          <p>No logs available</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="bg-slate-900/50 p-3 rounded border border-slate-800">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-mono ${getLevelColor(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm">{log.message}</p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <pre className="text-xs text-slate-500 mt-2 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Bot Advanced Config Component
function BotAdvancedConfig({ bot, onRefresh }: { bot: CustomBot; onRefresh: () => void }) {
  const [config, setConfig] = useState(bot.config);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/custom-bots/${bot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update config');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-lg">
          Configuration updated successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Webhook URL (optional)
        </label>
        <input
          type="url"
          value={config.webhookUrl || ''}
          onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
          placeholder="https://discord.com/api/webhooks/..."
        />
        <p className="text-xs text-slate-500 mt-2">
          Webhook để gửi notifications và logs
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enabled Features
        </label>
        <div className="grid md:grid-cols-2 gap-2">
          {['ai_chat', 'moderation', 'games', 'music', 'custom_commands', 'auto_mod'].map(feature => (
            <label key={feature} className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabledFeatures?.includes(feature)}
                onChange={(e) => {
                  const features = config.enabledFeatures || [];
                  setConfig({
                    ...config,
                    enabledFeatures: e.target.checked
                      ? [...features, feature]
                      : features.filter(f => f !== feature)
                  });
                }}
                className="rounded"
              />
              <span className="text-sm">{feature.replace('_', ' ').toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
