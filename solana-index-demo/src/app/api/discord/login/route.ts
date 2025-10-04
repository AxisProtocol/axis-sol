import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI!);
  const scope = encodeURIComponent('identify guilds');
  const state = crypto.randomUUID();

  const url =
    `https://discord.com/api/oauth2/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scope}` +
    `&state=${state}`;

  const res = NextResponse.redirect(url);

  res.cookies.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',     // 必要なら 'none' に（HTTPS 必須）
    maxAge: 300,
    path: '/',
    domain: '.axis-protocol.xyz',  // ★ これを付ける
  });

  return res;
}