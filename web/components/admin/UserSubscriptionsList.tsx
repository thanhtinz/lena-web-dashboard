'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SubscriptionModal from './SubscriptionModal';

export default function UserSubscriptionsList({ subscriptions }: { subscriptions: any[] }) {
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [deletingSub, setDeletingSub] = useState<string | null>(null);
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    setDeletingSub(id);
    try {
      const response = await fetch(`/api/admin/subscriptions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subscription');
      
      window.location.reload();
    } catch (error) {
      alert('Failed to delete subscription');
    } finally {
      setDeletingSub(null);
    }
  };

  if (subscriptions.length === 0) {
    return (
      <div className="border border-slate-700 rounded-lg p-12 bg-slate-800 text-center">
        <p className="text-slate-400 mb-4">No subscriptions yet</p>
        <p className="text-sm text-slate-500">Users will appear here when they subscribe</p>
      </div>
    );
  }

  const statusColors = {
    active: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    expired: 'text-slate-400 bg-slate-400/10',
  };

  return (
    <>
      <div className="border border-slate-700 rounded-lg bg-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">User</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Plan</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Started</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Ends</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-700/50 transition">
                <td className="px-6 py-4 text-sm text-white">
                  User {sub.userId}
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  {sub.planId || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[sub.status as keyof typeof statusColors] || 'text-slate-400'}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {sub.startsAt ? new Date(sub.startsAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingSub(sub)}
                      className="px-3 py-1 border border-blue-600 text-blue-400 rounded hover:bg-blue-600/10 transition text-sm"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      disabled={deletingSub === sub.id}
                      className="px-3 py-1 border border-red-600 text-red-400 rounded hover:bg-red-600/10 transition text-sm disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <SubscriptionModal 
      isOpen={!!editingSub} 
      onClose={() => setEditingSub(null)}
      subscription={editingSub}
    />
    </>
  );
}
