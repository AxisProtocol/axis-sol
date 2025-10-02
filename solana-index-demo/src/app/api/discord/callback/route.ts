// app/api/discord/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function encrypt(data: string) {
  const key = crypto.createHash('sha256').update(process.env.DISCORD_SESSION_SECRET!).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const stored = req.cookies.get('discord_oauth_state')?.value;

  if (!code || !state || !stored || state !== stored) {
    return new NextResponse('Invalid OAuth state', { status: 400 });
  }

  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
  });

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return new NextResponse(`Token exchange failed: ${txt}`, { status: 400 });
  }

  const tokenJson = await tokenRes.json() as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  };

  // ここでは access_token を暗号化して Cookie に保存（簡易）
  const sessionPayload = {
    access_token: tokenJson.access_token,
    expires_at: Date.now() + tokenJson.expires_in * 1000,
  };
  const cookieValue = encrypt(JSON.stringify(sessionPayload));

  // ここを修正
  const res = NextResponse.redirect(new URL('/dashboard?claim=1', req.url))

  res.cookies.set('discord_session', cookieValue, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: tokenJson.expires_in, path: '/',
  });
  // state クッキーは不要になったので削除
  res.cookies.set('discord_oauth_state', '', { maxAge: 0, path: '/' });
  return res;
}
