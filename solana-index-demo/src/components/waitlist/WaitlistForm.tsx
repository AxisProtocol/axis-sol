// components/waitlist/WaitlistForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { validateEmail } from '@/utils/validation';

type Status = 'idle' | 'loading' | 'success' | 'exists' | 'error';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.axis-protocol.xyz/api/waitlist/count')
      .then(r => r.json())
      .then((d: { count?: number }) => setCount(d.count ?? null))
      .catch(() => setCount(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    const { valid, normalized } = validateEmail(email);
    if (!valid) {
      setError('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('https://api.axis-protocol.xyz/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalized,
          consentMarketing: consent,
          source: 'hero',
        }),
      });

      if (res.status === 201) {
        setStatus('success');
        setEmail('');
        setConsent(false);

        fetch('https://api.axis-protocol.xyz/api/waitlist/count')
          .then(r => r.json())
          .then((d: { count?: number }) => setCount(d.count ?? null))
          .catch(() => {});
        return;
      }

      if (res.status === 409) {
        setStatus('exists');
        return;
      }

      const data = await res.json().catch(
        () => ({}) as { error?: string }
      );

      setError(
        data?.error === 'INVALID_EMAIL'
          ? 'Invalid email address.'
          : 'Something went wrong. Please try again.'
      );
      setStatus('error');
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    } finally {
      setStatus(prev => (prev === 'loading' ? 'idle' : prev));
    }
  }

  const isLoading = status === 'loading';

  return (
    <div
      className="
        w-full max-w-[720px]    /* ← 横長に */
        rounded-3xl border border-white/15
        bg-black/10
        backdrop-blur-xl
        px-5 py-5 md:px-6 md:py-6
      "
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[1.05rem] md:text-[1.15rem] font-semibold leading-tight">
            Join the waitlist
          </h2>
          {count !== null && (
            <p className="mt-1 text-xs md:text-sm text-white/65">
              {count.toLocaleString()} people have already joined
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="block text-[0.85rem] md:text-[0.9rem] text-white/80">
            Email address
          </span>
          <div className="mt-2 relative">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`
                w-full rounded-xl
                bg-white/7
                border ${error ? 'border-red-500/70' : 'border-white/18'}
                text-white placeholder-white/45
                px-4 py-3.5 pr-28
                text-[0.9rem] md:text-[0.95rem]
                outline-none focus:border-white/80 focus:ring-4 focus:ring-white/12
                transition
              `}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="
                absolute right-1.5 top-1/2 -translate-y-1/2
                rounded-lg px-4 md:px-5 h-[40px] md:h-[42px]
                text-[0.85rem] md:text-[0.9rem]
                bg-white text-black
                hover:bg-[#f6f6f6]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
                shadow-[0_10px_30px_-12px_rgba(255,255,255,0.6)]
              "
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {isLoading ? 'Sending…' : 'Join'}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-3 text-[0.85rem] md:text-[0.9rem] text-white/75">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="
              h-4 w-4 rounded
              border-white/35 bg-white/10
              text-white focus:ring-white/30
            "
          />
          Receive occasional product updates
        </label>

        <div className="min-h-[1.25rem] text-xs md:text-sm mt-1">
          {error && <p className="text-red-400">{error}</p>}
          {status === 'success' && (
            <p className="text-emerald-400">
              You’re on the waitlist. Thanks!
            </p>
          )}
          {status === 'exists' && (
            <p className="text-white/70">This email is already registered.</p>
          )}
        </div>
      </form>
    </div>
  );
}
