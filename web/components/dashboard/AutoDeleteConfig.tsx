'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner,
  faClock,
  faHashtag,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

interface ChannelConfig {
  channelId: string;
  delay: number;
}

interface AutoDeleteConfigData {
  enabled: boolean;
  channels: ChannelConfig[];
}

export default function AutoDeleteConfig({ serverId }: { serverId: string }) {
  const [config, setConfig] = useState<AutoDeleteConfigData>({
    enabled: false,
    channels: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newChannelId, setNewChannelId] = useState('');
  const [newDelay, setNewDelay] = useState(60);

  useEffect(() => {
    fetchConfig();
  }, [serverId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-delete`);
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
      const res = await fetch(`/api/servers/${serverId}/auto-delete`, {
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

  const addChannel = () => {
    if (newChannelId && !config.channels.find(c => c.channelId === newChannelId)) {
      setConfig({
        ...config,
        channels: [...config.channels, { channelId: newChannelId, delay: newDelay }]
      });
      setNewChannelId('');
      setNewDelay(60);
    }
  };

  const removeChannel = (channelId: string) => {
    setConfig({
      ...config,
      channels: config.channels.filter(c => c.channelId !== channelId)
    });
  };

  const updateDelay = (channelId: string, delay: number) => {
    setConfig({
      ...config,
      channels: config.channels.map(c => 
        c.channelId === channelId ? { ...c, delay } : c
      )
    });
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
              <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-blue-500" />
              Auto Delete Status
            </h3>
            <p className="text-sm text-slate-400 mt-1">Enable/disable entire auto delete message system</p>
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

      {/* Add Channel */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5 text-green-500" />
          Add Channel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Channel ID
            </label>
            <input
              type="text"
              value={newChannelId}
              onChange={(e) => setNewChannelId(e.target.value)}
              placeholder="1234567890"
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Delay (seconds)
            </label>
            <input
              type="number"
              value={newDelay}
              onChange={(e) => setNewDelay(parseInt(e.target.value))}
              min="1"
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={addChannel}
          className="mt-4 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
          <span className="hidden sm:inline">Add Channel</span>
          <span className="sm:hidden">Add</span>
        </button>
        <p className="text-xs text-slate-400 mt-2">
          Enable Developer Mode in Discord, right-click on channel and select "Copy Channel ID"
        </p>
      </div>

      {/* Channel List */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faHashtag} className="h-5 w-5 text-blue-500" />
          Configured Channels ({config.channels.length})
        </h3>

        {config.channels.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No channels configured yet</p>
        ) : (
          <div className="space-y-3">
            {config.channels.map((channel) => (
              <div key={channel.channelId} className="bg-slate-700/50 p-4 rounded flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <FontAwesomeIcon icon={faHashtag} className="h-4 w-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{channel.channelId}</p>
                    <p className="text-sm text-slate-400">Delete after {channel.delay} seconds</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={channel.delay}
                      onChange={(e) => updateDelay(channel.channelId, parseInt(e.target.value))}
                      min="1"
                      className="w-24 bg-slate-600 text-white px-3 py-1 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-slate-400 text-sm">seconds</span>
                  </div>
                </div>
                <button
                  onClick={() => removeChannel(channel.channelId)}
                  className="ml-4 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Remove channel"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
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
          <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Configuration'}</span>
          <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
}
