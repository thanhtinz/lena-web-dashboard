'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner, 
  faGavel,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

interface ModerationConfigData {
  enabled: boolean;
  dmOnKick: boolean;
  dmOnBan: boolean;
  dmOnMute: boolean;
  useDiscordTimeout: boolean;
  deleteModCommands: boolean;
  respondWithReason: boolean;
  preserveMessagesOnBan: boolean;
  logChannelId: string | null;
  logOptions: {
    logBans: boolean;
    logUnbans: boolean;
    logKicks: boolean;
    logMutes: boolean;
    logUnmutes: boolean;
    logWarns: boolean;
  };
  moderatorRoles: string[];
  protectedRoles: string[];
  lockdownChannels: string[];
  customMessages: {
    banMessage: string;
    unbanMessage: string;
    softbanMessage: string;
    kickMessage: string;
    muteMessage: string;
    unmuteMessage: string;
  };
}

export default function ModerationPage() {
  const params = useParams();
  const serverId = params.id as string;

  const [config, setConfig] = useState<ModerationConfigData>({
    enabled: true,
    dmOnKick: true,
    dmOnBan: true,
    dmOnMute: true,
    useDiscordTimeout: true,
    deleteModCommands: false,
    respondWithReason: true,
    preserveMessagesOnBan: true,
    logChannelId: null,
    logOptions: {
      logBans: true,
      logUnbans: true,
      logKicks: true,
      logMutes: true,
      logUnmutes: true,
      logWarns: true,
    },
    moderatorRoles: [],
    protectedRoles: [],
    lockdownChannels: [],
    customMessages: {
      banMessage: 'You have been banned from {server} for: {reason}',
      unbanMessage: 'You have been unbanned from {server}',
      softbanMessage: 'You have been softbanned from {server} for: {reason}',
      kickMessage: 'You have been kicked from {server} for: {reason}',
      muteMessage: 'You have been muted in {server} for: {reason}. Duration: {duration}',
      unmuteMessage: 'You have been unmuted in {server}',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    fetchConfig();
    fetchChannels();
    fetchRoles();
  }, [serverId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/moderation`);
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

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data.filter((r: any) => r.name !== '@everyone'));
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/servers/${serverId}/moderation`, {
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

  const toggleRole = (roleId: string, field: 'moderatorRoles' | 'protectedRoles') => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field].includes(roleId)
        ? prev[field].filter((id: string) => id !== roleId)
        : [...prev[field], roleId]
    }));
  };

  const toggleChannel = (channelId: string) => {
    setConfig(prev => ({
      ...prev,
      lockdownChannels: prev.lockdownChannels.includes(channelId)
        ? prev.lockdownChannels.filter(id => id !== channelId)
        : [...prev.lockdownChannels, channelId]
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <FontAwesomeIcon icon={faGavel} className="h-5 w-5 md:h-6 md:w-6 text-red-400" />
          <h1 className="text-lg md:text-2xl font-bold text-white">Moderation Module</h1>
        </div>
        <p className="text-sm md:text-base text-slate-400">Configure moderation settings and automated actions</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
          <p className="text-white">{message}</p>
        </div>
      )}

      <div className="space-y-6">
      {/* Master Toggle */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faGavel} className="h-5 w-5 text-blue-500" />
              Moderation Module Status
            </h3>
            <p className="text-sm text-slate-400 mt-1">Enable/disable entire moderation module</p>
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

      {/* DM Settings */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">DM Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white">DM users on kick</span>
            <input
              type="checkbox"
              checked={config.dmOnKick}
              onChange={(e) => setConfig({ ...config, dmOnKick: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white">DM users on ban</span>
            <input
              type="checkbox"
              checked={config.dmOnBan}
              onChange={(e) => setConfig({ ...config, dmOnBan: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white">DM users on mute</span>
            <input
              type="checkbox"
              checked={config.dmOnMute}
              onChange={(e) => setConfig({ ...config, dmOnMute: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Mute Settings */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Mute Settings</h3>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-white">Use Discord Timeouts for Mute</span>
            <p className="text-sm text-slate-400">Recommended - uses new Discord API</p>
          </div>
          <input
            type="checkbox"
            checked={config.useDiscordTimeout}
            onChange={(e) => setConfig({ ...config, useDiscordTimeout: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Command Settings */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Command Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white">Delete mod commands after executed</span>
            <input
              type="checkbox"
              checked={config.deleteModCommands}
              onChange={(e) => setConfig({ ...config, deleteModCommands: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white">Respond with reason</span>
            <input
              type="checkbox"
              checked={config.respondWithReason}
              onChange={(e) => setConfig({ ...config, respondWithReason: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white">Preserve messages on ban (don't delete message history)</span>
            <input
              type="checkbox"
              checked={config.preserveMessagesOnBan}
              onChange={(e) => setConfig({ ...config, preserveMessagesOnBan: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Moderation Log Channel */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-2">Moderation Log Channel</h3>
        <p className="text-sm text-slate-400 mb-4">Moderator actions will be logged in this channel</p>
        <select
          value={config.logChannelId || ''}
          onChange={(e) => setConfig({ ...config, logChannelId: e.target.value || null })}
          className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select a channel</option>
          {channels.map(channel => (
            <option key={channel.id} value={channel.id}>#{channel.name}</option>
          ))}
        </select>
      </div>

      {/* Event Logging Options */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Moderation Action Logging</h3>
        <p className="text-sm text-slate-400 mb-4">Choose which moderation actions to log to the log channel</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logBans}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logBans: e.target.checked } })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <span className="text-white">Log Bans</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logUnbans}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logUnbans: e.target.checked } })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <span className="text-white">Log Unbans</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logKicks}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logKicks: e.target.checked } })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <span className="text-white">Log Kicks</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logMutes}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logMutes: e.target.checked } })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <span className="text-white">Log Mutes</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logUnmutes}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logUnmutes: e.target.checked } })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <span className="text-white">Log Unmutes</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logWarns}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logWarns: e.target.checked } })}
              className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
            <span className="text-white">Log Warnings</span>
          </label>
        </div>
      </div>

      {/* Moderator Roles */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-2">Moderator Roles</h3>
        <p className="text-sm text-slate-400 mb-4">Members in moderator roles will have access to Moderator commands</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {roles.map(role => (
            <label key={role.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
              <input
                type="checkbox"
                checked={config.moderatorRoles.includes(role.id)}
                onChange={() => toggleRole(role.id, 'moderatorRoles')}
                className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5' }}></div>
                <span className="text-white">{role.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Protected Roles */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faCrown} className="h-5 w-5 text-yellow-500" />
          Protected Roles
        </h3>
        <p className="text-sm text-slate-400 mb-4">Members in protected roles can't be muted, kicked, or banned by moderators</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {roles.map(role => (
            <label key={role.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
              <input
                type="checkbox"
                checked={config.protectedRoles.includes(role.id)}
                onChange={() => toggleRole(role.id, 'protectedRoles')}
                className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5' }}></div>
                <span className="text-white">{role.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Lockdown Channels */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-2">Lockdown Channels</h3>
        <p className="text-sm text-slate-400 mb-4">Select the channels to lock when using the lockdown command</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {channels.map(channel => (
            <label key={channel.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
              <input
                type="checkbox"
                checked={config.lockdownChannels.includes(channel.id)}
                onChange={() => toggleChannel(channel.id)}
                className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
              />
              <span className="text-white"># {channel.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Responses */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Custom Responses</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ban Message
              <span className="text-slate-500 ml-2">Variables: {'{server}'}, {'{reason}'}</span>
            </label>
            <input
              type="text"
              value={config.customMessages.banMessage}
              onChange={(e) => setConfig({ 
                ...config, 
                customMessages: { ...config.customMessages, banMessage: e.target.value } 
              })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="You have been banned from {server} for: {reason}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Unban Message
            </label>
            <input
              type="text"
              value={config.customMessages.unbanMessage}
              onChange={(e) => setConfig({ 
                ...config, 
                customMessages: { ...config.customMessages, unbanMessage: e.target.value } 
              })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="You have been unbanned from {server}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Softban Message
              <span className="text-slate-500 ml-2">Variables: {'{server}'}, {'{reason}'}</span>
            </label>
            <input
              type="text"
              value={config.customMessages.softbanMessage}
              onChange={(e) => setConfig({ 
                ...config, 
                customMessages: { ...config.customMessages, softbanMessage: e.target.value } 
              })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="You have been softbanned from {server} for: {reason}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Kick Message
              <span className="text-slate-500 ml-2">Variables: {'{server}'}, {'{reason}'}</span>
            </label>
            <input
              type="text"
              value={config.customMessages.kickMessage}
              onChange={(e) => setConfig({ 
                ...config, 
                customMessages: { ...config.customMessages, kickMessage: e.target.value } 
              })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="You have been kicked from {server} for: {reason}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mute Message
              <span className="text-slate-500 ml-2">Variables: {'{server}'}, {'{reason}'}, {'{duration}'}</span>
            </label>
            <input
              type="text"
              value={config.customMessages.muteMessage}
              onChange={(e) => setConfig({ 
                ...config, 
                customMessages: { ...config.customMessages, muteMessage: e.target.value } 
              })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="You have been muted in {server} for: {reason}. Duration: {duration}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Unmute Message
            </label>
            <input
              type="text"
              value={config.customMessages.unmuteMessage}
              onChange={(e) => setConfig({ 
                ...config, 
                customMessages: { ...config.customMessages, unmuteMessage: e.target.value } 
              })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="You have been unmuted in {server}"
            />
          </div>
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={`${saving ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save All Changes'}</span>
          <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
      </div>
    </div>
  );
}
