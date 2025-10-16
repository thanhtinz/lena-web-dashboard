'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function TicketReplyForm({ 
  ticketId, 
  userId 
}: { 
  ticketId: string; 
  userId: string;
}) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setMessage('');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your Response *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"
          rows={6}
          placeholder="Type your response to the user..."
          required
        />
        <p className="text-xs text-slate-500 mt-2">
          This message will be sent to the user via their Discord DMs (if bot has DM access)
        </p>
      </div>

      {submitStatus === 'success' && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
          <p className="text-green-400 text-sm">
            ✓ Reply sent successfully! The user will be notified.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            ✗ Failed to send reply. Please try again.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !message.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
        {isSubmitting ? 'Sending...' : 'Send Reply'}
      </button>
    </form>
  );
}
