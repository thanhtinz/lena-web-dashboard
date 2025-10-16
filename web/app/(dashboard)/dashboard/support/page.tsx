import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLifeRing, faPaperPlane, faComments } from '@fortawesome/free-solid-svg-icons';
import SupportTicketForm from '@/components/dashboard/SupportTicketForm';

export default async function SupportPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  const user = sessionCookie ? verifySession(sessionCookie.value) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <FontAwesomeIcon icon={faLifeRing} className="h-16 w-16 text-blue-400 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-4">Support Center</h1>
        <p className="text-slate-400">
          Need help? Create a support ticket and our team will get back to you soon.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">~2 hours</div>
          <div className="text-sm text-slate-400">Average Response Time</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
          <div className="text-sm text-slate-400">Support Available</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
          <div className="text-sm text-slate-400">Customer Satisfaction</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Create a Support Ticket</h2>
        <SupportTicketForm user={user} />
      </div>

      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <FontAwesomeIcon icon={faComments} className="h-8 w-8 text-blue-400" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Join Our Discord Server</h3>
            <p className="text-slate-300 mb-4">
              Get instant help from our community and support team on Discord!
            </p>
            <a
              href="https://discord.gg/your-server"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Join Discord Server
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
