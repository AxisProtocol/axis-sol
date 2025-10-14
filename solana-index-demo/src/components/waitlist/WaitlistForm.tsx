'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common';
import { validateEmail } from '@/utils/validation';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'exists' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => setCount(null));
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

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
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
        setCount(c => (c !== null ? c + 1 : c));
        return;
      }
      if (res.status === 409) {
        setStatus('exists');
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data?.error === 'INVALID_EMAIL'
        ? 'Invalid email address.'
        : 'Something went wrong. Please try again.');
      setStatus('error');
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    } finally {
      setStatus((prev) => (prev === 'loading' ? 'idle' : prev));
    }
  }

  const isLoading = status === 'loading';

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 px-4 py-6 bg-cyan-500/10 border-2 border-cyan-500/50 text-cyan-400 font-mono text-sm tracking-wider hover:bg-cyan-500/20 hover:border-cyan-500 transition-all backdrop-blur-sm"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        style={{ writingMode: 'vertical-rl' }}
      >
        {isOpen ? '✕' : 'JOIN WAITLIST'}
      </motion.button>

      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-black/95 border-l-2 border-cyan-500/50 z-50 p-8 flex flex-col justify-center backdrop-blur-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="max-w-[400px] mx-auto w-full space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <h2 className="text-cyan-400 font-mono text-2xl tracking-wider">JOIN WAITLIST</h2>
                  <div className="h-0.5 w-16 bg-cyan-500/50"></div>
                </div>

                {/* Count */}
                {count !== null && (
                  <div className="flex items-center gap-2 text-cyan-400/70 text-sm font-mono">
                    <span className="text-cyan-500/50">›</span>
                    <span>{count.toLocaleString()} already joined</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ENTER_YOUR_EMAIL"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-5 py-4 pr-16 bg-black/40 border-2 ${
                        error ? 'border-red-500' : 'border-cyan-500/50'
                      } text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all font-mono text-sm tracking-wide`}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-[calc(100%-8px)] bg-cyan-500/0 border-l-2 border-cyan-500/30 text-cyan-400 font-mono text-lg hover:bg-cyan-500/10 hover:border-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
                    >
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                        {isLoading ? '...' : '→'}
                      </span>
                    </button>
                  </div>

                  {/* Status Messages */}
                  <div className="min-h-[20px]">
                    {error && <p className="text-red-400 text-xs font-mono">! {error}</p>}
                    {status === 'success' && (
                      <p className="text-green-400 text-xs font-mono">✓ You're on the waitlist</p>
                    )}
                    {status === 'exists' && (
                      <p className="text-cyan-400/70 text-xs font-mono">› already registered</p>
                    )}
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                    <div className="relative flex items-center">
                      <input
                        id="waitlist-consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="peer h-3 w-3 appearance-none border border-gray-700 bg-black/40 cursor-pointer transition-all hover:border-cyan-500/30 checked:bg-cyan-500/10 checked:border-cyan-500/50"
                      />
                      <svg
                        className="absolute left-0 h-3 w-3 pointer-events-none hidden peer-checked:block text-cyan-500/70"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <label htmlFor="waitlist-consent" className="cursor-pointer select-none opacity-50 hover:opacity-80 transition-opacity">
                      receive updates
                    </label>
                  </div>
                </form>

                {/* Close hint */}
                <p className="text-gray-600 text-[10px] font-mono text-center pt-8">
                  ESC to close
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
