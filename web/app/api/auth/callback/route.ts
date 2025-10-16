import { NextRequest, NextResponse } from 'next/server';
import { verifyOAuthState, signSession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  if (!storedState || storedState.value !== state || !verifyOAuthState(state)) {
    return NextResponse.redirect(new URL('/?error=csrf_detected', request.url));
  }

  try {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
    
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${baseUrl}/api/auth/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    console.log('Token response:', tokens);

    if (!tokens.access_token) {
      console.error('Token error:', tokens);
      return NextResponse.redirect(new URL('/?error=token_failed', request.url));
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const user = await userResponse.json();

    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const guilds = await guildsResponse.json();

    console.log('User:', user.username, 'ID:', user.id);
    console.log('Guilds with admin:', guilds.filter((g: any) => (g.permissions & 0x8) === 0x8).length);

    const sessionData = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      guilds: guilds.filter((g: any) => (g.permissions & 0x8) === 0x8)
    };

    const signedToken = signSession(sessionData);

    console.log('Redirecting to /dashboard...');
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    response.cookies.delete('oauth_state');
    
    response.cookies.set('session', signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
