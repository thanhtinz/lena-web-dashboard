import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * ⚠️ CRITICAL SECURITY WARNING: PLACEHOLDER ADMIN AUTH - NOT PRODUCTION READY ⚠️
 * 
 * CURRENT SEVERE LIMITATIONS:
 * - Does NOT verify Discord OAuth sessions
 * - Does NOT check actual user roles/permissions in Discord
 * - Only validates JWT signature and checks against ADMIN_USER_IDS
 * - NO session binding, rotation, or expiration checks beyond JWT exp
 * - Anyone with SESSION_SECRET can mint valid admin JWTs
 * - Compromise of SESSION_SECRET = full admin panel access
 * 
 * MANDATORY PRODUCTION REQUIREMENTS:
 * 1. Replace with NextAuth Discord OAuth integration
 * 2. Verify active Discord session and check user's admin role
 * 3. Implement session rotation and binding to IP/device
 * 4. Add audit logging for all admin actions
 * 5. Implement rate limiting and suspicious activity detection
 * 6. Use separate admin secret, not shared SESSION_SECRET
 * 
 * DO NOT DEPLOY THIS TO PRODUCTION WITHOUT PROPER AUTH IMPLEMENTATION
 * 
 * @param req - Next.js request object
 * @returns true if admin, false otherwise
 */
export async function verifyAdminAuth(req: NextRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.substring(7);
    
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      console.error('SESSION_SECRET not configured');
      return false;
    }
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, sessionSecret);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return false;
    }
    
    if (!decoded.userId) {
      return false;
    }
    
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    return adminIds.includes(decoded.userId);
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return false;
  }
}

/**
 * Middleware to protect admin-only routes
 */
export function requireAdmin(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    const isAdmin = await verifyAdminAuth(req);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return handler(req, ...args);
  };
}
