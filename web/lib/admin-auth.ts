import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * Verify admin authentication from session cookie
 * Throws error if SESSION_SECRET is not configured
 * Returns admin user ID if authenticated, null otherwise
 */
export async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const SESSION_SECRET = process.env.SESSION_SECRET;
  
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not configured');
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = verify(sessionCookie.value, SESSION_SECRET) as { id: string };
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    
    if (!adminUserIds.includes(decoded.id)) {
      return null;
    }
    
    return decoded.id;
  } catch {
    return null;
  }
}
