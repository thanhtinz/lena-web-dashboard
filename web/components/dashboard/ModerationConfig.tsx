'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner,
  faBan,
  faGavel,
  faLock,
  faClock,
  faShieldHalved,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

interface ModerationConfigData {
  enabled: boolean;
  commandsEnabled: {
    ban: boolean;
    unban: boolean;
    kick: boolean;
    mute: boolean;
    unmute: boolean;
    warn: boolean;
    unwarn: boolean;
    lock: boolean;
    unlock: boolean;
    slowmode: boolean;
    purge: boolean;
    nuke: boolean;
  };
  logOptions: {
    logBans: boolean;
    logUnbans: boolean;
    logKicks: boolean;
    logMutes: boolean;
    logUnmutes: boolean;
    logWarns: boolean;
    logLocks: boolean;
    logUnlocks: boolean;
    logSlowmode: boolean;
    logPurges: boolean;
  };
  dmOnKick: boolean;
  dmOnBan: boolean;
  dmOnMute: boolean;
  useDiscordTimeout: boolean;
  deleteModCommands: boolean;
  respondWithReason: boolean;
  preserveMessagesOnBan: boolean;
  logChannelId: string | null;
}

export default function ModerationConfig({ serverId }: { serverId: string }) {
  const [config, setConfig] = useState<ModerationConfigData>({
    enabled: true,
    commandsEnabled: {
      ban: true,
      unban: true,
      kick: true,
      mute: true,
      unmute: true,
      warn: true,
      unwarn: true,
      lock: true,
      unlock: true,
      slowmode: true,
      purge: true,
      nuke: true
    },
    logOptions: {
      logBans: true,
      logUnbans: true,
      logKicks: true,
      logMutes: true,
      logUnmutes: true,
      logWarns: true,
      logLocks: true,
      logUnlocks: true,
      logSlowmode: true,
      logPurges: true
    },
    dmOnKick: true,
    dmOnBan: true,
    dmOnMute: true,
    useDiscordTimeout: true,
    deleteModCommands: false,
    respondWithReason: true,
    preserveMessagesOnBan: true,
    logChannelId: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, [serverId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/moderation`);
      if (res.ok) {
        const data = await res.json();
        setConfig({
          enabled: data.enabled ?? true,
          commandsEnabled: data.commandsEnabled || {
            ban: true,
            unban: true,
            kick: true,
            mute: true,
            unmute: true,
            warn: true,
            unwarn: true,
            lock: true,
            unlock: true,
            slowmode: true,
            purge: true,
            nuke: true
          },
          logOptions: data.logOptions || {
            logBans: true,
            logUnbans: true,
            logKicks: true,
            logMutes: true,
            logUnmutes: true,
            logWarns: true,
            logLocks: true,
            logUnlocks: true,
            logSlowmode: true,
            logPurges: true
          },
          dmOnKick: data.dmOnKick ?? true,
          dmOnBan: data.dmOnBan ?? true,
          dmOnMute: data.dmOnMute ?? true,
          useDiscordTimeout: data.useDiscordTimeout ?? true,
          deleteModCommands: data.deleteModCommands ?? false,
          respondWithReason: data.respondWithReason ?? true,
          preserveMessagesOnBan: data.preserveMessagesOnBan ?? true,
          logChannelId: data.logChannelId || null
        });
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

  const toggleCommand = (command: keyof ModerationConfigData['commandsEnabled']) => {
    setConfig({
      ...config,
      commandsEnabled: {
        ...config.commandsEnabled,
        [command]: !config.commandsEnabled[command]
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const commandGroups = [
    {
      title: 'Ban Commands',
      icon: faBan,
      color: 'text-red-500',
      commands: [
        { key: 'ban' as const, label: 'Ban', desc: 'Permanently ban users from the server' },
        { key: 'unban' as const, label: 'Unban', desc: 'Unban previously banned users' }
      ]
    },
    {
      title: 'Kick & Mute Commands',
      icon: faGavel,
      color: 'text-orange-500',
      commands: [
        { key: 'kick' as const, label: 'Kick', desc: 'Kick users from the server' },
        { key: 'mute' as const, label: 'Mute', desc: 'Mute users temporarily' },
        { key: 'unmute' as const, label: 'Unmute', desc: 'Remove mute from users' }
      ]
    },
    {
      title: 'Warning Commands',
      icon: faShieldHalved,
      color: 'text-yellow-500',
      commands: [
        { key: 'warn' as const, label: 'Warn', desc: 'Issue warnings to users' },
        { key: 'unwarn' as const, label: 'Unwarn', desc: 'Remove warnings from users' }
      ]
    },
    {
      title: 'Channel Control Commands',
      icon: faLock,
      color: 'text-blue-500',
      commands: [
        { key: 'lock' as const, label: 'Lock', desc: 'Lock channels to prevent messages' },
        { key: 'unlock' as const, label: 'Unlock', desc: 'Unlock previously locked channels' }
      ]
    },
    {
      title: 'Slowmode Command',
      icon: faClock,
      color: 'text-purple-500',
      commands: [
        { key: 'slowmode' as const, label: 'Slowmode', desc: 'Set message rate limit (cooldown)' }
      ]
    },
    {
      title: 'Message Management Commands',
      icon: faTrash,
      color: 'text-pink-500',
      commands: [
        { key: 'purge' as const, label: 'Purge', desc: 'Bulk delete messages (1-100)' },
        { key: 'nuke' as const, label: 'Nuke', desc: 'Clone channel and delete old (nuke)' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Moderation Module</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
          />
          <div>
            <span className="text-white font-medium">Enable Moderation Module</span>
            <p className="text-sm text-slate-400">Master toggle for all moderation features</p>
          </div>
        </label>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Moderation Commands</h3>
        <p className="text-sm text-slate-400 mb-6">Enable or disable individual moderation commands. Disabled commands will show an error message when used.</p>
        
        <div className="space-y-6">
          {commandGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <FontAwesomeIcon icon={group.icon} className={`h-4 w-4 ${group.color}`} />
                {group.title}
              </h4>
              <div className="space-y-2 pl-6">
                {group.commands.map((cmd) => (
                  <label key={cmd.key} className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-slate-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.commandsEnabled[cmd.key]}
                      onChange={() => toggleCommand(cmd.key)}
                      className="w-4 h-4 mt-0.5 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-white font-medium">/{cmd.label.toLowerCase()}</span>
                      <p className="text-xs text-slate-400">{cmd.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Moderation Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.dmOnBan}
              onChange={(e) => setConfig({ ...config, dmOnBan: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">DM users when banned</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.dmOnKick}
              onChange={(e) => setConfig({ ...config, dmOnKick: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">DM users when kicked</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.dmOnMute}
              onChange={(e) => setConfig({ ...config, dmOnMute: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">DM users when muted</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.useDiscordTimeout}
              onChange={(e) => setConfig({ ...config, useDiscordTimeout: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Use Discord's native timeout feature</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.deleteModCommands}
              onChange={(e) => setConfig({ ...config, deleteModCommands: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Auto-delete moderation commands</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.respondWithReason}
              onChange={(e) => setConfig({ ...config, respondWithReason: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Include reason in responses</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.preserveMessagesOnBan}
              onChange={(e) => setConfig({ ...config, preserveMessagesOnBan: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Preserve user messages when banning</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Moderation Log Options</h3>
        <p className="text-sm text-slate-400 mb-4">Choose which moderation actions to log to your log channel</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logBans}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logBans: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Log Bans</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logUnbans}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logUnbans: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Log Unbans</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logKicks}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logKicks: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Log Kicks</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logMutes}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logMutes: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Log Mutes</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logUnmutes}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logUnmutes: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Log Unmutes</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.logOptions.logWarns}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logWarns: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300">Log Warnings</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded bg-purple-500/10 border border-purple-500/30">
            <input
              type="checkbox"
              checked={config.logOptions.logLocks}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logLocks: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300 font-medium">🔒 Log Lock</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded bg-purple-500/10 border border-purple-500/30">
            <input
              type="checkbox"
              checked={config.logOptions.logUnlocks}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logUnlocks: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300 font-medium">🔓 Log Unlock</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded bg-purple-500/10 border border-purple-500/30">
            <input
              type="checkbox"
              checked={config.logOptions.logSlowmode}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logSlowmode: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300 font-medium">⏱️ Log Slowmode</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded bg-pink-500/10 border border-pink-500/30">
            <input
              type="checkbox"
              checked={config.logOptions.logPurges}
              onChange={(e) => setConfig({ ...config, logOptions: { ...config.logOptions, logPurges: e.target.checked } })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500"
            />
            <span className="text-slate-300 font-medium">🗑️ Log Purge/Nuke</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {message && (
          <span className="text-sm text-slate-300 self-center">{message}</span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={saving ? 'animate-spin' : ''} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
