'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner,
  faUserTag,
  faPlus,
  faTrash,
  faRotate,
  faBan
} from '@fortawesome/free-solid-svg-icons';

interface AutoRolesConfigData {
  enabled: boolean;
  enableReassign: boolean;
  joinRoleIds: string[];
}

interface BlacklistEntry {
  id: number;
  roleId: string;
  reason?: string;
}

export default function AutoRolesConfig({ serverId }: { serverId: string }) {
  const [config, setConfig] = useState<AutoRolesConfigData>({
    enabled: false,
    enableReassign: false,
    joinRoleIds: []
  });
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [newBlacklistRole, setNewBlacklistRole] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');

  useEffect(() => {
    fetchConfig();
    fetchBlacklist();
  }, [serverId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-roles`);
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

  const fetchBlacklist = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-roles/blacklist`);
      if (res.ok) {
        const data = await res.json();
        setBlacklist(data);
      }
    } catch (error) {
      console.error('Failed to fetch blacklist:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-roles`, {
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

  const addRole = () => {
    if (newRoleId && !config.joinRoleIds.includes(newRoleId)) {
      setConfig({ ...config, joinRoleIds: [...config.joinRoleIds, newRoleId] });
      setNewRoleId('');
    }
  };

  const removeRole = (roleId: string) => {
    setConfig({ ...config, joinRoleIds: config.joinRoleIds.filter(r => r !== roleId) });
  };

  const addBlacklistRole = async () => {
    if (!newBlacklistRole) return;
    
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-roles/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roleId: newBlacklistRole,
          reason: blacklistReason || 'No reason provided'
        }),
      });
      
      if (res.ok) {
        await fetchBlacklist();
        setNewBlacklistRole('');
        setBlacklistReason('');
        setMessage('✅ Role added to blacklist!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to add role to blacklist');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Failed to add role to blacklist');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeBlacklistRole = async (blacklistId: number) => {
    try {
      const res = await fetch(`/api/servers/${serverId}/auto-roles/blacklist/${blacklistId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchBlacklist();
        setMessage('✅ Role removed from blacklist!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to remove role from blacklist');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Failed to remove role from blacklist');
      setTimeout(() => setMessage(''), 3000);
    }
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
              <FontAwesomeIcon icon={faUserTag} className="h-5 w-5 text-blue-500" />
              Auto Roles Status
            </h3>
            <p className="text-sm text-slate-400 mt-1">Enable/disable entire auto role assignment system</p>
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

      {/* Reassign Toggle */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faRotate} className="h-5 w-5 text-green-500" />
              Role Reassignment
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Track and restore member roles when they rejoin the server
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableReassign}
              onChange={(e) => setConfig({ ...config, enableReassign: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      {/* Add Join Role */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5 text-green-500" />
          Add Join Role
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRoleId}
            onChange={(e) => setNewRoleId(e.target.value)}
            placeholder="Enter Role ID"
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={addRole}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Enable Developer Mode in Discord, right-click on role and select "Copy Role ID"
        </p>
      </div>

      {/* Join Role List */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faUserTag} className="h-5 w-5 text-blue-500" />
          Join Roles ({config.joinRoleIds.length})
        </h3>

        {config.joinRoleIds.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No join roles configured yet</p>
        ) : (
          <div className="space-y-2">
            {config.joinRoleIds.map((roleId) => (
              <div key={roleId} className="bg-slate-700/50 p-4 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserTag} className="h-4 w-4 text-slate-400" />
                  <span className="text-white font-medium">{roleId}</span>
                </div>
                <button
                  onClick={() => removeRole(roleId)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Remove role"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blacklist Section */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faBan} className="h-5 w-5 text-red-500" />
          Reassign Blacklist
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Roles in this list will NOT be reassigned when members rejoin
        </p>

        {/* Add to Blacklist */}
        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={newBlacklistRole}
            onChange={(e) => setNewBlacklistRole(e.target.value)}
            placeholder="Enter Role ID"
            className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-red-500 focus:outline-none"
          />
          <input
            type="text"
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-red-500 focus:outline-none"
          />
          <button
            onClick={addBlacklistRole}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
            <span className="hidden sm:inline">Add to Blacklist</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Blacklist Entries */}
        {blacklist.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No blacklisted roles</p>
        ) : (
          <div className="space-y-2">
            {blacklist.map((entry) => (
              <div key={entry.id} className="bg-slate-700/50 p-4 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon icon={faBan} className="h-4 w-4 text-red-400" />
                      <span className="text-white font-medium">{entry.roleId}</span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-slate-400 ml-6">{entry.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeBlacklistRole(entry.id)}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Remove from blacklist"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg">
        <p className="text-blue-300 text-sm">
          <strong>Note:</strong> Bot needs "Manage Roles" permission and bot's role must be higher than the roles to be assigned in the server's role list.
        </p>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={`h-5 w-5 ${saving ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Configuration'}</span>
          <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
}
