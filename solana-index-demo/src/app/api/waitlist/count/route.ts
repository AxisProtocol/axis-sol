import { getPrisma, prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  context: { params: Promise<unknown>; cloudflare?: { env?: CloudflareEnv } }
) {
  const { cloudflare } = context;
  const db = cloudflare?.env?.DB ? getPrisma(cloudflare.env.DB) : prisma;
  const count = await db.waitlist.count();
  return NextResponse.json({ count });
}
