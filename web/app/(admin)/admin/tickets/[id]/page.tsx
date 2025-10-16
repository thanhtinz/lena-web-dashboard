import { db } from '@/lib/db';
import { supportTickets } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faClock, faTag } from '@fortawesome/free-solid-svg-icons';
import TicketReplyForm from '@/components/admin/TicketReplyForm';
import TicketStatusUpdater from '@/components/admin/TicketStatusUpdater';

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await db.select().from(supportTickets).where(eq(supportTickets.id, params.id)).limit(1);

  if (!ticket || ticket.length === 0) {
    notFound();
  }

  const ticketData = ticket[0];

  const priorityColors = {
    low: 'text-slate-400 bg-slate-400/10',
    medium: 'text-blue-400 bg-blue-400/10',
    high: 'text-orange-400 bg-orange-400/10',
    urgent: 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/tickets" className="text-slate-400 hover:text-white inline-flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to Tickets
        </Link>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{ticketData.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                {ticketData.username || `User ${ticketData.userId.slice(0, 8)}`}
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
                {ticketData.createdAt ? new Date(ticketData.createdAt).toLocaleString() : 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} className="h-4 w-4" />
                {ticketData.category}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded ${priorityColors[ticketData.priority as keyof typeof priorityColors]}`}>
              {ticketData.priority}
            </span>
            <TicketStatusUpdater ticketId={ticketData.id} currentStatus={ticketData.status || 'open'} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Message</h3>
          <p className="text-white whitespace-pre-wrap">{ticketData.message}</p>
        </div>

        <div className="bg-slate-900 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Ticket Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Ticket ID:</span>
              <span className="text-white ml-2 font-mono">{ticketData.id}</span>
            </div>
            <div>
              <span className="text-slate-500">User ID:</span>
              <span className="text-white ml-2 font-mono">{ticketData.userId}</span>
            </div>
            <div>
              <span className="text-slate-500">Assigned To:</span>
              <span className="text-white ml-2">{ticketData.assignedTo || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-slate-500">Last Updated:</span>
              <span className="text-white ml-2">
                {ticketData.updatedAt ? new Date(ticketData.updatedAt).toLocaleString() : ticketData.createdAt ? new Date(ticketData.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-xl font-bold text-white mb-6">Reply to User</h2>
        <TicketReplyForm ticketId={ticketData.id} userId={ticketData.userId} />
      </div>
    </div>
  );
}
