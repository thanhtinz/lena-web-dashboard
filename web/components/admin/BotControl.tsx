'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faStop, 
  faRotateRight, 
  faCircle,
  faRobot,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface BotStatus {
  status: 'online' | 'offline' | 'restarting' | 'unknown';
  uptime?: string;
  processInfo?: string;
  timestamp?: string;
}

export default function BotControl() {
  const [botStatus, setBotStatus] = useState<BotStatus>({ status: 'unknown' });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bot-control');
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: 'restart' | 'stop') => {
    if (!confirm(`Are you sure you want to ${action === 'restart' ? 'restart' : 'stop'} the bot?`)) {
      return;
    }

    setActionLoading(action);
    try {
      const res = await fetch('/api/admin/bot-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(data.message || 'Success!');
        
        // Wait a bit then refresh status
        setTimeout(() => {
          fetchStatus();
        }, action === 'restart' ? 3000 : 1000);
      } else {
        alert(data.message || data.error || 'An error occurred!');
        // Refresh status even on error to show current state
        setTimeout(() => {
          fetchStatus();
        }, 1000);
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Could not perform action!');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = () => {
    switch (botStatus.status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'restarting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (botStatus.status) {
      case 'online': return 'Online';
      case 'offline': return 'Stopped';
      case 'restarting': return 'Restarting...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faRobot} className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Bot Control</h3>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="text-slate-400 hover:text-white transition p-2"
          title="Refresh"
        >
          <FontAwesomeIcon 
            icon={faRotateRight} 
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      {/* Status Display */}
      <div className="bg-slate-900 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <FontAwesomeIcon 
            icon={faCircle} 
            className={`h-3 w-3 ${getStatusColor()} ${botStatus.status === 'online' ? 'animate-pulse' : ''}`} 
          />
          <span className="text-white font-medium">
            Status: <span className={getStatusColor()}>{getStatusText()}</span>
          </span>
        </div>
        
        {botStatus.uptime && (
          <div className="text-sm text-slate-400">
            <span className="font-medium">Uptime:</span> {botStatus.uptime}
          </div>
        )}
        
        {botStatus.processInfo && (
          <div className="text-sm text-slate-400 mt-1">
            {botStatus.processInfo}
          </div>
        )}
        
        <div className="text-xs text-slate-500 mt-2">
          Updated: {botStatus.timestamp ? new Date(botStatus.timestamp).toLocaleString('en-US') : 'N/A'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction('restart')}
          disabled={actionLoading !== null}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 font-medium"
        >
          {actionLoading === 'restart' ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
              Restarting...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4" />
              Restart Bot
            </>
          )}
        </button>

        <button
          onClick={() => handleAction('stop')}
          disabled={actionLoading !== null || botStatus.status === 'offline'}
          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 font-medium"
        >
          {actionLoading === 'stop' ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
              Stopping...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faStop} className="h-4 w-4" />
              Stop Bot
            </>
          )}
        </button>
      </div>

      {/* Important Notes */}
      <div className="mt-4 space-y-2">
        <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <p className="text-xs text-blue-400">
            ℹ️ <strong>How it works:</strong> Bot control uses Replit's "Discord Bot" workflow. Restart may take 30-60s if installing dependencies.
          </p>
        </div>
        <div className="p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <p className="text-xs text-yellow-400">
            ⚠️ <strong>Stop Note:</strong> Bot process will stop but workflow will automatically restart after a few seconds. To fully stop, disable the "Discord Bot" workflow in Replit.
          </p>
        </div>
      </div>
    </div>
  );
}
