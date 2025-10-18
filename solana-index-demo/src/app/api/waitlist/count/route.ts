import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrisma, prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  let db;
  try {
    const { env } = getCloudflareContext();
    db = env.DB ? getPrisma(env.DB) : prisma;
  } catch {
    // Fallback to local prisma if getCloudflareContext fails (e.g., in dev)
    db = prisma;
  }

  const count = await db.waitlist.count();
  return NextResponse.json({ count });
}
