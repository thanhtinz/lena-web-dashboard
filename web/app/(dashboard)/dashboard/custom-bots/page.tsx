'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faPlus, 
  faEdit, 
  faTrash, 
  faCrown,
  faCircle,
  faCog,
  faServer,
  faImage,
  faKey,
  faTimes,
  faCheckCircle,
  faCopy,
  faSpinner,
  faSave
} from '@fortawesome/free-solid-svg-icons';

interface CustomBot {
  id: string;
  userId: string;
  serverId: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  clientId: string;
  status: 'online' | 'offline' | 'maintenance';
  config: {
    prefix?: string;
    personalityMode?: string;
    statusMessage?: string;
    enabledFeatures?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CustomBotsPage() {
  const [bots, setBots] = useState<CustomBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBot, setEditingBot] = useState<CustomBot | null>(null);
  const [error, setError] = useState<string>('');
  const [isPremium, setIsPremium] = useState(true); // Always allow button click, API will check premium

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/custom-bots');
      if (res.status === 403 || res.status === 401) {
        // Not authenticated or premium required - show empty state
        setBots([]);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch bots');
      const data = await res.json();
      setBots(data.bots || []);
    } catch (err) {
      setError('Failed to load custom bots');
    } finally {
      setLoading(false);
    }
  };

  const deleteBot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom bot?')) return;

    try {
      const res = await fetch(`/api/custom-bots/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete bot');
      }

      setBots(bots.filter(bot => bot.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-gray-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FontAwesomeIcon icon={faRobot} className="text-blue-600" />
            Custom Bots
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full">
              <FontAwesomeIcon icon={faCrown} className="mr-1" />
              PREMIUM
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Create and manage your own custom bot instances
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!isPremium}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faPlus} className="md:mr-1" />
          <span className="hidden md:inline">Create Custom Bot</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {bots.length === 0 ? (
        <div className="bg-slate-800 p-12 rounded-lg border border-slate-700 text-center">
          <FontAwesomeIcon icon={faRobot} className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-slate-400 mb-4">You haven't created any custom bots yet.</p>
          <p className="text-sm text-slate-500 mb-6">
            Premium users can create their own bot instances with custom configurations.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!isPremium}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg inline-flex items-center gap-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPlus} className="md:mr-1" />
            <span className="hidden md:inline">Create Your First Bot</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-600 transition overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {bot.avatarUrl ? (
                      <img 
                        src={bot.avatarUrl} 
                        alt={bot.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={faRobot} className="text-white h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white">{bot.name}</h3>
                      <p className="text-xs text-slate-400">
                        {bot.username || 'No username'}
                      </p>
                    </div>
                  </div>
                  <FontAwesomeIcon 
                    icon={faCircle} 
                    className={`h-3 w-3 ${getStatusColor(bot.status)}`}
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FontAwesomeIcon icon={faServer} className="text-slate-500 w-4" />
                    <span className="text-slate-400">Server ID:</span>
                    <span className="text-slate-300 text-xs">{bot.serverId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FontAwesomeIcon icon={faCog} className="text-slate-500 w-4" />
                    <span className="text-slate-400">Prefix:</span>
                    <span className="text-slate-300">{bot.config?.prefix || '!'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FontAwesomeIcon icon={faRobot} className="text-slate-500 w-4" />
                    <span className="text-slate-400">Mode:</span>
                    <span className="text-slate-300">{bot.config?.personalityMode || 'Default'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/dashboard/custom-bots/${bot.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition text-sm text-center"
                  >
                    <FontAwesomeIcon icon={faCog} className="md:mr-2" />
                    <span className="hidden md:inline">Manage</span>
                  </a>
                  <button
                    onClick={() => setEditingBot(bot)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition text-sm"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => deleteBot(bot.id)}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded transition text-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Bot Modal */}
      {showCreateModal && (
        <CreateBotModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchBots();
          }}
        />
      )}

      {/* Edit Bot Modal */}
      {editingBot && (
        <EditBotModal
          bot={editingBot}
          onClose={() => setEditingBot(null)}
          onSuccess={() => {
            setEditingBot(null);
            fetchBots();
          }}
        />
      )}
    </div>
  );
}

function CreateBotModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    serverId: '',
    name: '',
    botToken: '',
    clientId: '',
    username: '',
    avatarUrl: '',
    prefix: '!',
    personalityMode: 'Lena',
    statusMessage: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/custom-bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: formData.serverId,
          name: formData.name,
          botToken: formData.botToken,
          clientId: formData.clientId,
          username: formData.username || undefined,
          avatarUrl: formData.avatarUrl || undefined,
          config: {
            prefix: formData.prefix,
            personalityMode: formData.personalityMode,
            statusMessage: formData.statusMessage,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create bot');
      }

      // Show API key to user (only time it's available)
      setApiKey(data.apiKey);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFinish = () => {
    setApiKey(null);
    onSuccess();
  };

  // If API key is shown, display it prominently
  if (apiKey) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full animate-scale-in relative">
          <div className="p-6 border-b border-slate-700 bg-yellow-900/20">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faKey} className="text-yellow-500" />
              Save Your API Key
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
              <strong>⚠️ IMPORTANT:</strong> This is the ONLY time you'll see this API key. Save it securely!
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bot API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 font-mono text-sm"
                />
                <button
                  onClick={copyApiKey}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Your bot process will use this key to authenticate when sending metrics and logs
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 text-blue-400 px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold mb-2">How to use this API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Store this key securely in your bot's environment variables</li>
                <li>Include it in Authorization header: <code className="bg-slate-900 px-1 py-0.5 rounded">Authorization: Bot YOUR_API_KEY</code></li>
                <li>Use it when sending metrics and logs to the dashboard</li>
              </ol>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-semibold"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="md:mr-2" />
              <span className="hidden md:inline">I've Saved the API Key - Continue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition z-10"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
        
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faRobot} className="text-blue-500" />
            Create Custom Bot
          </h3>
          <p className="text-slate-400 text-sm mt-1">Configure your custom bot instance</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
              {error}
              {error.includes('Premium') && (
                <div className="mt-3">
                  <a
                    href="/dashboard/pricing"
                    className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                  >
                    <FontAwesomeIcon icon={faCrown} />
                    Upgrade to Premium
                  </a>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FontAwesomeIcon icon={faServer} className="mr-2" />
              Server ID *
            </label>
            <input
              type="text"
              required
              value={formData.serverId}
              onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              placeholder="123456789012345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FontAwesomeIcon icon={faRobot} className="mr-2" />
              Bot Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              placeholder="My Custom Bot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FontAwesomeIcon icon={faKey} className="mr-2" />
              Bot Token *
            </label>
            <input
              type="password"
              required
              value={formData.botToken}
              onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              placeholder="Your bot token from Discord Developer Portal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FontAwesomeIcon icon={faKey} className="mr-2" />
              Client ID *
            </label>
            <input
              type="text"
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              placeholder="Your bot client ID"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username (optional)
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
                placeholder="BotUsername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                Avatar URL (optional)
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Command Prefix
              </label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
                placeholder="!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Personality Mode
              </label>
              <select
                value={formData.personalityMode}
                onChange={(e) => setFormData({ ...formData, personalityMode: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              >
                <option value="Lena">Lena (Default)</option>
                <option value="Support">Support</option>
                <option value="Technical">Technical</option>
                <option value="Learning">Learning</option>
                <option value="Developer">Developer</option>
                <option value="Anime">Anime</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status Message (optional)
            </label>
            <input
              type="text"
              value={formData.statusMessage}
              onChange={(e) => setFormData({ ...formData, statusMessage: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              placeholder="Custom status message"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg transition"
            >
              <FontAwesomeIcon icon={faTimes} className="md:mr-2" />
              <span className="hidden md:inline">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition disabled:opacity-50"
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faRobot} className={`${loading ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline">{loading ? 'Creating...' : 'Create Bot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditBotModal({ bot, onClose, onSuccess }: { bot: CustomBot; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: bot.name,
    username: bot.username || '',
    avatarUrl: bot.avatarUrl || '',
    prefix: bot.config?.prefix || '!',
    personalityMode: bot.config?.personalityMode || 'Lena',
    statusMessage: bot.config?.statusMessage || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/custom-bots/${bot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username || undefined,
          avatarUrl: formData.avatarUrl || undefined,
          config: {
            prefix: formData.prefix,
            personalityMode: formData.personalityMode,
            statusMessage: formData.statusMessage,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update bot');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Edit Custom Bot</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bot Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Command Prefix
              </label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Personality Mode
              </label>
              <select
                value={formData.personalityMode}
                onChange={(e) => setFormData({ ...formData, personalityMode: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
              >
                <option value="Lena">Lena (Default)</option>
                <option value="Support">Support</option>
                <option value="Technical">Technical</option>
                <option value="Learning">Learning</option>
                <option value="Developer">Developer</option>
                <option value="Anime">Anime</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status Message
            </label>
            <input
              type="text"
              value={formData.statusMessage}
              onChange={(e) => setFormData({ ...formData, statusMessage: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg transition"
            >
              <FontAwesomeIcon icon={faTimes} className="md:mr-2" />
              <span className="hidden md:inline">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition disabled:opacity-50"
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faSave} className={`${loading ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline">{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
