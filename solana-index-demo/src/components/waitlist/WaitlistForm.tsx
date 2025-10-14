'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common';
import { validateEmail } from '@/utils/validation';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'exists' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then(r => r.json())
      .then(d => setCount(d.count))
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
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-[600px] mx-auto flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      {count !== null && (
        <p className="text-gray-300 text-sm">
          {count.toLocaleString()} people have already joined 🚀
        </p>
      )}
      <div className="flex gap-4 justify-center flex-wrap">
        <input
          type="text"
          placeholder="enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`flex-1 p-3 bg-white/10 rounded-lg border ${
            error ? 'border-red-500' : 'border-white/20'
          } text-white placeholder-gray-400 min-w-[250px]`}
          disabled={isLoading}
        />
        <Button variant="secondary" disabled={isLoading}>
          {isLoading ? 'Joining…' : 'Join'}
        </Button>
      </div>

      <div className="w-full text-left">
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        {status === 'success' && (
          <p className="text-green-400 text-sm mt-1">You’re on the waitlist ✅</p>
        )}
        {status === 'exists' && (
          <p className="text-amber-300 text-sm mt-1">You’re already on the list ✨</p>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-300">
        <input
          id="waitlist-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="h-4 w-4 accent-white/70 bg-transparent border border-white/30 rounded"
        />
        <label htmlFor="waitlist-consent">
          I agree to receive occasional product updates.
        </label>
      </div>
    </motion.form>
  );
}
