import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faCog, faPlus } from '@fortawesome/free-solid-svg-icons';
import { verifySession } from '@/lib/session';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/api/auth/discord');
  }

  const user = verifySession(sessionCookie.value);
  
  if (!user) {
    redirect('/api/auth/discord');
  }

  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=1099780063239&scope=bot%20applications.commands`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Your Servers</h2>
        <Link 
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-flex items-center gap-2 text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
          Invite Bot
        </Link>
      </div>
      
      {user.guilds && user.guilds.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.guilds.map((guild: any) => (
            <div key={guild.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-600 transition">
              <div className="flex items-center gap-4 mb-4">
                {guild.icon ? (
                  <img 
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                    alt={guild.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faServer} className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-white">{guild.name}</h3>
                  <p className="text-xs text-slate-400">ID: {guild.id}</p>
                </div>
              </div>
              <Link 
                href={`/dashboard/server/${guild.id}`}
                className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
              >
                <FontAwesomeIcon icon={faCog} className="h-4 w-4 mr-2" />
                Configure
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 p-12 rounded-lg border border-slate-700 text-center">
          <FontAwesomeIcon icon={faServer} className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-slate-400 mb-4">You don't have any servers where you can manage the bot.</p>
          <p className="text-sm text-slate-500 mb-6">You need Administrator permissions in a server to configure Lena Bot.</p>
          <Link 
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            Invite Bot to Your Server
          </Link>
        </div>
      )}
    </div>
  );
}
