'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faToggleOff, faCog } from '@fortawesome/free-solid-svg-icons';
import FeatureFlagModal from './FeatureFlagModal';

export default function FeatureFlagsList({ flags }: { flags: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [editingFlag, setEditingFlag] = useState<any | null>(null);

  const toggleFlag = async (flagId: string) => {
    setLoading(flagId);
    try {
      const response = await fetch('/api/admin/feature-flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flagId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle flag');
      }

      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle flag:', error);
      alert('Failed to toggle feature flag. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (flags.length === 0) {
    return (
      <div className="border border-slate-700 rounded-lg p-12 bg-slate-800 text-center">
        <p className="text-slate-400 mb-4">No feature flags created yet</p>
        <p className="text-sm text-slate-500">Click "Create Feature Flag" to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {flags.map((flag) => (
        <div key={flag.id} className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{flag.name}</h3>
                <div className={`h-2 w-2 rounded-full ${flag.enabled ? "bg-green-500" : "bg-red-500"}`} />
              </div>
              {flag.description && (
                <p className="text-sm text-slate-400 mb-3">{flag.description}</p>
              )}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Rollout: </span>
                  <span className="font-medium text-white">{flag.rolloutPercentage || 100}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Updated: </span>
                  <span className="font-medium text-white">
                    {flag.updatedAt ? new Date(flag.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleFlag(flag.id)}
                disabled={loading === flag.id}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  flag.enabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                } disabled:opacity-50`}
              >
                <FontAwesomeIcon icon={flag.enabled ? faToggleOn : faToggleOff} className="h-5 w-5" />
                {loading === flag.id ? 'Updating...' : flag.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button 
                onClick={() => setEditingFlag(flag)}
                className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition text-white"
              >
                <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>

      <FeatureFlagModal 
        isOpen={!!editingFlag} 
        onClose={() => setEditingFlag(null)}
        flag={editingFlag}
      />
    </>
  );
}
