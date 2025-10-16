import jwt from 'jsonwebtoken';

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-for-dev';

export interface UserSession {
  id: string;
  username: string;
  avatar: string;
  guilds: Array<{
    id: string;
    name: string;
    icon: string;
    permissions: number;
  }>;
}

export function signSession(data: UserSession): string {
  return jwt.sign(data, SESSION_SECRET, { expiresIn: '7d' });
}

export function verifySession(token: string): UserSession | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export function generateOAuthState(): string {
  const state = jwt.sign({ timestamp: Date.now() }, SESSION_SECRET, { expiresIn: '15m' });
  return state;
}

export function verifyOAuthState(state: string): boolean {
  try {
    jwt.verify(state, SESSION_SECRET);
    return true;
  } catch {
    return false;
  }
}
