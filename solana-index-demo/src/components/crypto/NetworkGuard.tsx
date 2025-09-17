// src/components/NetworkGuard.tsx
import { useConnection } from '@solana/wallet-adapter-react';
import React from 'react';

export default function NetworkGuard({
  children,
  blockOnNonDevnet = true,
}: { children: React.ReactNode; blockOnNonDevnet?: boolean }) {
  const { connection } = useConnection();
  const isDevnet = /devnet/i.test(connection.rpcEndpoint);

  if (!isDevnet && blockOnNonDevnet) {
    return (
      <div style={{
        padding: '16px',
        borderRadius: 12,
        border: '1px solid #444',
        background: 'rgba(255,120,120,0.08)',
        color: '#fff',
        lineHeight: 1.5,
      }}>
        <b>Devnet only</b><br/>
        This dApp runs on <b>Solana Devnet</b> only.  
        Your wallet can still sign, but balances won’t show unless Phantom is on Devnet.
        <ul style={{ margin: '8px 0 0 18px' }}>
          <li>Open Phantom → <b>Settings → Developer Settings</b></li>
          <li>Enable <b>Testnet Mode</b> and choose <b>Solana: Devnet</b></li>
        </ul>
        <small>Tip: After switching, reload this page.</small>
      </div>
    );
  }

  return <>{children}</>;
}
