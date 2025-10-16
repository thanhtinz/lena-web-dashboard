import { db } from '@/lib/db';
import { supportTickets } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import SupportTicketsList from '@/components/admin/SupportTicketsList';
import InfoBox from '@/components/admin/InfoBox';

export default async function AdminTicketsPage() {
  const tickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    total: tickets.length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
        <p className="text-slate-400">
          Manage and respond to user support requests
        </p>
      </div>

      <div className="space-y-6">
        <InfoBox type="info" title="🎫 Support Tickets Guide">
          <p className="mb-2">Manage user support requests efficiently:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>View Tickets</strong> - See all support requests with priority and status</li>
            <li><strong>Reply to Users</strong> - Respond directly via Discord DM or ticket system</li>
            <li><strong>Update Status</strong> - Mark tickets as Open, In Progress, or Closed</li>
            <li><strong>Priority Levels</strong> - Low, Medium, High, Urgent for quick triage</li>
            <li><strong>Auto-Assignment</strong> - Tickets auto-assign when you reply</li>
          </ul>
        </InfoBox>

        <InfoBox type="tip" title="💡 Support Best Practices">
          <ul className="list-disc list-inside space-y-1">
            <li>Respond to Urgent tickets within 1 hour</li>
            <li>Update ticket status as you work on them</li>
            <li>Use professional and friendly language in replies</li>
            <li>Close tickets after confirming issue resolution</li>
          </ul>
        </InfoBox>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400 mb-2">Open Tickets</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.open}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400 mb-2">Closed Tickets</div>
            <div className="text-3xl font-bold text-green-400">{stats.closed}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400 mb-2">Total Tickets</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
        </div>

        <SupportTicketsList tickets={tickets} />
      </div>
    </div>
  );
}
