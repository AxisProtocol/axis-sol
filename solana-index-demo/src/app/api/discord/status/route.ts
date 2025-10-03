// app/api/discord/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function decrypt(data: string) {
  const key = crypto.createHash('sha256').update(process.env.DISCORD_SESSION_SECRET!).digest()
  const buf = Buffer.from(data, 'base64')
  const iv = buf.subarray(0, 16)
  const tag = buf.subarray(16, 32)
  const enc = buf.subarray(32)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(enc), decipher.final()])
  return dec.toString('utf8')
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('discord_session')?.value
  if (!cookie) return NextResponse.json({ authenticated: false, isMember: false })

  try {
    const { access_token, expires_at } = JSON.parse(decrypt(cookie))
    if (Date.now() > expires_at) {
      return NextResponse.json({ authenticated: false, isMember: false })
    }

    // ユーザー情報
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!userRes.ok) throw new Error('failed to fetch user')
    const user = await userRes.json()

    // 参加ギルド一覧（要 scope=guilds）
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!guildsRes.ok) throw new Error('failed to fetch guilds')
    const guilds: { id: string }[] = await guildsRes.json()

    const isMember = guilds.some(g => g.id === process.env.DISCORD_GUILD_ID)

    return NextResponse.json({
      authenticated: true,
      isMember,
      username: user.username,
      avatarUrl: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : undefined,
    })
  } catch (e) {
    console.error('discord status error', e)
    return NextResponse.json({ authenticated: false, isMember: false })
  }
}
