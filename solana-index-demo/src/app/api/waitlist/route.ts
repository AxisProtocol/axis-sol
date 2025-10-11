import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEmail } from '@/utils/validation';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '';
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const { email, consentMarketing = false, source } = (body ?? {}) as {
    email?: unknown;
    consentMarketing?: unknown;
    source?: unknown;
  };

  if (typeof email !== 'string') {
    return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
  }

  const { valid, normalized } = validateEmail(email);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
  }

  const ip = getClientIp(request);
  const salt = process.env.IP_HASH_SALT ?? '';
  const ipHash = ip ? crypto.createHash('sha256').update(`${ip}${salt}`).digest('hex') : null;
  const userAgent = request.headers.get('user-agent') || null;

  try {
    await prisma.waitlist.create({
      data: {
        email: normalized,
        consentMarketing: !!consentMarketing,
        ipHash: ipHash ?? undefined,
        userAgent: userAgent ?? undefined,
        source: typeof source === 'string' ? source : undefined,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'ALREADY_EXISTS' }, { status: 409 });
    }
    console.error('waitlist joining error: ', e);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
