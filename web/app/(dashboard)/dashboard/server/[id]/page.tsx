import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faServer } from '@fortawesome/free-solid-svg-icons';
import ServerConfig from '@/components/dashboard/ServerConfig';
import { verifySession } from '@/lib/session';

export default async function ServerConfigPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-white inline-flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
        <div className="flex items-center gap-4">
          {guild.icon ? (
            <img 
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
              alt={guild.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faServer} className="h-8 w-8 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{guild.name}</h2>
            <p className="text-slate-400">ID: {guild.id}</p>
          </div>
        </div>
      </div>

      <ServerConfig serverId={guild.id} />
    </div>
  );
}
