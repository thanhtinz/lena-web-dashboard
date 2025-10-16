'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner, 
  faShield, 
  faLink, 
  faBan, 
  faVolumeXmark,
  faAt,
  faTriangleExclamation,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

interface AutoModConfigData {
  enabled: boolean;
  antiSpam: boolean;
  spamThreshold: number;
  spamTimeWindow: number;
  antiLinks: boolean;
  whitelistedDomains: string[];
  antiInvites: boolean;
  antiCaps: boolean;
  capsPercentage: number;
  antiMentionSpam: boolean;
  mentionThreshold: number;
  bannedWords: string[];
  actionType: string;
  ignoredChannels: string[];
  ignoredRoles: string[];
}

export default function AutoModConfig({ serverId }: { serverId: string }) {
  const [config, setConfig] = useState<AutoModConfigData>({
    enabled: false,
    antiSpam: true,
    spamThreshold: 5,
    spamTimeWindow: 5,
    antiLinks: false,
    whitelistedDomains: [],
    antiInvites: false,
    antiCaps: false,
    capsPercentage: 70,
    antiMentionSpam: true,
    mentionThreshold: 5,
    bannedWords: [],
    actionType: 'warn',
    ignoredChannels: [],
    ignoredRoles: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newBannedWord, setNewBannedWord] = useState('');

  useEffect(() => {
    fetchConfig();
  }, [serverId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/automod`);
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

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/servers/${serverId}/automod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setMessage('✅ Configuration saved successfully!');
      } else {
        setMessage('❌ Failed to save configuration');
      }
    } catch (error) {
      setMessage('❌ Failed to save configuration');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addDomain = () => {
    if (newDomain && !config.whitelistedDomains.includes(newDomain)) {
      setConfig({ ...config, whitelistedDomains: [...config.whitelistedDomains, newDomain] });
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setConfig({ ...config, whitelistedDomains: config.whitelistedDomains.filter(d => d !== domain) });
  };

  const addBannedWord = () => {
    if (newBannedWord && !config.bannedWords.includes(newBannedWord)) {
      setConfig({ ...config, bannedWords: [...config.bannedWords, newBannedWord] });
      setNewBannedWord('');
    }
  };

  const removeBannedWord = (word: string) => {
    setConfig({ ...config, bannedWords: config.bannedWords.filter(w => w !== word) });
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
      {/* Master Toggle */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faShield} className="h-5 w-5 text-blue-500" />
              Auto Moderation Status
            </h3>
            <p className="text-sm text-slate-400 mt-1">Enable/disable entire auto moderation system</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Anti-Spam */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <label className="flex items-center justify-between cursor-pointer mb-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faShield} className="h-5 w-5 text-green-500" />
            <div>
              <span className="text-white font-medium">Anti-Spam</span>
              <p className="text-sm text-slate-400">Block spam messages</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.antiSpam}
            onChange={(e) => setConfig({ ...config, antiSpam: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
          />
        </label>

        {config.antiSpam && (
          <div className="grid grid-cols-2 gap-4 mt-4 pl-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of messages
              </label>
              <input
                type="number"
                value={config.spamThreshold}
                onChange={(e) => setConfig({ ...config, spamThreshold: parseInt(e.target.value) })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Within (seconds)
              </label>
              <input
                type="number"
                value={config.spamTimeWindow}
                onChange={(e) => setConfig({ ...config, spamTimeWindow: parseInt(e.target.value) })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                min="1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Anti-Links */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <label className="flex items-center justify-between cursor-pointer mb-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faLink} className="h-5 w-5 text-yellow-500" />
            <div>
              <span className="text-white font-medium">Anti-Links</span>
              <p className="text-sm text-slate-400">Block unauthorized links</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.antiLinks}
            onChange={(e) => setConfig({ ...config, antiLinks: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
          />
        </label>

        {config.antiLinks && (
          <div className="mt-4 pl-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Allowed domains
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="youtube.com"
                className="flex-1 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={addDomain}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="md:mr-1" />
                <span className="hidden md:inline">Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.whitelistedDomains.map(domain => (
                <span key={domain} className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {domain}
                  <button onClick={() => removeDomain(domain)} className="text-red-400 hover:text-red-300">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Anti-Invites */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBan} className="h-5 w-5 text-red-500" />
            <div>
              <span className="text-white font-medium">Anti-Invites</span>
              <p className="text-sm text-slate-400">Block Discord invite links</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.antiInvites}
            onChange={(e) => setConfig({ ...config, antiInvites: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Anti-Caps */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <label className="flex items-center justify-between cursor-pointer mb-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faVolumeXmark} className="h-5 w-5 text-orange-500" />
            <div>
              <span className="text-white font-medium">Anti-Caps</span>
              <p className="text-sm text-slate-400">Block excessive capitalization</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.antiCaps}
            onChange={(e) => setConfig({ ...config, antiCaps: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
          />
        </label>

        {config.antiCaps && (
          <div className="mt-4 pl-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Maximum caps ratio (%)
            </label>
            <input
              type="number"
              value={config.capsPercentage}
              onChange={(e) => setConfig({ ...config, capsPercentage: parseInt(e.target.value) })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              min="0"
              max="100"
            />
          </div>
        )}
      </div>

      {/* Anti-Mention Spam */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <label className="flex items-center justify-between cursor-pointer mb-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faAt} className="h-5 w-5 text-purple-500" />
            <div>
              <span className="text-white font-medium">Anti-Mention Spam</span>
              <p className="text-sm text-slate-400">Block mention spam</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.antiMentionSpam}
            onChange={(e) => setConfig({ ...config, antiMentionSpam: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
          />
        </label>

        {config.antiMentionSpam && (
          <div className="mt-4 pl-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Maximum mentions
            </label>
            <input
              type="number"
              value={config.mentionThreshold}
              onChange={(e) => setConfig({ ...config, mentionThreshold: parseInt(e.target.value) })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              min="1"
            />
          </div>
        )}
      </div>

      {/* Banned Words */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5 text-red-500" />
          <div>
            <span className="text-white font-medium">Banned Words</span>
            <p className="text-sm text-slate-400">List of banned words</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newBannedWord}
            onChange={(e) => setNewBannedWord(e.target.value)}
            placeholder="Enter banned word..."
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={addBannedWord}
            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <FontAwesomeIcon icon={faPlus} className="md:mr-1" />
            <span className="hidden md:inline">Add</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.bannedWords.map(word => (
            <span key={word} className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {word}
              <button onClick={() => removeBannedWord(word)} className="text-red-400 hover:text-red-300">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Action Type */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Action on violation
        </label>
        <select
          value={config.actionType}
          onChange={(e) => setConfig({ ...config, actionType: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="warn">Warning</option>
          <option value="delete">Delete message</option>
          <option value="mute">Mute (10 minutes)</option>
          <option value="kick">Kick from server</option>
          <option value="ban">Ban from server</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        {message && (
          <div className={`px-4 py-2 rounded ${message.includes('✅') ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {message}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={`h-5 w-5 ${saving ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );
}
