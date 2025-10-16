'use client';

import { useState } from 'react';

export default function TicketStatusUpdater({ 
  ticketId, 
  currentStatus 
}: { 
  ticketId: string; 
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusColors = {
    open: 'bg-yellow-600 text-white',
    in_progress: 'bg-blue-600 text-white',
    closed: 'bg-green-600 text-white',
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    
    setIsUpdating(true);
    try {
      await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      className={`px-3 py-1 rounded text-sm font-medium disabled:opacity-50 ${statusColors[status as keyof typeof statusColors] || 'bg-slate-600'}`}
    >
      <option value="open">Open</option>
      <option value="in_progress">In Progress</option>
      <option value="closed">Closed</option>
    </select>
  );
}
