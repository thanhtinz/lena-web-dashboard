'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner,
  faCalendarDays,
  faPlus,
  faTrash,
  faHashtag,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import PremiumNotice from './PremiumNotice';

interface ScheduledMessage {
  id: number;
  channelId: string;
  message: string;
  cronExpression: string;
  enabled: boolean;
  lastSent: string | null;
}

interface Channel {
  id: string;
  name: string;
  type: number;
}

interface NewMessageForm {
  channelId: string;
  message: string;
  cronExpression: string;
  cronPreset: string;
}

export default function ScheduledMessagesConfig({ serverId }: { serverId: string }) {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMessage, setNewMessage] = useState<NewMessageForm>({
    channelId: '',
    message: '',
    cronExpression: '0 9 * * *',
    cronPreset: 'daily_9am'
  });

  const cronPresets = [
    { value: 'daily_9am', label: 'Daily at 9:00 AM', cron: '0 9 * * *' },
    { value: 'daily_12pm', label: 'Daily at 12:00 PM', cron: '0 12 * * *' },
    { value: 'daily_6pm', label: 'Daily at 6:00 PM', cron: '0 18 * * *' },
    { value: 'weekly_monday', label: 'Every Monday at 9:00 AM', cron: '0 9 * * 1' },
    { value: 'weekly_friday', label: 'Every Friday at 5:00 PM', cron: '0 17 * * 5' },
    { value: 'hourly', label: 'Every Hour', cron: '0 * * * *' },
    { value: 'every_30min', label: 'Every 30 Minutes', cron: '*/30 * * * *' },
    { value: 'custom', label: 'Custom Cron Expression', cron: '' }
  ];

  useEffect(() => {
    fetchMessages();
    fetchChannels();
  }, [serverId]);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/channels`);
      if (res.ok) {
        const data = await res.json();
        setChannels(Array.isArray(data) ? data.filter((c: Channel) => c.type === 0) : []);
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/scheduled-messages`);
      if (res.status === 403) {
        const data = await res.json();
        if (data.isPremium === false) {
          setIsPremium(false);
        }
      } else if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setIsPremium(true);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/scheduled-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: newMessage.channelId,
          message: newMessage.message,
          cronExpression: newMessage.cronExpression,
          enabled: true
        }),
      });
      if (res.ok) {
        await fetchMessages();
        setMessage('✅ Scheduled message created!');
        setShowCreateForm(false);
        setNewMessage({
          channelId: '',
          message: '',
          cronExpression: '0 9 * * *',
          cronPreset: 'daily_9am'
        });
      } else {
        const error = await res.json();
        setMessage(`❌ ${error.error || 'Failed to create'}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteMessage = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/scheduled-messages`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchMessages();
        setMessage('✅ Scheduled message deleted!');
      } else {
        setMessage('❌ Failed to delete');
      }
    } catch (error) {
      setMessage('❌ Failed to delete');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const toggleMessage = async (id: number, enabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/scheduled-messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      if (res.ok) {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to toggle message:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePresetChange = (preset: string) => {
    const selectedPreset = cronPresets.find(p => p.value === preset);
    setNewMessage({
      ...newMessage,
      cronPreset: preset,
      cronExpression: selectedPreset?.cron || newMessage.cronExpression
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    return <PremiumNotice featureName="Scheduled Messages" serverId={serverId} />;
  }

  return (
    <div className="space-y-6">
      {/* Create New Message Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={showCreateForm ? faCalendarDays : faPlus} />
          <span className="hidden md:inline">{showCreateForm ? 'Cancel' : 'Create New Scheduled Message'}</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-blue-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5 text-blue-500" />
            Create New Scheduled Message
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Channel *</label>
              <select
                value={newMessage.channelId}
                onChange={(e) => setNewMessage({...newMessage, channelId: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                placeholder="Enter your message here..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">You can use announcement variables like {'{user}'}, {'{server}'}, etc.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Schedule *</label>
              <select
                value={newMessage.cronPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {cronPresets.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {newMessage.cronPreset === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cron Expression *
                </label>
                <input
                  type="text"
                  value={newMessage.cronExpression}
                  onChange={(e) => setNewMessage({...newMessage, cronExpression: e.target.value})}
                  placeholder="0 9 * * *"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <p>Format: minute hour day month dayOfWeek</p>
                  <p>• minute: 0-59 | hour: 0-23 | day: 1-31 | month: 1-12 | dayOfWeek: 0-7 (0&7=Sunday)</p>
                  <p>• Use * for "every" (e.g., "0 9 * * *" = every day at 9 AM)</p>
                </div>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
                <strong>Current schedule:</strong> {newMessage.cronExpression}
              </p>
            </div>

            <button
              onClick={createMessage}
              disabled={saving || !newMessage.channelId || !newMessage.message || !newMessage.cronExpression}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={saving ? 'animate-spin' : ''} />
              <span className="hidden md:inline">{saving ? 'Creating...' : 'Create Scheduled Message'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-blue-500" />
          Scheduled Messages ({messages.length})
        </h3>

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No scheduled messages yet</p>
            <p className="text-sm text-slate-500">Click "Create New Scheduled Message" button above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-slate-700/50 p-4 rounded">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon icon={faHashtag} className="h-4 w-4 text-slate-400" />
                      <span className="text-white font-medium">
                        {channels.find(c => c.id === msg.channelId)?.name || msg.channelId}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer ml-auto">
                        <input
                          type="checkbox"
                          checked={msg.enabled}
                          onChange={(e) => toggleMessage(msg.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="bg-slate-800 p-3 rounded mb-2">
                      <p className="text-slate-300 text-sm">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                        <code className="bg-slate-600 px-2 py-1 rounded">{msg.cronExpression}</code>
                      </div>
                      {msg.lastSent && (
                        <span>Last sent: {new Date(msg.lastSent).toLocaleString('vi-VN')}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="ml-4 px-2.5 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded ${message.includes('✅') ? 'bg-green-600' : 'bg-red-600'} text-white text-center`}>
          {message}
        </div>
      )}
    </div>
  );
}
