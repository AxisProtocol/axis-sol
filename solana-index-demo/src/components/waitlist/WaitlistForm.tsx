// components/waitlist/WaitlistForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { validateEmail } from '@/utils/validation';

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] =
    useState<'idle' | 'loading' | 'success' | 'exists' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.axis-protocol.xyz/api/waitlist/count')
      .then(r => r.json())
      .then((d: { count?: number }) => setCount(d.count ?? null))
      .catch(() => setCount(null));
  }, []);

  // ESC + 背景スクロール抑止
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    if (isOpen) {
      window.addEventListener('keydown', onEsc);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', onEsc);
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError('Email is required.');
    const { valid, normalized } = validateEmail(email);
    if (!valid) return setError('Please enter a valid email address.');
    setStatus('loading');

    try {
      const res = await fetch('https://api.axis-protocol.xyz/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, consentMarketing: consent, source: 'hero' }),
      });

      if (res.status === 201) {
        setStatus('success'); setEmail(''); setConsent(false);
        fetch('https://api.axis-protocol.xyz/api/waitlist/count')
          .then(r => r.json()).then((d: { count?: number }) => setCount(d.count ?? null)).catch(() => {});
        return;
      }
      if (res.status === 409) return setStatus('exists');

      const data = await res.json().catch(() => ({} as { error?: string }));
      setError(data?.error === 'INVALID_EMAIL' ? 'Invalid email address.' : 'Something went wrong. Please try again.');
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
    <>
      {/* ── 常時表示トグル（左上・四角・グラス） ── */}
      /* ── 常時表示トグル：左上・アイコンのみ・枠線なしガラス + しっかり読めるTooltip ── */
<div
  className="
    fixed z-[2000] group
    left-[calc(env(safe-area-inset-left,0px)+16px)]
    top-[calc(env(safe-area-inset-top,0px)+12px)]
  "
>
  {/* Tooltip（PCのみ）。大きめ＆コントラスト高め */}
  <div
    className="
      pointer-events-none hidden md:block
      absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2
      opacity-0 -translate-x-1.5
      group-hover:opacity-100 group-hover:translate-x-0
      transition duration-150
    "
    role="tooltip"
    style={{ fontFamily: 'var(--font-serif)' }}
  >
    <div
      className="
        px-3.5 py-2 rounded-lg
        text-[13.5px] md:text-[14px] font-medium leading-none
        text-white
        backdrop-blur-xl
        bg-[linear-gradient(180deg,rgba(20,20,20,.65),rgba(20,20,20,.45))]
        shadow-[0_10px_30px_rgba(0,0,0,.35)]
      "
    >
      Join waitlist
    </div>
  </div>

  {/* アイコンのみ／枠線なし。ヘッダーに馴染む半透明ガラス */}
  <button
    onClick={() => setIsOpen(true)}
    aria-label="Join waitlist"
    className="
      grid place-items-center
      w-12 h-12 md:w-[3.5rem] md:h-[3.5rem]
      rounded-xl
      backdrop-blur-xl
      bg-white/6 hover:bg-white/10           /* ← 枠線無しで馴染ませる */
      shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_8px_24px_rgba(0,0,0,.30)]
      text-white
      outline-none focus-visible:ring-2 focus-visible:ring-white/30
      transition-transform duration-150 hover:scale-[1.04] active:scale-[0.97]
      md:[mix-blend:luminosity]              /* ← ヘッダー上で自然に溶け込む */
    "
    style={{ fontFamily: 'var(--font-serif)' }}
  >
    {/* mail icon */}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  </button>
</div>


      {/* ── モノトーン・モーダル ── */}
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[1999] bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                role="dialog" aria-modal="true"
                className="fixed inset-0 z-[2001] grid place-items-center p-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ y: 16, scale: 0.985 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 16, scale: 0.985 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="
                    w-full max-w-[640px]
                    rounded-2xl overflow-hidden
                    border border-white/12
                    backdrop-blur-2xl
                    bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]
                    shadow-[0_40px_120px_-20px_rgba(0,0,0,0.65)]
                    text-white
                  "
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  <div className="flex items-start justify-between px-7 pt-7">
                    <div>
                      <h2 className="text-[1.7rem] md:text-[1.95rem] leading-tight tracking-tight">Join the waitlist</h2>
                      {count !== null && (
                        <p className="mt-1 text-sm text-white/65">
                          {count.toLocaleString()} people have already joined
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsOpen(false)} aria-label="Close"
                      className="-m-1.5 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="px-7 pb-7 pt-4">
                    <label className="block">
                      <span className="block text-[0.95rem] text-white/80">Email address</span>
                      <div className="mt-3 relative">
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={`
                            w-full rounded-xl
                            bg-white/7
                            border ${error ? 'border-red-500/70' : 'border-white/18'}
                            text-white placeholder-white/45
                            px-4 py-3.5 pr-24
                            outline-none focus:border-white/80 focus:ring-4 focus:ring-white/12
                            transition
                          `}
                          disabled={isLoading}
                          style={{ fontFamily: 'var(--font-serif)' }}
                        />
                        <button
                          type="submit" disabled={isLoading}
                          className="
                            absolute right-1.5 top-1/2 -translate-y-1/2
                            rounded-lg px-4 h-[42px]
                            bg-white text-black hover:bg-[#f6f6f6]
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-colors shadow-[0_6px_18px_-8px_rgba(255,255,255,0.4)]
                          "
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {isLoading ? 'Sending…' : 'Join'}
                        </button>
                      </div>
                    </label>

                    <label className="mt-4 flex items-center gap-3 text-[0.95rem] text-white/75">
                      <input
                        type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                        className="h-4 w-4 rounded border-white/35 bg-white/10 text-white focus:ring-white/30"
                      />
                      Receive occasional product updates
                    </label>

                    <div className="min-h-[1.25rem] mt-3">
                      {error && <p className="text-sm text-red-400">{error}</p>}
                      {status === 'success' && <p className="text-sm text-emerald-400">You’re on the waitlist. Thanks!</p>}
                      {status === 'exists' && <p className="text-sm text-white/70">This email is already registered.</p>}
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
