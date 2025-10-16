'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faUserMinus, 
  faRocket, 
  faToggleOn, 
  faToggleOff,
  faSave,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

interface SystemConfig {
  channelId: string;
  message: string;
  embedName: string;
  isActive: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: number;
}

interface Embed {
  id: number;
  name: string;
}

export default function AnnouncementsPage() {
  const params = useParams();
  const serverId = params.id as string;

  const [channels, setChannels] = useState<Channel[]>([]);
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [welcomeConfig, setWelcomeConfig] = useState<SystemConfig>({
    channelId: '',
    message: '',
    embedName: '',
    isActive: false
  });

  const [leaveConfig, setLeaveConfig] = useState<SystemConfig>({
    channelId: '',
    message: '',
    embedName: '',
    isActive: false
  });

  const [boostConfig, setBoostConfig] = useState<SystemConfig>({
    channelId: '',
    message: '',
    embedName: '',
    isActive: false
  });

  useEffect(() => {
    loadData();
  }, [serverId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [channelsRes, embedsRes, welcomeRes, leaveRes, boostRes] = await Promise.all([
        fetch(`/api/servers/${serverId}/channels`),
        fetch(`/api/custom-embeds?serverId=${serverId}`),
        fetch(`/api/servers/${serverId}/welcome`),
        fetch(`/api/servers/${serverId}/leave`),
        fetch(`/api/servers/${serverId}/boost`)
      ]);

      const channelsData = await channelsRes.json();
      const embedsData = await embedsRes.json();
      const welcomeData = await welcomeRes.json();
      const leaveData = await leaveRes.json();
      const boostData = await boostRes.json();

      setChannels(Array.isArray(channelsData) ? channelsData.filter((c: Channel) => c.type === 0) : []);
      setEmbeds(Array.isArray(embedsData) ? embedsData : []);

      if (welcomeData) {
        setWelcomeConfig({
          channelId: welcomeData.channelId || '',
          message: welcomeData.message || '',
          embedName: welcomeData.embedName || '',
          isActive: welcomeData.isActive || false
        });
      }

      if (leaveData) {
        setLeaveConfig({
          channelId: leaveData.channelId || '',
          message: leaveData.message || '',
          embedName: leaveData.embedName || '',
          isActive: leaveData.isActive || false
        });
      }

      if (boostData) {
        setBoostConfig({
          channelId: boostData.channelId || '',
          message: boostData.message || '',
          embedName: boostData.embedName || '',
          isActive: boostData.isActive || false
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (type: 'welcome' | 'leave' | 'boost') => {
    setSaving(type);
    try {
      const config = type === 'welcome' ? welcomeConfig : type === 'leave' ? leaveConfig : boostConfig;
      
      const response = await fetch(`/api/servers/${serverId}/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} configuration saved successfully!`);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const renderConfigSection = (
    type: 'welcome' | 'leave' | 'boost',
    config: SystemConfig,
    setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>,
    icon: any,
    title: string,
    color: string
  ) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <button
          onClick={() => setConfig({ ...config, isActive: !config.isActive })}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            config.isActive 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
          }`}
        >
          <FontAwesomeIcon icon={config.isActive ? faToggleOn : faToggleOff} className="md:mr-1" />
          <span className="hidden md:inline">{config.isActive ? 'Enabled' : 'Disabled'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Channel
          </label>
          <select
            value={config.channelId}
            onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a channel...</option>
            {channels.map(channel => (
              <option key={channel.id} value={channel.id}>
                #{channel.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <textarea
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
            placeholder={`Enter ${type} message...`}
            rows={4}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Embed (Optional)
          </label>
          <select
            value={config.embedName}
            onChange={(e) => setConfig({ ...config, embedName: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">No embed</option>
            {embeds.map(embed => (
              <option key={embed.id} value={embed.name}>
                {embed.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => saveConfig(type)}
          disabled={saving === type}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faSave} className="md:mr-2" />
          <span className="hidden md:inline">{saving === type ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <FontAwesomeIcon icon={faRocket} className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
          <h1 className="text-lg md:text-2xl font-bold text-white">Announcements</h1>
        </div>
        <p className="text-sm md:text-base text-slate-400 mb-4">
          Configure welcome, leave, and boost messages for your server
        </p>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-300 mb-2">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              You can use these variables in the message boxes below:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-400">
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`user`}{'}'}</code> - Mention the user</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`username`}{'}'}</code> - User's username</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`avatar`}{'}'}</code> - User's avatar URL</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`server`}{'}'}</code> - Server name</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`channel`}{'}'}</code> - Channel name</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`server_membercount`}{'}'}</code> - Total members</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded text-yellow-400">{'{'}{`server_membercount_ordinal`}{'}'}</code> - Member # with ordinal (1st, 2nd)</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`server_boostcount`}{'}'}</code> - Current boosts</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded text-yellow-400">{'{'}{`server_nextboostlevel_until_required`}{'}'}</code> - Boosts needed for next tier</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`server_icon`}{'}'}</code> - Server icon URL</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{'&'}role{'}'}</code> - Mention a role (e.g., {'{'}{'&'}Gamers{'}'})</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`#channel`}{'}'}</code> - Link a channel</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`everyone`}{'}'}</code> - @everyone</div>
              <div><code className="bg-slate-900 px-2 py-1 rounded">{'{'}{`here`}{'}'}</code> - @here</div>
            </div>
            <p className="text-xs text-yellow-400 mt-2">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              New variables highlighted in yellow!
            </p>
          </div>
        </div>

        <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderConfigSection(
            'welcome',
            welcomeConfig,
            setWelcomeConfig,
            faUserPlus,
            'Welcome Messages',
            'bg-green-600'
          )}

          {renderConfigSection(
            'leave',
            leaveConfig,
            setLeaveConfig,
            faUserMinus,
            'Leave Messages',
            'bg-red-600'
          )}

          {renderConfigSection(
            'boost',
            boostConfig,
            setBoostConfig,
            faRocket,
            'Boost Messages',
            'bg-purple-600'
          )}
        </div>
        </div>
    </div>
  );
}
