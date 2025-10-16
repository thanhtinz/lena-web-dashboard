'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faXmark, faClock, faTrophy } from '@fortawesome/free-solid-svg-icons';

interface Channel {
  id: string;
  name: string;
  type: number;
}

interface CreateGiveawayModalProps {
  serverId: string;
  channels: Channel[];
  onClose: () => void;
}

export default function CreateGiveawayModal({ serverId, channels, onClose }: CreateGiveawayModalProps) {
  const [formData, setFormData] = useState({
    channelId: '',
    prize: '',
    duration: '1h',
    winnerCount: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const textChannels = channels.filter(c => c.type === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/servers/${serverId}/giveaways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create giveaway');
      }

      alert('Giveaway created successfully!');
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const durationPresets = [
    { label: '30 minutes', value: '30m' },
    { label: '1 hour', value: '1h' },
    { label: '3 hours', value: '3h' },
    { label: '6 hours', value: '6h' },
    { label: '12 hours', value: '12h' },
    { label: '1 day', value: '1d' },
    { label: '3 days', value: '3d' },
    { label: '1 week', value: '7d' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faGift} className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Create Giveaway</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Channel
            </label>
            <select
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a channel...</option>
              {textChannels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  # {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prize
            </label>
            <input
              type="text"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              placeholder="e.g., Discord Nitro, $50 Steam Card"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-1" />
              Duration
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {durationPresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 mr-1" />
              Number of Winners
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.winnerCount}
              onChange={(e) => setFormData({ ...formData, winnerCount: parseInt(e.target.value) || 1 })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-sm text-blue-300">
            💡 The giveaway will be posted in the selected channel and participants can join by reacting to the message.
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Giveaway'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
