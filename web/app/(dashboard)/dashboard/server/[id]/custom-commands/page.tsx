import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTerminal, faCrown } from '@fortawesome/free-solid-svg-icons';
import CustomCommandsConfig from '@/components/dashboard/CustomCommandsConfig';
import { verifySession } from '@/lib/session';

export default async function CustomCommandsPage({ params }: { params: Promise<{ id: string }> }) {
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
          <FontAwesomeIcon icon={faTerminal} className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
          <h1 className="text-lg md:text-2xl font-bold text-white">Custom Commands</h1>
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">
            <FontAwesomeIcon icon={faCrown} className="mr-1" />
            PREMIUM
          </span>
        </div>
        <p className="text-sm md:text-base text-slate-400">
          Create custom commands with dynamic variables
        </p>
      </div>

      <CustomCommandsConfig serverId={id} />
    </div>
  );
}
