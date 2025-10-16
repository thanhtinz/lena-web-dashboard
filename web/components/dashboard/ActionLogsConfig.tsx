'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner,
  faHashtag,
  faTrash,
  faEdit,
  faImage,
  faUserPlus,
  faUserMinus,
  faBan,
  faUserSlash,
  faUserClock,
  faUserTag,
  faUsers,
  faShield,
  faLock,
  faUnlock,
  faGavel,
  faEnvelope,
  faSmile,
  faMicrophone,
  faServer,
  faUserPen,
  faCog,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

interface ActionLogsConfigData {
  logChannelId: string;
  showAvatar: boolean;
  showAccountAge: boolean;
  ignoredChannels: string[];
  ignoredRoles: string[];
  enableMessageDelete: boolean;
  enableMessageEdit: boolean;
  enableImageDelete: boolean;
  enableBulkDelete: boolean;
  enableInviteLog: boolean;
  enableModeratorCommands: boolean;
  enableMemberJoin: boolean;
  enableMemberLeave: boolean;
  enableMemberRoleAdd: boolean;
  enableMemberRoleRemove: boolean;
  enableMemberTimeout: boolean;
  enableNicknameChange: boolean;
  enableMemberBan: boolean;
  enableMemberUnban: boolean;
  enableMemberKick: boolean;
  enableMemberUpdate: boolean;
  enableRoleCreate: boolean;
  enableRoleDelete: boolean;
  enableRoleUpdate: boolean;
  enableChannelCreate: boolean;
  enableChannelUpdate: boolean;
  enableChannelDelete: boolean;
  enableEmojiCreate: boolean;
  enableEmojiUpdate: boolean;
  enableEmojiDelete: boolean;
  enableVoiceJoin: boolean;
  enableVoiceLeave: boolean;
  enableVoiceMove: boolean;
  enableServerUpdate: boolean;
}

export default function ActionLogsConfig({ serverId }: { serverId: string }) {
  const [config, setConfig] = useState<ActionLogsConfigData>({
    logChannelId: '',
    showAvatar: true,
    showAccountAge: true,
    ignoredChannels: [],
    ignoredRoles: [],
    enableMessageDelete: true,
    enableMessageEdit: true,
    enableImageDelete: true,
    enableBulkDelete: true,
    enableInviteLog: false,
    enableModeratorCommands: false,
    enableMemberJoin: true,
    enableMemberLeave: true,
    enableMemberRoleAdd: false,
    enableMemberRoleRemove: false,
    enableMemberTimeout: true,
    enableNicknameChange: false,
    enableMemberBan: true,
    enableMemberUnban: true,
    enableMemberKick: true,
    enableMemberUpdate: false,
    enableRoleCreate: false,
    enableRoleDelete: false,
    enableRoleUpdate: false,
    enableChannelCreate: false,
    enableChannelUpdate: false,
    enableChannelDelete: false,
    enableEmojiCreate: false,
    enableEmojiUpdate: false,
    enableEmojiDelete: false,
    enableVoiceJoin: false,
    enableVoiceLeave: false,
    enableVoiceMove: false,
    enableServerUpdate: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [ignoredChannelInput, setIgnoredChannelInput] = useState('');
  const [ignoredRoleInput, setIgnoredRoleInput] = useState('');

  useEffect(() => {
    fetchConfig();
  }, [serverId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/action-logs`);
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
      const res = await fetch(`/api/servers/${serverId}/action-logs`, {
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

  const addIgnoredChannel = () => {
    if (ignoredChannelInput && !config.ignoredChannels.includes(ignoredChannelInput)) {
      setConfig({ ...config, ignoredChannels: [...config.ignoredChannels, ignoredChannelInput] });
      setIgnoredChannelInput('');
    }
  };

  const removeIgnoredChannel = (id: string) => {
    setConfig({ ...config, ignoredChannels: config.ignoredChannels.filter(c => c !== id) });
  };

  const addIgnoredRole = () => {
    if (ignoredRoleInput && !config.ignoredRoles.includes(ignoredRoleInput)) {
      setConfig({ ...config, ignoredRoles: [...config.ignoredRoles, ignoredRoleInput] });
      setIgnoredRoleInput('');
    }
  };

  const removeIgnoredRole = (id: string) => {
    setConfig({ ...config, ignoredRoles: config.ignoredRoles.filter(r => r !== id) });
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
      {/* Log Channel */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faHashtag} className="h-4 w-4 text-blue-500" />
          LOG CHANNEL
        </label>
        <input
          type="text"
          value={config.logChannelId}
          onChange={(e) => setConfig({ ...config, logChannelId: e.target.value })}
          placeholder="Enter Channel ID (e.g. 1234567890)"
          className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <p className="text-xs text-slate-400 mt-2">
          Where the events selected below will be posted.
        </p>
      </div>

      {/* Display Settings */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCog} className="h-4 w-4 text-purple-500" />
          DISPLAY SETTINGS
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faUserTag} className="h-4 w-4 text-cyan-500" />
              <span className="text-slate-300">Show Avatar on Join/Leave</span>
            </div>
            <input
              type="checkbox"
              checked={config.showAvatar}
              onChange={(e) => setConfig({ ...config, showAvatar: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faUserClock} className="h-4 w-4 text-yellow-500" />
              <span className="text-slate-300">Show Account Age (Days)</span>
            </div>
            <input
              type="checkbox"
              checked={config.showAccountAge}
              onChange={(e) => setConfig({ ...config, showAccountAge: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Ignored Channels */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4 text-orange-500" />
          IGNORED CHANNELS
        </h3>
        <p className="text-xs text-slate-400 mb-3">Events will not be logged for these channels.</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={ignoredChannelInput}
            onChange={(e) => setIgnoredChannelInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addIgnoredChannel()}
            placeholder="Channel ID"
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={addIgnoredChannel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.ignoredChannels.map(id => (
            <span key={id} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {id}
              <button
                onClick={() => removeIgnoredChannel(id)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Ignored Roles */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4 text-pink-500" />
          IGNORED ROLES
        </h3>
        <p className="text-xs text-slate-400 mb-3">Deleted messages will not be logged for these roles.</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={ignoredRoleInput}
            onChange={(e) => setIgnoredRoleInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addIgnoredRole()}
            placeholder="Role ID"
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={addIgnoredRole}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.ignoredRoles.map(id => (
            <span key={id} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {id}
              <button
                onClick={() => removeIgnoredRole(id)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faShield} className="h-5 w-5 text-green-500" />
          EVENTS
        </h3>
        <p className="text-sm text-slate-400 mb-6">Choose which events will be logged.</p>

        <div className="space-y-4">
          {/* Message Events */}
          <div className="bg-slate-700/50 p-4 rounded">
            <h4 className="text-white font-medium mb-3 text-sm">Message Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-red-500" />
                  <span className="text-slate-300 text-sm">MESSAGE DELETE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMessageDelete}
                  onChange={(e) => setConfig({ ...config, enableMessageDelete: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-300 text-sm">MESSAGE EDIT</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMessageEdit}
                  onChange={(e) => setConfig({ ...config, enableMessageEdit: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-purple-500" />
                  <span className="text-slate-300 text-sm">IMAGE DELETE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableImageDelete}
                  onChange={(e) => setConfig({ ...config, enableImageDelete: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-pink-500" />
                  <span className="text-slate-300 text-sm">BULK MESSAGE DELETE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableBulkDelete}
                  onChange={(e) => setConfig({ ...config, enableBulkDelete: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-cyan-500" />
                  <span className="text-slate-300 text-sm">LOG INVITES/INVITE INFO</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableInviteLog}
                  onChange={(e) => setConfig({ ...config, enableInviteLog: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faGavel} className="h-4 w-4 text-orange-500" />
                  <span className="text-slate-300 text-sm">MODERATOR COMMANDS</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableModeratorCommands}
                  onChange={(e) => setConfig({ ...config, enableModeratorCommands: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Member Events */}
          <div className="bg-slate-700/50 p-4 rounded">
            <h4 className="text-white font-medium mb-3 text-sm">Member Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300 text-sm">MEMBER JOIN</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMemberJoin}
                  onChange={(e) => setConfig({ ...config, enableMemberJoin: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserMinus} className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-300 text-sm">MEMBER LEAVE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMemberLeave}
                  onChange={(e) => setConfig({ ...config, enableMemberLeave: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-300 text-sm">MEMBER ROLE ADD</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMemberRoleAdd}
                  onChange={(e) => setConfig({ ...config, enableMemberRoleAdd: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-orange-500" />
                  <span className="text-slate-300 text-sm">MEMBER ROLE REMOVE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMemberRoleRemove}
                  onChange={(e) => setConfig({ ...config, enableMemberRoleRemove: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserClock} className="h-4 w-4 text-red-500" />
                  <span className="text-slate-300 text-sm">MEMBER TIMEOUT <span className="text-xs text-green-500">(NEW)</span></span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMemberTimeout}
                  onChange={(e) => setConfig({ ...config, enableMemberTimeout: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserTag} className="h-4 w-4 text-purple-500" />
                  <span className="text-slate-300 text-sm">NICKNAME CHANGE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableNicknameChange}
                  onChange={(e) => setConfig({ ...config, enableNicknameChange: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faBan} className="h-4 w-4 text-red-500" />
                  <span className="text-slate-300 text-sm">MEMBER BAN</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMemberBan}
                  onChange={(e) => setConfig({ ...config, enableMemberBan: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUnlock} className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300 text-sm">MEMBER UNBAN</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableMemberUnban}
                  onChange={(e) => setConfig({ ...config, enableMemberUnban: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Role Events */}
          <div className="bg-slate-700/50 p-4 rounded">
            <h4 className="text-white font-medium mb-3 text-sm">Role Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300 text-sm">ROLE CREATE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableRoleCreate}
                  onChange={(e) => setConfig({ ...config, enableRoleCreate: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-red-500" />
                  <span className="text-slate-300 text-sm">ROLE DELETE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableRoleDelete}
                  onChange={(e) => setConfig({ ...config, enableRoleDelete: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserPen} className="h-4 w-4 text-cyan-500" />
                  <span className="text-slate-300 text-sm">ROLE UPDATE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableRoleUpdate}
                  onChange={(e) => setConfig({ ...config, enableRoleUpdate: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Channel Events */}
          <div className="bg-slate-700/50 p-4 rounded">
            <h4 className="text-white font-medium mb-3 text-sm">Channel Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faHashtag} className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300 text-sm">CHANNEL CREATE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableChannelCreate}
                  onChange={(e) => setConfig({ ...config, enableChannelCreate: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faHashtag} className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-300 text-sm">CHANNEL UPDATE <span className="text-xs text-green-500">(NEW)</span></span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableChannelUpdate}
                  onChange={(e) => setConfig({ ...config, enableChannelUpdate: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faHashtag} className="h-4 w-4 text-red-500" />
                  <span className="text-slate-300 text-sm">CHANNEL DELETE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableChannelDelete}
                  onChange={(e) => setConfig({ ...config, enableChannelDelete: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Emoji Events */}
          <div className="bg-slate-700/50 p-4 rounded">
            <h4 className="text-white font-medium mb-3 text-sm">Emoji Events <span className="text-xs text-green-500">(NEW)</span></h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faSmile} className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300 text-sm">EMOJI CREATE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableEmojiCreate}
                  onChange={(e) => setConfig({ ...config, enableEmojiCreate: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faSmile} className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-300 text-sm">EMOJI NAME CHANGE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableEmojiUpdate}
                  onChange={(e) => setConfig({ ...config, enableEmojiUpdate: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faSmile} className="h-4 w-4 text-red-500" />
                  <span className="text-slate-300 text-sm">EMOJI DELETE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableEmojiDelete}
                  onChange={(e) => setConfig({ ...config, enableEmojiDelete: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Voice Events */}
          <div className="bg-slate-700/50 p-4 rounded">
            <h4 className="text-white font-medium mb-3 text-sm">Voice Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faMicrophone} className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300 text-sm">VOICE CHANNEL JOIN</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableVoiceJoin}
                  onChange={(e) => setConfig({ ...config, enableVoiceJoin: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faMicrophone} className="h-4 w-4 text-red-500" />
                  <span className="text-slate-300 text-sm">VOICE CHANNEL LEAVE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableVoiceLeave}
                  onChange={(e) => setConfig({ ...config, enableVoiceLeave: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faMicrophone} className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-300 text-sm">VOICE CHANNEL MOVE</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableVoiceMove}
                  onChange={(e) => setConfig({ ...config, enableVoiceMove: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={saving ? 'animate-spin' : ''} />
        {saving ? 'Saving...' : 'Save Configuration'}
      </button>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
