'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface CustomResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  response?: any;
  onSuccess: () => void;
}

export default function CustomResponseModal({ 
  isOpen, 
  onClose, 
  serverId, 
  response,
  onSuccess 
}: CustomResponseModalProps) {
  const [formData, setFormData] = useState({
    trigger: response?.trigger || '',
    response: response?.response || '',
    embedName: response?.embedName || '',
    isExactMatch: response?.isExactMatch || false,
    priority: response?.priority || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = `/api/servers/${serverId}/responses`;
      const method = response ? 'PATCH' : 'POST';

      const payload = response ? {
        responseId: response.id,
        ...formData,
      } : {
        ...formData,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save auto-response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header with gradient */}
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
            <h2 className="text-xl font-bold text-white pr-8">
              {response ? 'Edit Auto-Response' : 'Add Auto-Response'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Configure automatic bot responses</p>
          </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trigger Keyword/Phrase *
            </label>
            <input
              type="text"
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-600 outline-none"
              placeholder="hello, bye, thanks..."
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              The word or phrase that will trigger this response
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Response Message *
            </label>
            <textarea
              value={formData.response}
              onChange={(e) => setFormData({ ...formData, response: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-600 outline-none"
              rows={4}
              placeholder="The message the bot will send..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Embed Name (Optional)
              </label>
              <input
                type="text"
                value={formData.embedName}
                onChange={(e) => setFormData({ ...formData, embedName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-600 outline-none"
                placeholder="welcome_embed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Name of a custom embed (if configured)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-600 outline-none"
                min="0"
                max="100"
              />
              <p className="text-xs text-slate-500 mt-1">
                Higher = triggers first (0-100)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="exactMatch"
              checked={formData.isExactMatch}
              onChange={(e) => setFormData({ ...formData, isExactMatch: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="exactMatch" className="text-sm text-slate-300">
              Require exact match (case-insensitive)
            </label>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : response ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}
