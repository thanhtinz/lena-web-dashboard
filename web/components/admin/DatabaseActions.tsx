"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export function ResetAllButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/database/reset-all', {
        method: 'POST',
      });
      if (res.ok) {
        alert('Database reset successfully!');
        setShowConfirm(false);
      } else {
        alert('Error resetting database');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button 
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-medium"
        onClick={() => setShowConfirm(true)}
      >
        <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
        Reset All Database
      </button>
    );
  }

  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-red-900 text-sm">Confirm reset entire database?</h4>
          <p className="text-red-700 text-xs mt-1">This action cannot be undone!</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          disabled={loading}
          className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="border border-slate-300 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ResetServerButton() {
  const [serverId, setServerId] = useState("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const tables = [
    { label: 'Conversation History', value: 'conversation' },
    { label: 'Giveaways', value: 'giveaway' },
    { label: 'Confessions', value: 'confession' },
    { label: 'Custom Responses', value: 'responses' },
    { label: 'Server Config', value: 'config' },
    { label: 'Warnings', value: 'warnings' },
  ];

  const handleReset = async () => {
    if (!serverId || selectedTables.length === 0) {
      alert('Please select server and at least 1 data type');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/database/reset-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, tables: selectedTables }),
      });
      if (res.ok) {
        alert('Server data reset successfully!');
        setServerId("");
        setSelectedTables([]);
      } else {
        alert('Error resetting server data');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Select Server</label>
        <input
          type="text"
          placeholder="Enter Server ID"
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select data types to reset</label>
        <div className="space-y-2">
          {tables.map(item => (
            <label key={item.value} className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded"
                checked={selectedTables.includes(item.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTables([...selectedTables, item.value]);
                  } else {
                    setSelectedTables(selectedTables.filter(t => t !== item.value));
                  }
                }}
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50"
        onClick={handleReset}
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Reset Server Data'}
      </button>
    </div>
  );
}
