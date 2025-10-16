import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import TempRolesConfig from '@/components/dashboard/TempRolesConfig';
import { verifySession } from '@/lib/session';

export default async function TempRolesPage({ params }: { params: Promise<{ id: string }> }) {
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

  const guild = user.guilds?.find((g: any) => g.id === id);

  if (!guild) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <FontAwesomeIcon icon={faClock} className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
          <h1 className="text-lg md:text-2xl font-bold text-white">Temporary Roles</h1>
        </div>
        <p className="text-sm md:text-base text-slate-400">
          Manage temporary role assignments for moderation purposes
        </p>
      </div>

      <TempRolesConfig serverId={id} />
    </div>
  );
}
