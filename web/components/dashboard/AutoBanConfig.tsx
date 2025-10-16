'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faGavel,
  faTrash,
  faCrown,
  faPlus,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import PremiumNotice from './PremiumNotice';

interface AutoBanRule {
  id: number;
  ruleName: string;
  ruleType: string;
  threshold: number;
  banReason: string;
  enabled: boolean;
  isPremium: boolean;
  keywords?: string[];
}

interface NewRuleForm {
  ruleName: string;
  ruleType: string;
  threshold: number;
  banReason: string;
  keywords: string;
}

export default function AutoBanConfig({ serverId }: { serverId: string }) {
  const [rules, setRules] = useState<AutoBanRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRule, setNewRule] = useState<NewRuleForm>({
    ruleName: '',
    ruleType: 'no_avatar',
    threshold: 7,
    banReason: '',
    keywords: ''
  });

  useEffect(() => {
    fetchRules();
  }, [serverId]);

  const fetchRules = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-ban`);
      if (res.status === 403) {
        const data = await res.json();
        if (data.isPremium === false) {
          setIsPremium(false);
        }
      } else if (res.ok) {
        const data = await res.json();
        setRules(data);
        setIsPremium(true);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    setSaving(true);
    try {
      const keywords = newRule.keywords ? newRule.keywords.split(',').map(k => k.trim()).filter(Boolean) : [];
      const res = await fetch(`/api/servers/${serverId}/auto-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          keywords,
          enabled: true
        }),
      });
      if (res.ok) {
        await fetchRules();
        setMessage('✅ Rule created successfully!');
        setShowCreateForm(false);
        setNewRule({
          ruleName: '',
          ruleType: 'no_avatar',
          threshold: 7,
          banReason: '',
          keywords: ''
        });
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.error || 'Failed to create rule'}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create rule');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteRule = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-ban`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchRules();
        setMessage('✅ Rule deleted!');
      } else {
        setMessage('❌ Failed to delete rule');
      }
    } catch (error) {
      setMessage('❌ Failed to delete rule');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const toggleRule = async (id: number, enabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      if (res.ok) {
        await fetchRules();
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      no_avatar: 'No Custom Avatar',
      account_age: 'Account Age Check',
      username_pattern: 'Username Pattern Match',
      invite_username: 'Invite Link in Username'
    };
    return labels[type] || type;
  };

  const getRuleTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      no_avatar: 'Ban users with default Discord avatar',
      account_age: 'Ban accounts younger than specified days',
      username_pattern: 'Ban usernames matching regex patterns',
      invite_username: 'Ban usernames containing Discord invite links'
    };
    return descriptions[type] || '';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    return <PremiumNotice featureName="Auto Ban" serverId={serverId} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <p className="text-yellow-300 text-sm">
          <strong>⚠️ Auto-Ban on Join:</strong> These rules automatically ban users when they join your server if they match the criteria. Be careful with strict rules to avoid false positives.
        </p>
      </div>

      {/* Create New Rule Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={showCreateForm ? faGavel : faPlus} />
          <span className="hidden md:inline">{showCreateForm ? 'Cancel' : 'Create New Rule'}</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-red-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5 text-red-500" />
            Create New Auto Ban Rule
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.ruleName}
                  onChange={(e) => setNewRule({...newRule, ruleName: e.target.value})}
                  placeholder="e.g., No Default Avatar"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rule Type *</label>
                <select
                  value={newRule.ruleType}
                  onChange={(e) => setNewRule({...newRule, ruleType: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="no_avatar">No Custom Avatar</option>
                  <option value="account_age">Account Age Check</option>
                  <option value="username_pattern">Username Pattern Match</option>
                  <option value="invite_username">Invite Link in Username</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">{getRuleTypeDescription(newRule.ruleType)}</p>
              </div>
            </div>

            {newRule.ruleType === 'account_age' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Account Age (days) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({...newRule, threshold: parseInt(e.target.value) || 7})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
                <p className="text-xs text-slate-400 mt-1">Ban accounts created less than this many days ago</p>
              </div>
            )}

            {newRule.ruleType === 'username_pattern' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username Patterns (comma-separated regex) *
                </label>
                <input
                  type="text"
                  value={newRule.keywords}
                  onChange={(e) => setNewRule({...newRule, keywords: e.target.value})}
                  placeholder="e.g., ^bot.*, .*raid.*, .*spam.*"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
                <p className="text-xs text-slate-400 mt-1">Regex patterns to match against usernames (case-insensitive)</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ban Reason</label>
              <input
                type="text"
                value={newRule.banReason}
                onChange={(e) => setNewRule({...newRule, banReason: e.target.value})}
                placeholder="e.g., Suspicious account"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={createRule}
              disabled={saving || (newRule.ruleType === 'username_pattern' && !newRule.keywords)}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={saving ? 'animate-spin' : ''} />
              <span className="hidden md:inline">{saving ? 'Creating...' : 'Create Rule'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faGavel} className="h-5 w-5 text-red-500" />
          Auto Ban Rules ({rules.length})
        </h3>

        {rules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No auto ban rules yet</p>
            <p className="text-sm text-slate-500">Click "Create New Rule" button above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-slate-700/50 p-4 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon icon={faGavel} className="h-4 w-4 text-red-400" />
                      <span className="text-white font-bold">{rule.ruleName || getRuleTypeLabel(rule.ruleType)}</span>
                      <label className="relative inline-flex items-center cursor-pointer ml-auto">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => toggleRule(rule.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Type:</span>{' '}
                        <span className="text-white">{getRuleTypeLabel(rule.ruleType)}</span>
                      </div>
                      {rule.ruleType === 'account_age' && (
                        <div>
                          <span className="text-slate-400">Min Age:</span>{' '}
                          <span className="text-white">{rule.threshold} days</span>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <span className="text-slate-400">Ban Reason:</span>{' '}
                        <span className="text-white">{rule.banReason || 'Violated auto-ban rules'}</span>
                      </div>
                      {rule.keywords && rule.keywords.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-slate-400">Patterns:</span>{' '}
                          <span className="text-white font-mono text-xs">{rule.keywords.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRule(rule.id)}
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
