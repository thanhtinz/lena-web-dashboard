'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPlus, faTrash, faCalendarAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

interface TempRole {
  id: number;
  userId: string;
  roleId: string;
  expiresAt: Date;
  reason: string;
  addedBy: string;
}

interface TempRolesConfigProps {
  serverId: string;
}

export default function TempRolesConfig({ serverId }: TempRolesConfigProps) {
  const [tempRoles, setTempRoles] = useState<TempRole[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [duration, setDuration] = useState('1h');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [serverId]);

  const fetchAll = async () => {
    await Promise.all([
      fetchTempRoles(),
      fetchRoles()
    ]);
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchTempRoles = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/temp-roles`);
      if (res.ok) {
        const data = await res.json();
        setTempRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch temp roles:', error);
    }
  };

  const handleAddTempRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/servers/${serverId}/temp-roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roleId: selectedRole,
          duration,
          reason
        })
      });

      if (res.ok) {
        await fetchTempRoles();
        setShowAddModal(false);
        setUserId('');
        setSelectedRole('');
        setDuration('1h');
        setReason('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add temp role');
      }
    } catch (error) {
      console.error('Failed to add temp role:', error);
      alert('Failed to add temp role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTempRole = async (id: number) => {
    if (!confirm('Remove this temporary role?')) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/temp-roles/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchTempRoles();
      } else {
        alert('Failed to remove temp role');
      }
    } catch (error) {
      console.error('Failed to remove temp role:', error);
      alert('Failed to remove temp role');
    }
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faClock} className="text-orange-400 text-xl" />
          <h2 className="text-xl font-semibold text-white">Temporary Roles</h2>
        </div>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faClock} className="text-orange-400 text-xl" />
            <h2 className="text-xl font-semibold text-white">Temporary Roles</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden md:inline">Add Temp Role</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Temporary role assignments for moderation purposes (auto-expire)
        </p>

        {tempRoles.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FontAwesomeIcon icon={faClock} className="text-4xl mb-3 opacity-50" />
            <p>No active temporary roles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tempRoles.map((tr) => {
              const role = roles.find(r => r.id === tr.roleId);
              
              return (
                <div key={tr.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-medium">
                        User ID: {tr.userId}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{ backgroundColor: role?.color || '#99aab5', color: '#fff' }}
                      >
                        {role?.name || 'Unknown Role'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        Expires {formatTimeRemaining(tr.expiresAt)}
                      </div>
                      {tr.reason && (
                        <span className="italic">• {tr.reason}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveTempRole(tr.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Remove temp role"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add Temporary Role</h3>
            
            <form onSubmit={handleAddTempRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Discord User ID"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Right-click a user → Copy ID (Developer Mode required)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="30m">30 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="2h">2 hours</option>
                  <option value="6h">6 hours</option>
                  <option value="12h">12 hours</option>
                  <option value="1d">1 day</option>
                  <option value="2d">2 days</option>
                  <option value="3d">3 days</option>
                  <option value="1w">1 week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Moderation reason..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span className="hidden md:inline">Cancel</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span className="hidden md:inline">{submitting ? 'Adding...' : 'Add Temp Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
