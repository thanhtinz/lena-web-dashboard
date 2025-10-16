import { verifySession } from './session';

/**
 * Verify that a user has access to a Discord server
 * Returns user data if authorized, null otherwise
 */
export async function requireServerAccess(sessionCookie: string | undefined, serverId: string) {
  if (!sessionCookie) {
    return null;
  }

  const user = verifySession(sessionCookie);
  if (!user) {
    return null;
  }

  // Check if user's guilds include the requested server
  const hasAccess = user.guilds?.some((guild: any) => guild.id === serverId);
  
  if (!hasAccess) {
    return null;
  }

  return user;
}
