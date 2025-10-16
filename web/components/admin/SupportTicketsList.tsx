'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';

export default function SupportTicketsList({ tickets }: { tickets: any[] }) {
  if (tickets.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <p className="text-slate-400 mb-2">No support tickets yet</p>
        <p className="text-sm text-slate-500">Tickets will appear here when users submit them</p>
      </div>
    );
  }

  const priorityColors = {
    low: 'text-slate-400 bg-slate-400/10',
    medium: 'text-blue-400 bg-blue-400/10',
    high: 'text-orange-400 bg-orange-400/10',
    urgent: 'text-red-400 bg-red-400/10',
  };

  const statusColors = {
    open: 'text-yellow-400 bg-yellow-400/10',
    closed: 'text-green-400 bg-green-400/10',
    in_progress: 'text-blue-400 bg-blue-400/10',
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">ID</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">User</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Subject</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Category</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Priority</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-white">Created</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-700/50 transition">
                <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                  {ticket.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  {ticket.username || `User ${ticket.userId.slice(0, 6)}`}
                </td>
                <td className="px-6 py-4 text-sm text-white max-w-xs truncate">
                  {ticket.subject}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                    {ticket.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[ticket.status as keyof typeof statusColors] || 'text-slate-400'}`}>
                    {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                  >
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
