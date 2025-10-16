'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function QuickCleanup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCleanup = async () => {
    if (!confirm('This will delete old conversation history (7+ days), expired giveaways (30+ days), and old admin logs (90+ days). Continue?')) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/database/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cleanup');
      }

      setResult(data);
    } catch (error: any) {
      alert('Failed to cleanup database: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <FontAwesomeIcon icon={faRotateRight} className="h-5 w-5 text-blue-400" />
        <h3 className="font-semibold text-white">Quick Cleanup</h3>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Clean up old conversation history (7+ days), expired giveaways (30+ days), and old admin logs (90+ days)
      </p>
      <button
        onClick={handleCleanup}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            Cleaning...
          </>
        ) : (
          'Run Cleanup'
        )}
      </button>

      {result && (
        <div className="mt-4 bg-green-900/20 border border-green-700/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-400 mb-2 text-sm">Cleanup Results</h4>
          <div className="text-xs text-slate-300 space-y-1">
            <div>Conversations deleted: {result.stats?.conversationsDeleted || 0}</div>
            <div>Giveaways deleted: {result.stats?.giveawaysDeleted || 0}</div>
            <div>Logs deleted: {result.stats?.logsDeleted || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
