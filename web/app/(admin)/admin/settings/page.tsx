'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import PaymentSettings from '@/components/admin/PaymentSettings';

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('Lena Bot');
  const [siteDescription, setSiteDescription] = useState('Discord AI Bot with multi-personality system');
  const [supportServerUrl, setSupportServerUrl] = useState('');
  const [defaultPrefix, setDefaultPrefix] = useState('!');
  const [defaultPersonality, setDefaultPersonality] = useState('Lena (Default)');
  const [statusMessages, setStatusMessages] = useState('');
  const [topggToken, setTopggToken] = useState('');
  const [topggWebhookAuth, setTopggWebhookAuth] = useState('');
  const [topggAutoPost, setTopggAutoPost] = useState(false);
  const [rateLimit, setRateLimit] = useState(10);
  const [maxConversationHistory, setMaxConversationHistory] = useState(20);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          siteDescription,
          supportServerUrl,
          defaultPrefix,
          defaultPersonality,
          statusMessages,
          topggToken,
          topggWebhookAuth,
          topggAutoPost,
          rateLimit,
          maxConversationHistory,
          maintenanceMode,
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully! ✅');
      } else {
        alert('Failed to save settings ❌');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings ❌');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">
          Configure website, bot, and payment settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment Configuration */}
        <PaymentSettings />

        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <h3 className="font-semibold text-white mb-4">Website Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Site Description</label>
              <textarea
                rows={3}
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Support Server URL</label>
              <input
                type="text"
                value={supportServerUrl}
                onChange={(e) => setSupportServerUrl(e.target.value)}
                placeholder="https://discord.gg/..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <h3 className="font-semibold text-white mb-4">Bot Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Default Prefix</label>
              <input
                type="text"
                value={defaultPrefix}
                onChange={(e) => setDefaultPrefix(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Default Personality</label>
              <select 
                value={defaultPersonality}
                onChange={(e) => setDefaultPersonality(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                <option>Lena (Default)</option>
                <option>Support</option>
                <option>Technical</option>
                <option>Learning</option>
                <option>Developer</option>
                <option>Anime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Status Messages (one per line)</label>
              <textarea
                rows={5}
                value={statusMessages}
                onChange={(e) => setStatusMessages(e.target.value)}
                placeholder="Studying 📚&#10;Playing games with everyone 🎮&#10;..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <h3 className="font-semibold text-white mb-4">Top.gg Integration</h3>
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-300">
                📊 <strong>Top.gg</strong> is the largest bot list platform for Discord. 
                Integrate to automatically update server count and receive votes from users.
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Top.gg API Token</label>
              <input
                type="password"
                value={topggToken}
                onChange={(e) => setTopggToken(e.target.value)}
                placeholder="Enter your Top.gg API token"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your API token from <a href="https://top.gg/bot/YOUR_BOT_ID/webhooks" target="_blank" className="text-blue-400 hover:underline">top.gg/bot/YOUR_BOT_ID/webhooks</a>
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Webhook Authorization (Optional)</label>
              <input
                type="password"
                value={topggWebhookAuth}
                onChange={(e) => setTopggWebhookAuth(e.target.value)}
                placeholder="Webhook auth password for vote webhooks"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="topggAutoPost" 
                checked={topggAutoPost}
                onChange={(e) => setTopggAutoPost(e.target.checked)}
                className="rounded" 
              />
              <label htmlFor="topggAutoPost" className="text-sm text-slate-300">
                Auto-post server count every 30 minutes
              </label>
            </div>
          </div>
        </div>

        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <h3 className="font-semibold text-white mb-4">Advanced Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Rate Limit (messages/minute)</label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Max Conversation History</label>
              <input
                type="number"
                value={maxConversationHistory}
                onChange={(e) => setMaxConversationHistory(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="maintenance" 
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="rounded" 
              />
              <label htmlFor="maintenance" className="text-sm text-slate-300">
                Maintenance Mode (disable all bot commands)
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faSave} className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
