import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const count = await prisma.waitlist.count();
  return NextResponse.json({ count });
}
