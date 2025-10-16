import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET;

/**
 * Verify user authentication from session cookie
 * Returns user ID if authenticated, null otherwise
 */
export async function verifyUser(request: NextRequest): Promise<string | null> {
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not configured');
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = verify(sessionCookie.value, SESSION_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Get user ID from request, throw error if not authenticated
 */
export async function requireUser(request: NextRequest): Promise<string> {
  const userId = await verifyUser(request);
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  return userId;
}
