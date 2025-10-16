'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faSave, faTimes,
  faGem, faCrown, faStar, faRocket, faFire, faHeart,
  faBolt, faTrophy, faMagic, faShield, faEye, faEyeSlash,
  faToggleOn, faToggleOff
} from '@fortawesome/free-solid-svg-icons';

const iconMap: Record<string, any> = {
  gem: faGem,
  crown: faCrown,
  star: faStar,
  rocket: faRocket,
  fire: faFire,
  heart: faHeart,
  bolt: faBolt,
  trophy: faTrophy,
  magic: faMagic,
  shield: faShield,
};

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  icon: string;
  badge: string | null;
  description: string;
  priceUsd: number;
  priceVnd: number;
  billingCycle: string;
  trialDays: number;
  features: string[];
  limits: {
    maxServers?: number;
    maxCustomBots?: number;
    maxGiveawaysPerMonth?: number;
    maxCustomCommands?: number;
    maxCustomResponses?: number;
    maxEmbeds?: number;
    storageMb?: number;
    dailyApiCalls?: number;
    concurrentConversations?: number;
  };
  allowedCommands: string[];
  allowedFeatures: string[];
  restrictions: {
    canUseAI?: boolean;
    canUseGames?: boolean;
    canUseModeration?: boolean;
    canUseGiveaways?: boolean;
    canUseCustomBots?: boolean;
    canUseWebSearch?: boolean;
    canUseImageAnalysis?: boolean;
  };
  isVisible: boolean;
  isActive: boolean;
  targetRegion: string;
}

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'limits' | 'features'>('basic');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/pricing/plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setError(error instanceof Error ? error.message : 'Failed to load pricing plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan({
      id: '',
      name: '',
      slug: '',
      icon: 'gem',
      badge: null,
      description: '',
      priceUsd: 0,
      priceVnd: 0,
      billingCycle: 'monthly',
      trialDays: 0,
      features: [],
      limits: {
        maxServers: 1,
        maxCustomBots: 0,
        maxGiveawaysPerMonth: 10,
        maxCustomCommands: 50,
        maxCustomResponses: 50,
        maxEmbeds: 20,
        storageMb: 100,
        dailyApiCalls: 1000,
        concurrentConversations: 5,
      },
      allowedCommands: ['*'],
      allowedFeatures: ['*'],
      restrictions: {
        canUseAI: true,
        canUseGames: true,
        canUseModeration: false,
        canUseGiveaways: false,
        canUseCustomBots: false,
        canUseWebSearch: true,
        canUseImageAnalysis: false,
      },
      isVisible: true,
      isActive: true,
      targetRegion: 'all'
    });
    setIsCreating(true);
    setActiveTab('basic');
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    try {
      const method = isCreating ? 'POST' : 'PUT';
      const url = isCreating 
        ? '/api/admin/pricing/plans' 
        : `/api/admin/pricing/plans?id=${editingPlan.id}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan)
      });

      if (res.ok) {
        await fetchPlans();
        setEditingPlan(null);
        setIsCreating(false);
        alert('✅ Plan saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('❌ Failed to save plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await fetch(`/api/admin/pricing/plans?id=${id}`, { method: 'DELETE' });
      await fetchPlans();
      alert('✅ Plan deleted successfully!');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('❌ Failed to delete plan');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Plans</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchPlans}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (editingPlan) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">
            {isCreating ? 'Create New Plan' : 'Edit Plan'}
          </h1>
          
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'basic' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('limits')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'limits' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Limits & Quotas
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'features' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Features & Restrictions
            </button>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Plan Name *</label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Premium, Enterprise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Slug * (URL-friendly)</label>
                    <input
                      type="text"
                      value={editingPlan.slug}
                      onChange={(e) => setEditingPlan({ ...editingPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., premium, enterprise"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 h-20 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Brief description of this plan..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Price USD *</label>
                    <input
                      type="number"
                      value={editingPlan.priceUsd}
                      onChange={(e) => setEditingPlan({ ...editingPlan, priceUsd: Number(e.target.value) })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="9.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Price VND *</label>
                    <input
                      type="number"
                      value={editingPlan.priceVnd}
                      onChange={(e) => setEditingPlan({ ...editingPlan, priceVnd: Number(e.target.value) })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="250000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Billing Cycle *</label>
                    <select
                      value={editingPlan.billingCycle}
                      onChange={(e) => setEditingPlan({ ...editingPlan, billingCycle: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Trial Days</label>
                    <input
                      type="number"
                      value={editingPlan.trialDays}
                      onChange={(e) => setEditingPlan({ ...editingPlan, trialDays: Number(e.target.value) })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
                    <select
                      value={editingPlan.icon}
                      onChange={(e) => setEditingPlan({ ...editingPlan, icon: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    >
                      {Object.keys(iconMap).map(iconName => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Badge (optional)</label>
                    <input
                      type="text"
                      value={editingPlan.badge || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Popular, Best Value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Target Region</label>
                    <select
                      value={editingPlan.targetRegion}
                      onChange={(e) => setEditingPlan({ ...editingPlan, targetRegion: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All Regions</option>
                      <option value="us">United States</option>
                      <option value="vn">Vietnam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Features (one per line)
                  </label>
                  <textarea
                    value={editingPlan.features.join('\n')}
                    onChange={(e) => setEditingPlan({ 
                      ...editingPlan, 
                      features: e.target.value.split('\n').filter(f => f.trim()) 
                    })}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 h-32 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                    placeholder="Unlimited AI conversations&#10;Priority support&#10;Custom branding&#10;..."
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.isVisible}
                      onChange={(e) => setEditingPlan({ ...editingPlan, isVisible: e.target.checked })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-white flex items-center gap-2">
                      <FontAwesomeIcon icon={editingPlan.isVisible ? faEye : faEyeSlash} />
                      Visible on pricing page
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.isActive}
                      onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-white flex items-center gap-2">
                      <FontAwesomeIcon icon={editingPlan.isActive ? faToggleOn : faToggleOff} />
                      Active (users can subscribe)
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Limits Tab */}
            {activeTab === 'limits' && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Resource Limits</h3>
                  <p className="text-sm text-slate-400">Configure maximum quotas for this plan. Use -1 for unlimited.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Servers</label>
                    <input
                      type="number"
                      value={editingPlan.limits.maxServers ?? 1}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, maxServers: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Number of servers user can use bot in</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Custom Bots</label>
                    <input
                      type="number"
                      value={editingPlan.limits.maxCustomBots ?? 0}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, maxCustomBots: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">Custom bot instances allowed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Giveaways/Month</label>
                    <input
                      type="number"
                      value={editingPlan.limits.maxGiveawaysPerMonth ?? 10}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, maxGiveawaysPerMonth: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="10"
                    />
                    <p className="text-xs text-slate-500 mt-1">Giveaways per month</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Custom Commands</label>
                    <input
                      type="number"
                      value={editingPlan.limits.maxCustomCommands ?? 50}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, maxCustomCommands: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Custom commands per server</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Auto-Responses</label>
                    <input
                      type="number"
                      value={editingPlan.limits.maxCustomResponses ?? 50}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, maxCustomResponses: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Auto-responses per server</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Embeds</label>
                    <input
                      type="number"
                      value={editingPlan.limits.maxEmbeds ?? 20}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, maxEmbeds: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="20"
                    />
                    <p className="text-xs text-slate-500 mt-1">Custom embeds per server</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Storage (MB)</label>
                    <input
                      type="number"
                      value={editingPlan.limits.storageMb ?? 100}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, storageMb: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="100"
                    />
                    <p className="text-xs text-slate-500 mt-1">Storage limit in megabytes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Daily API Calls</label>
                    <input
                      type="number"
                      value={editingPlan.limits.dailyApiCalls ?? 1000}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, dailyApiCalls: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="1000"
                    />
                    <p className="text-xs text-slate-500 mt-1">API calls per day</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Concurrent Conversations</label>
                    <input
                      type="number"
                      value={editingPlan.limits.concurrentConversations ?? 5}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        limits: { ...editingPlan.limits, concurrentConversations: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="5"
                    />
                    <p className="text-xs text-slate-500 mt-1">Simultaneous AI conversations</p>
                  </div>
                </div>
              </>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Feature Access</h3>
                  <p className="text-sm text-slate-400">Control which features are available in this plan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={editingPlan.restrictions.canUseAI ?? true}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        restrictions: { ...editingPlan.restrictions, canUseAI: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">AI Conversations</div>
                      <div className="text-xs text-slate-400">Chat with Lena AI</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={editingPlan.restrictions.canUseGames ?? true}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        restrictions: { ...editingPlan.restrictions, canUseGames: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">Games</div>
                      <div className="text-xs text-slate-400">Mini-games and entertainment</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={editingPlan.restrictions.canUseModeration ?? false}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        restrictions: { ...editingPlan.restrictions, canUseModeration: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">Moderation Tools</div>
                      <div className="text-xs text-slate-400">Ban, kick, mute commands</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={editingPlan.restrictions.canUseGiveaways ?? false}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        restrictions: { ...editingPlan.restrictions, canUseGiveaways: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">Giveaways</div>
                      <div className="text-xs text-slate-400">Create and manage giveaways</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={editingPlan.restrictions.canUseCustomBots ?? false}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        restrictions: { ...editingPlan.restrictions, canUseCustomBots: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">Custom Bots</div>
                      <div className="text-xs text-slate-400">Create custom bot instances</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={editingPlan.restrictions.canUseWebSearch ?? true}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        restrictions: { ...editingPlan.restrictions, canUseWebSearch: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">Web Search</div>
                      <div className="text-xs text-slate-400">Search the web with citations</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={editingPlan.restrictions.canUseImageAnalysis ?? false}
                      onChange={(e) => setEditingPlan({ 
                        ...editingPlan, 
                        restrictions: { ...editingPlan.restrictions, canUseImageAnalysis: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">Image Analysis</div>
                      <div className="text-xs text-slate-400">Analyze images with GPT-4 Vision</div>
                    </div>
                  </label>
                </div>

                {/* Advanced Access Control */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Advanced Access Control</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Configure specific commands and features. Use "*" for all, or list specific items separated by commas.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Allowed Commands
                      </label>
                      <textarea
                        value={editingPlan.allowedCommands.join(', ')}
                        onChange={(e) => setEditingPlan({ 
                          ...editingPlan, 
                          allowedCommands: e.target.value.split(',').map(cmd => cmd.trim()).filter(Boolean)
                        })}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 h-24 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                        placeholder="* or help, ping, info, etc."
                      />
                      <p className="text-xs text-slate-500 mt-1">Commands users can access with this plan</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Allowed Features
                      </label>
                      <textarea
                        value={editingPlan.allowedFeatures.join(', ')}
                        onChange={(e) => setEditingPlan({ 
                          ...editingPlan, 
                          allowedFeatures: e.target.value.split(',').map(feat => feat.trim()).filter(Boolean)
                        })}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 h-24 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                        placeholder="* or giveaways, custom_bots, etc."
                      />
                      <p className="text-xs text-slate-500 mt-1">Feature modules users can access</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              <FontAwesomeIcon icon={faSave} />
              Save Plan
            </button>
            <button
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
              }}
              className="flex items-center gap-2 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 font-medium"
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Pricing Plans</h1>
          <p className="text-slate-400">Manage subscription plans and configure limits</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create New Plan
        </button>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-blue-400">
                  <FontAwesomeIcon 
                    icon={iconMap[plan.icon] || faGem} 
                    className="h-8 w-8"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        {plan.badge}
                      </span>
                    )}
                    {!plan.isVisible && (
                      <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faEyeSlash} className="h-3 w-3" />
                        Hidden
                      </span>
                    )}
                    {!plan.isActive && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faToggleOff} className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{plan.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-blue-400 font-semibold">
                      ${plan.priceUsd} / {plan.priceVnd.toLocaleString()}đ
                    </span>
                    <span className="text-slate-500">
                      {plan.billingCycle}
                    </span>
                    {plan.limits.maxServers && (
                      <span className="text-green-400">
                        {plan.limits.maxServers === -1 ? '∞' : plan.limits.maxServers} servers
                      </span>
                    )}
                    {plan.limits.maxCustomBots && plan.limits.maxCustomBots > 0 && (
                      <span className="text-purple-400">
                        {plan.limits.maxCustomBots} custom bots
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="p-2 text-blue-400 hover:bg-slate-700 rounded transition"
                  title="Edit"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 text-red-400 hover:bg-slate-700 rounded transition"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 mb-4">No pricing plans yet. Create one to get started!</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Your First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
