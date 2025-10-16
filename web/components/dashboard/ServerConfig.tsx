'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner, 
  faShield, 
  faListCheck, 
  faClock, 
  faUserTag, 
  faTerminal, 
  faCalendarDays, 
  faGavel,
  faChevronRight,
  faCrown,
  faBullhorn
} from '@fortawesome/free-solid-svg-icons';

const PERSONALITIES = [
  { value: 'lena', label: 'Lena (Default)' },
  { value: 'support', label: 'Support' },
  { value: 'technical', label: 'Technical' },
  { value: 'study', label: 'Learning' },
  { value: 'developer', label: 'Developer' },
  { value: 'anime', label: 'Anime' },
];

interface ServerConfigData {
  prefix: string;
  personality: string;
  language: string;
  allowedChannels: string[];
  autoReact: boolean;
  contentFilter: boolean;
}

export default function ServerConfig({ serverId }: { serverId: string }) {
  const [config, setConfig] = useState<ServerConfigData>({
    prefix: '!',
    personality: 'lena',
    language: 'vi',
    allowedChannels: [],
    autoReact: true,
    contentFilter: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
    fetchChannels();
  }, [serverId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/channels`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data.filter((c: any) => c.type === 0));
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/servers/${serverId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.historyCleared) {
          setMessage('✅ Configuration saved successfully! Conversation history has been automatically cleared due to language change.');
        } else {
          setMessage('✅ Configuration saved successfully!');
        }
      } else {
        setMessage('❌ Failed to save configuration');
      }
    } catch (error) {
      setMessage('❌ Failed to save configuration');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const toggleChannel = (channelId: string) => {
    setConfig(prev => ({
      ...prev,
      allowedChannels: prev.allowedChannels.includes(channelId)
        ? prev.allowedChannels.filter(id => id !== channelId)
        : [...prev.allowedChannels, channelId]
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Prefix Display */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white px-3 py-1 rounded font-mono text-lg font-bold">
            {config.prefix}
          </div>
          <div>
            <p className="text-white font-semibold">Bot Command Prefix</p>
            <p className="text-sm text-slate-300">Configure the prefix for bot commands in your server</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Basic Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prefix
            </label>
            <input
              type="text"
              value={config.prefix}
              onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="!"
            />
            <p className="text-xs text-slate-400 mt-1">Prefix character for bot commands</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Personality Mode
            </label>
            <select
              value={config.personality}
              onChange={(e) => setConfig({ ...config, personality: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              {PERSONALITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Lena's personality mode</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Language
            </label>
            <select
              value={config.language}
              onChange={(e) => setConfig({ ...config, language: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="vi">🇻🇳 Vietnamese</option>
              <option value="en">🇬🇧 English</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Bot's response language</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Allowed Channels</h3>
        <p className="text-sm text-slate-400 mb-4">Lena will automatically respond in selected channels</p>
        
        {channels.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {channels.map(channel => (
              <label key={channel.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                <input
                  type="checkbox"
                  checked={config.allowedChannels.includes(channel.id)}
                  onChange={() => toggleChannel(channel.id)}
                  className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
                <span className="text-white"># {channel.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Loading channel list...</p>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Features</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoReact}
              onChange={(e) => setConfig({ ...config, autoReact: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-white">Auto React</div>
              <div className="text-xs text-slate-400">Automatically react with emojis (game, news, chat, etc.)</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.contentFilter}
              onChange={(e) => setConfig({ ...config, contentFilter: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-white">Content Filter</div>
              <div className="text-xs text-slate-400">Filter 18+ content and banned words</div>
            </div>
          </label>
        </div>
      </div>

      {/* Automation & Moderation */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Automation & Moderation</h3>
        <p className="text-sm text-slate-400 mb-4">Manage automation and moderation features</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link 
            href={`/dashboard/server/${serverId}/automod`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faShield} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Auto Moderation</div>
                <div className="text-xs text-slate-400">Auto Moderation</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>

          <Link 
            href={`/dashboard/server/${serverId}/action-logs`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faListCheck} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Action Logs</div>
                <div className="text-xs text-slate-400">Log Actions</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>

          <Link 
            href={`/dashboard/server/${serverId}/auto-delete`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  Auto Delete
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full">
                    <FontAwesomeIcon icon={faCrown} className="mr-1" />
                    PREMIUM
                  </span>
                </div>
                <div className="text-xs text-slate-400">Auto Delete Messages</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>

          <Link 
            href={`/dashboard/server/${serverId}/auto-roles`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserTag} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Auto Roles</div>
                <div className="text-xs text-slate-400">Auto Assign Roles</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>

          <Link 
            href={`/dashboard/server/${serverId}/custom-commands`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faTerminal} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  Custom Commands
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full">
                    <FontAwesomeIcon icon={faCrown} className="mr-1" />
                    PREMIUM
                  </span>
                </div>
                <div className="text-xs text-slate-400">Custom Commands</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>

          <Link 
            href={`/dashboard/server/${serverId}/scheduled-messages`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  Scheduled Messages
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full">
                    <FontAwesomeIcon icon={faCrown} className="mr-1" />
                    PREMIUM
                  </span>
                </div>
                <div className="text-xs text-slate-400">Scheduled Messages</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>

          <Link 
            href={`/dashboard/server/${serverId}/auto-ban`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faGavel} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  Auto Ban
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full">
                    <FontAwesomeIcon icon={faCrown} className="mr-1" />
                    PREMIUM
                  </span>
                </div>
                <div className="text-xs text-slate-400">Auto Ban</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>

          <Link 
            href={`/dashboard/server/${serverId}/welcome-system`}
            className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faBullhorn} className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Announcements</div>
                <div className="text-xs text-slate-400">Welcome/Leave/Boost Messages</div>
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {message && (
            <span className={message.includes('✅') ? 'text-green-400' : 'text-red-400'}>
              {message}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 md:mr-2 animate-spin" />
              <span className="hidden md:inline">Saving...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Save Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
