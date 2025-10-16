'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner,
  faTerminal,
  faPlus,
  faTrash,
  faEdit,
  faCrown,
  faCog,
  faShieldAlt,
  faClock,
  faCode,
  faTimes,
  faCheck,
  faPowerOff,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

interface CustomCommand {
  id: number;
  serverId: string;
  commandName: string;
  description?: string;
  response?: string;
  enabled: boolean;
  deleteCommand: boolean;
  silentCommand: boolean;
  dmResponse: boolean;
  disableMentions: boolean;
  allowedRoles: string[];
  ignoredRoles: string[];
  allowedChannels: string[];
  ignoredChannels: string[];
  responseChannel?: string;
  cooldownSeconds: number;
  deleteAfter: number;
  requiredArguments: number;
  additionalResponses: Array<{ content: string; weight?: number }>;
  embedConfig?: EmbedConfig | null;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface Channel {
  id: string;
  name: string;
  type: number;
  position: number;
}

interface EmbedConfig {
  title?: string;
  description?: string;
  color?: string;
  thumbnail?: string;
  image?: string;
  footer?: {
    text?: string;
    iconUrl?: string;
  };
}

export default function CustomCommandsConfig({ serverId }: { serverId: string }) {
  const [commands, setCommands] = useState<CustomCommand[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CustomCommand | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions' | 'advanced' | 'embeds'>('basic');

  const [formData, setFormData] = useState({
    commandName: '',
    description: '',
    response: '',
    enabled: true,
    deleteCommand: false,
    silentCommand: false,
    dmResponse: false,
    disableMentions: false,
    allowedRoles: [] as string[],
    ignoredRoles: [] as string[],
    allowedChannels: [] as string[],
    ignoredChannels: [] as string[],
    responseChannel: '',
    cooldownSeconds: 0,
    deleteAfter: 0,
    requiredArguments: 0,
    additionalResponses: [] as Array<{ content: string; weight?: number }>,
    embedConfig: null as EmbedConfig | null,
  });

  useEffect(() => {
    fetchCommands();
    fetchRolesAndChannels();
  }, [serverId]);

  const fetchCommands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/servers/${serverId}/custom-commands`);
      if (response.ok) {
        const data = await response.json();
        setCommands(data.commands || []);
      }
    } catch (error) {
      console.error('Error fetching commands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolesAndChannels = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/roles-channels`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error('Error fetching roles/channels:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.commandName || !formData.response) {
      showMessage('❌ Command name and response are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/custom-commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showMessage('✅ Command created successfully!', 'success');
        setShowModal(false);
        resetForm();
        fetchCommands();
      } else {
        const error = await response.json();
        showMessage(`❌ ${error.error || 'Failed to create command'}`, 'error');
      }
    } catch (error) {
      console.error('Error creating command:', error);
      showMessage('❌ Failed to create command', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCommand) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/custom-commands`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingCommand.id }),
      });

      if (response.ok) {
        showMessage('✅ Command updated successfully!', 'success');
        setShowModal(false);
        setEditingCommand(null);
        resetForm();
        fetchCommands();
      } else {
        const error = await response.json();
        showMessage(`❌ ${error.error || 'Failed to update command'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating command:', error);
      showMessage('❌ Failed to update command', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commandId: number) => {
    if (!confirm('Are you sure you want to delete this command?')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/custom-commands?commandId=${commandId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('✅ Command deleted successfully!', 'success');
        fetchCommands();
      } else {
        showMessage('❌ Failed to delete command', 'error');
      }
    } catch (error) {
      console.error('Error deleting command:', error);
      showMessage('❌ Failed to delete command', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (command: CustomCommand) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/custom-commands`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: command.id, enabled: !command.enabled }),
      });

      if (response.ok) {
        fetchCommands();
      }
    } catch (error) {
      console.error('Error toggling command:', error);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (command: CustomCommand) => {
    setEditingCommand(command);
    setFormData({
      commandName: command.commandName,
      description: command.description || '',
      response: command.response || '',
      enabled: command.enabled,
      deleteCommand: command.deleteCommand,
      silentCommand: command.silentCommand,
      dmResponse: command.dmResponse,
      disableMentions: command.disableMentions,
      allowedRoles: command.allowedRoles,
      ignoredRoles: command.ignoredRoles,
      allowedChannels: command.allowedChannels,
      ignoredChannels: command.ignoredChannels,
      responseChannel: command.responseChannel || '',
      cooldownSeconds: command.cooldownSeconds,
      deleteAfter: command.deleteAfter,
      requiredArguments: command.requiredArguments,
      additionalResponses: command.additionalResponses,
      embedConfig: command.embedConfig ?? null,
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      commandName: '',
      description: '',
      response: '',
      enabled: true,
      deleteCommand: false,
      silentCommand: false,
      dmResponse: false,
      disableMentions: false,
      allowedRoles: [],
      ignoredRoles: [],
      allowedChannels: [],
      ignoredChannels: [],
      responseChannel: '',
      cooldownSeconds: 0,
      deleteAfter: 0,
      requiredArguments: 0,
      additionalResponses: [],
      embedConfig: null,
    });
    setEditingCommand(null);
    setActiveTab('basic');
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const renderBasicTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Command Name *
        </label>
        <input
          type="text"
          value={formData.commandName}
          onChange={(e) => setFormData({ ...formData, commandName: e.target.value.toLowerCase() })}
          placeholder="ping"
          disabled={!!editingCommand}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">Lowercase letters, numbers, _ and - only</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What does this command do?"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Response *
        </label>
        <textarea
          value={formData.response}
          onChange={(e) => setFormData({ ...formData, response: e.target.value })}
          placeholder="Hello {user}! Server: {server.name}"
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">
          Variables: {'{user}'}, {'{username}'}, {'{user.id}'}, {'{server.name}'}, {'{channel.name}'}, {'{args}'}, etc.
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-700 pt-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.deleteCommand}
            onChange={(e) => setFormData({ ...formData, deleteCommand: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-slate-300">Delete Command Message</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.silentCommand}
            onChange={(e) => setFormData({ ...formData, silentCommand: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-slate-300">Silent Response (no notification)</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.dmResponse}
            onChange={(e) => setFormData({ ...formData, dmResponse: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-slate-300">Send via DM</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.disableMentions}
            onChange={(e) => setFormData({ ...formData, disableMentions: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-slate-300">Disable @everyone, @here, and role pings</span>
        </label>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-4">
      <div className="bg-slate-700/30 border border-slate-600 rounded p-4 mb-4">
        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mr-2" />
        <span className="text-sm text-slate-300">
          Configure who can use this command and where it works. Leave fields empty to allow all.
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Allowed Roles
        </label>
        <select
          multiple
          value={formData.allowedRoles}
          onChange={(e) => setFormData({ 
            ...formData, 
            allowedRoles: Array.from(e.target.selectedOptions, option => option.value)
          })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500 min-h-32"
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple roles (empty = all roles allowed)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Ignored Roles
        </label>
        <select
          multiple
          value={formData.ignoredRoles}
          onChange={(e) => setFormData({ 
            ...formData, 
            ignoredRoles: Array.from(e.target.selectedOptions, option => option.value)
          })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500 min-h-32"
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple roles (these roles cannot use the command)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Allowed Channels
        </label>
        <select
          multiple
          value={formData.allowedChannels}
          onChange={(e) => setFormData({ 
            ...formData, 
            allowedChannels: Array.from(e.target.selectedOptions, option => option.value)
          })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500 min-h-32"
        >
          {channels.map(channel => (
            <option key={channel.id} value={channel.id}>
              #{channel.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple channels (empty = all channels)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Ignored Channels
        </label>
        <select
          multiple
          value={formData.ignoredChannels}
          onChange={(e) => setFormData({ 
            ...formData, 
            ignoredChannels: Array.from(e.target.selectedOptions, option => option.value)
          })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500 min-h-32"
        >
          {channels.map(channel => (
            <option key={channel.id} value={channel.id}>
              #{channel.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple channels (command won't work in these)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Response Channel (Force response to specific channel)
        </label>
        <select
          value={formData.responseChannel}
          onChange={(e) => setFormData({ ...formData, responseChannel: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Same channel where command is used</option>
          {channels.map(channel => (
            <option key={channel.id} value={channel.id}>
              #{channel.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Force response to always go to a specific channel</p>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cooldown (seconds)
        </label>
        <input
          type="number"
          min="0"
          value={formData.cooldownSeconds}
          onChange={(e) => setFormData({ ...formData, cooldownSeconds: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">Time before the same user can use this command again</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Auto-delete After (seconds)
        </label>
        <input
          type="number"
          min="0"
          value={formData.deleteAfter}
          onChange={(e) => setFormData({ ...formData, deleteAfter: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">Automatically delete the response after X seconds (0 = never)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Required Arguments
        </label>
        <input
          type="number"
          min="0"
          value={formData.requiredArguments}
          onChange={(e) => setFormData({ ...formData, requiredArguments: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">Minimum number of arguments required (0 = none)</p>
      </div>
    </div>
  );

  const renderEmbedsTab = () => {
    const embedData = formData.embedConfig || {};
    
    const updateEmbed = (field: string, value: any) => {
      setFormData({
        ...formData,
        embedConfig: {
          ...embedData,
          [field]: value
        }
      });
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embed Builder Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Embed Builder</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={embedData.title || ''}
              onChange={(e) => updateEmbed('title', e.target.value)}
              placeholder="Embed title (supports variables)"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={embedData.description || ''}
              onChange={(e) => updateEmbed('description', e.target.value)}
              placeholder="Embed description (supports variables)"
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Color (Hex)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={embedData.color || '#5865F2'}
                onChange={(e) => updateEmbed('color', e.target.value)}
                className="w-16 h-10 bg-slate-700 border border-slate-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={embedData.color || '#5865F2'}
                onChange={(e) => updateEmbed('color', e.target.value)}
                placeholder="#5865F2"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Thumbnail URL
            </label>
            <input
              type="text"
              value={embedData.thumbnail || ''}
              onChange={(e) => updateEmbed('thumbnail', e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={embedData.image || ''}
              onChange={(e) => updateEmbed('image', e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Footer Text
            </label>
            <input
              type="text"
              value={embedData.footer?.text || ''}
              onChange={(e) => {
                const footer = embedData.footer ?? {};
                updateEmbed('footer', { ...footer, text: e.target.value });
              }}
              placeholder="Footer text"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Footer Icon URL
            </label>
            <input
              type="text"
              value={embedData.footer?.iconUrl || ''}
              onChange={(e) => {
                const footer = embedData.footer ?? {};
                updateEmbed('footer', { ...footer, iconUrl: e.target.value });
              }}
              placeholder="https://example.com/icon.png"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setFormData({ ...formData, embedConfig: null })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              <FontAwesomeIcon icon={faTimes} className="md:mr-2" />
              <span className="hidden md:inline">Clear Embed</span>
            </button>
          </div>
        </div>

        {/* Embed Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <div 
              className="bg-slate-800 rounded overflow-hidden"
              style={{ borderLeft: `4px solid ${embedData.color || '#5865F2'}` }}
            >
              <div className="p-4 space-y-3">
                {embedData.title && (
                  <h4 className="text-white font-semibold text-lg">
                    {embedData.title}
                  </h4>
                )}
                
                {embedData.description && (
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {embedData.description}
                  </p>
                )}

                {embedData.thumbnail && (
                  <div className="flex justify-end">
                    <img 
                      src={embedData.thumbnail} 
                      alt="Thumbnail" 
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {embedData.image && (
                  <img 
                    src={embedData.image} 
                    alt="Embed" 
                    className="w-full rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}

                {embedData.footer?.text && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    {embedData.footer?.iconUrl && (
                      <img 
                        src={embedData.footer.iconUrl} 
                        alt="Footer icon" 
                        className="w-5 h-5 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <span className="text-slate-400 text-xs">
                      {embedData.footer.text}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!embedData.title && !embedData.description && (
              <div className="text-center text-slate-500 py-8">
                <FontAwesomeIcon icon={faCode} className="h-12 w-12 mb-2" />
                <p>Start building your embed above</p>
              </div>
            )}
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
            <p className="text-xs text-blue-300">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Variables like {'{user}'}, {'{server.name}'} work in embed fields too!
            </p>
          </div>
        </div>
      </div>
    );
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
      {/* Premium Info & Variable Guide */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/50 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <FontAwesomeIcon icon={faCrown} className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-500 mb-2">Premium Feature: Custom Commands</h3>
            <p className="text-slate-300 mb-3">
              Create powerful custom commands with dynamic variables, permissions, cooldowns, and more.
            </p>
            <div className="bg-slate-800/50 p-4 rounded">
              <p className="text-sm font-semibold text-slate-200 mb-2">Available Variables:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{user}'}</code> - User mention</div>
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{username}'}</code> - Username</div>
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{user.id}'}</code> - User ID</div>
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{server.name}'}</code> - Server name</div>
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{server.id}'}</code> - Server ID</div>
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{channel.name}'}</code> - Channel name</div>
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{channel.id}'}</code> - Channel ID</div>
                <div><code className="bg-slate-700 px-2 py-1 rounded">{'{args}'}</code> - All arguments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Command Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="hidden md:inline">Create Command</span>
        </button>
      </div>

      {/* Commands List */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faTerminal} className="text-blue-500" />
          Custom Commands ({commands.length})
        </h3>

        {commands.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faTerminal} className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4">No custom commands yet</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <FontAwesomeIcon icon={faPlus} className="md:mr-2" />
              <span className="hidden md:inline">Create Your First Command</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {commands.map((command) => (
              <div key={command.id} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        !{command.commandName}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        command.enabled ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {command.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {command.description && (
                      <p className="text-slate-400 text-sm mb-2">{command.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs mb-2">
                      {command.deleteCommand && (
                        <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded">Delete Trigger</span>
                      )}
                      {command.dmResponse && (
                        <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded">DM Response</span>
                      )}
                      {command.cooldownSeconds > 0 && (
                        <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded">
                          <FontAwesomeIcon icon={faClock} className="mr-1" />
                          {command.cooldownSeconds}s cooldown
                        </span>
                      )}
                      <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded">
                        Used {command.useCount} times
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleEnabled(command)}
                      disabled={saving}
                      className={`px-3 py-2 rounded transition ${
                        command.enabled 
                          ? 'bg-slate-600 hover:bg-slate-500' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      <FontAwesomeIcon icon={faPowerOff} />
                    </button>
                    <button
                      onClick={() => openEditModal(command)}
                      disabled={saving}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(command.id)}
                      disabled={saving}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">
                {editingCommand ? 'Edit Command' : 'Create Command'}
              </h2>
            </div>

            <div className="border-b border-slate-700">
              <div className="flex space-x-1 p-2">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-2 rounded transition ${
                    activeTab === 'basic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faCog} className="mr-2" />
                  Basic
                </button>
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`px-4 py-2 rounded transition ${
                    activeTab === 'permissions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                  Permissions
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`px-4 py-2 rounded transition ${
                    activeTab === 'advanced' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  Advanced
                </button>
                <button
                  onClick={() => setActiveTab('embeds')}
                  className={`px-4 py-2 rounded transition ${
                    activeTab === 'embeds' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faCode} className="mr-2" />
                  Embeds
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'basic' && renderBasicTab()}
              {activeTab === 'permissions' && renderPermissionsTab()}
              {activeTab === 'advanced' && renderAdvancedTab()}
              {activeTab === 'embeds' && renderEmbedsTab()}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCommand(null);
                  resetForm();
                }}
                disabled={saving}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                <FontAwesomeIcon icon={faTimes} className="md:mr-2" />
                <span className="hidden md:inline">Cancel</span>
              </button>
              <button
                onClick={editingCommand ? handleUpdate : handleCreate}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                <FontAwesomeIcon icon={saving ? faSpinner : faCheck} className={`md:mr-2 ${saving ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{editingCommand ? 'Update' : 'Create'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          message.includes('✅') ? 'bg-green-600' : 'bg-red-600'
        } text-white z-50`}>
          {message}
        </div>
      )}
    </div>
  );
}
