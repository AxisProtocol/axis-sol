import { POST } from './route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    waitlist: {
      create: jest.fn(),
    },
  },
}));

const json = (data: any) => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });

test('returns 201 and ok:true for valid email', async () => {
  (prisma.waitlist.create as jest.Mock).mockResolvedValueOnce({ id: 'abc123' });

  const body = { email: 'test@example.com', consentMarketing: true, source: 'hero' };
  const req = new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'jest', 'x-forwarded-for': '1.2.3.4' },
    body: JSON.stringify(body),
  });

  const res = await POST(req);
  const json = await res.json();

  expect(res.status).toBe(201);
  expect(json).toEqual({ ok: true });
  expect(prisma.waitlist.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        email: 'test@example.com',
        consentMarketing: true,
        source: 'hero',
      }),
    }),
  );
});

test('returns 409 for duplicate email (P2002)', async () => {
  (prisma.waitlist.create as jest.Mock).mockRejectedValueOnce({ code: 'P2002' });

  const req = new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' }),
  });

  const res = await POST(req);
  const json = await res.json();

  expect(res.status).toBe(409);
  expect(json).toEqual({ ok: false, error: 'ALREADY_EXISTS' });
});


test('returns 400 for invalid email', async () => {
  const req = new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });

  const res = await POST(req);
  const json = await res.json();

  expect(res.status).toBe(400);
  expect(json).toEqual({ ok: false, error: 'INVALID_EMAIL' });
});

