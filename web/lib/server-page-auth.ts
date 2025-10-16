import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireServerAccess } from './server-auth';

/**
 * Server-side page guard for dashboard pages
 * Verifies user has access to the server and redirects if not
 */
export async function requireServerAccessOrRedirect(serverId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  const user = await requireServerAccess(sessionCookie?.value, serverId);
  
  if (!user) {
    redirect('/dashboard?error=unauthorized');
  }

  return user;
}
