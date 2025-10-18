// app/api/discord/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function decrypt(b64: string) {
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.subarray(0, 16);
  const tag = buf.subarray(16, 32);
  const enc = buf.subarray(32);
  const key = crypto.createHash('sha256').update(process.env.DISCORD_SESSION_SECRET!).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString('utf8');
}

export async function GET(req: NextRequest) {
  const raw = req.cookies.get('discord_session')?.value;
  if (!raw) return NextResponse.json({ ok: true, authenticated: false });

  let access_token = '';
  try {
    const json = JSON.parse(decrypt(raw));
    if (!json?.access_token || Date.now() > json.expires_at) {
      return NextResponse.json({ ok: true, authenticated: false });
    }
    access_token = json.access_token as string;
  } catch {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  const meRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: 'no-store',
  });
  if (!meRes.ok) return NextResponse.json({ ok: true, authenticated: false });

  const me = await meRes.json();

  const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: 'no-store',
  });
  if (!guildsRes.ok) return NextResponse.json({ ok: true, authenticated: false, user: me });

  const guilds = await guildsRes.json() as Array<{ id: string; name: string }>;
  const target = process.env.DISCORD_TARGET_GUILD_ID!;
  const isMember = guilds.some((g) => g.id === target);

  return NextResponse.json({ ok: true, authenticated: true, isMember, user: me });
}
