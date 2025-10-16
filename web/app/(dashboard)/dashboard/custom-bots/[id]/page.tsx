import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faRobot } from '@fortawesome/free-solid-svg-icons';
import BotManagementView from '@/components/dashboard/BotManagementView';
import { verifySession } from '@/lib/session';

export default async function BotManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/api/auth/discord');
  }

  const user = verifySession(sessionCookie.value);
  
  if (!user) {
    redirect('/api/auth/discord');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/custom-bots" className="text-slate-400 hover:text-white inline-flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to Custom Bots
        </Link>
      </div>

      <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faRobot} className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white">Bot Management</h2>
            <p className="text-sm md:text-base text-slate-400 break-words">Configure và quản lý custom bot của bạn</p>
          </div>
        </div>
      </div>

      <BotManagementView botId={id} />
    </div>
  );
}
