import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthState } from '@/lib/session';

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : 'http://localhost:5000';
  const redirectUri = `${baseUrl}/api/auth/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Discord not configured' }, { status: 500 });
  }

  const state = generateOAuthState();
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify+guilds&state=${state}`;

  const response = NextResponse.redirect(discordAuthUrl);
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
