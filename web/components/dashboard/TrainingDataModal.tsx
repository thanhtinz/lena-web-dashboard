'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBrain } from '@fortawesome/free-solid-svg-icons';

interface TrainingDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  training?: any;
  onSuccess: () => void;
}

export default function TrainingDataModal({ 
  isOpen, 
  onClose, 
  serverId, 
  training,
  onSuccess 
}: TrainingDataModalProps) {
  const [formData, setFormData] = useState({
    question: training?.question || '',
    answer: training?.answer || '',
    category: training?.category || '',
    isActive: training?.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = `/api/servers/${serverId}/training`;
      const method = training ? 'PATCH' : 'POST';

      const payload = training ? {
        trainingId: training.id,
        ...formData,
      } : {
        ...formData,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save training data');
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
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-purple-900/20 to-pink-900/20 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-3 pr-8">
              <FontAwesomeIcon icon={faBrain} className="text-purple-500" />
              {training ? 'Edit Training Data' : 'Add Training Data'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Teach Lena custom Q&A responses</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Question *
              </label>
              <input
                type="text"
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-600 outline-none"
                placeholder="What is...?"
              />
              <p className="text-xs text-slate-500 mt-1">
                The question users will ask
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Answer *
              </label>
              <textarea
                required
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-600 outline-none"
                placeholder="Lena's answer..."
                rows={5}
              />
              <p className="text-xs text-slate-500 mt-1">
                Lena will respond with this answer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category (Optional)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-600 outline-none"
                placeholder="General, Rules, FAQ, etc."
              />
              <p className="text-xs text-slate-500 mt-1">
                Organize training data by topic
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-slate-900 border-slate-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">
                Active (Lena will use this training data)
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-1.5 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Saving...' : training ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
