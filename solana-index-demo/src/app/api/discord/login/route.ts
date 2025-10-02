// app/api/discord/login/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto'

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI!);
  // identify + guilds でユーザーの所属ギルド一覧を取得
  const scope = encodeURIComponent('identify guilds');
  const state = crypto.randomUUID(); // CSRF 対策（今回は簡易）

  const url =
    `https://discord.com/api/oauth2/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scope}` +
    `&state=${state}`;

  // 状態を一時Cookieに保存（有効期限短め）
  const res = NextResponse.redirect(url);
  res.cookies.set('discord_oauth_state', state, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 300, path: '/',
  });
  return res;
}
