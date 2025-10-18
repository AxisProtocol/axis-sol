'use client';
import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  ModalLayout,
  ModalHeader,
  ModalInput,
  ModalButton,
  BalanceDisplay,
  InfoDisplay,
} from './ModalComponents';
import { useModalLogic } from './modalUtils';

import {
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
} from '@solana/spl-token';
import {
  SystemProgram,
  Transaction,
  Connection,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { devnet as snsDev, getDomainKey } from '@bonfida/spl-name-service';

async function ensureWSOL(
  connection: Connection,
  owner: PublicKey,
  sendTx: any,
  lamports: number
) {
  const ata = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    owner,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const ixs: any[] = [];
  const info = await getAccountInfoCompat(connection, ata);
  if (!info) {
    ixs.push(
      createAssociatedTokenAccountInstruction(
        owner,
        ata,
        owner,
        NATIVE_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }
  ixs.push(
    SystemProgram.transfer({ fromPubkey: owner, toPubkey: ata, lamports }),
    createSyncNativeInstruction(ata)
  );

  const tx = new Transaction().add(...ixs);
  tx.feePayer = owner;
  const sig = await sendTx(tx, connection);
  await connection.confirmTransaction(sig, 'confirmed');
  return ata;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  indexPrice: number | null;
  onRegistered?: (fqdn: string) => void;
};
async function getAccountInfoCompat(
  conn: any,
  pubkey: PublicKey,
  commitment: any = 'confirmed'
) {
  if (typeof conn.getAccountInfo === 'function') {
    return await conn.getAccountInfo(pubkey, commitment); // web3 v1
  }
  if (conn?.rpc?.getAccountInfo) {
    const res = await conn.rpc.getAccountInfo(pubkey, { commitment }); // web3 v2(@solana/kit)
    return res?.value ?? null;
  }
  throw new Error('Connection does not expose getAccountInfo');
}

export default function SnsModal({
  isOpen,
  onClose,
  indexPrice,
  onRegistered,
}: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [name, setName] = useState('');
  const { publicKey, sendTransaction, connected } = wallet;
  const { firstFocusableRef, networkName } = useModalLogic(isOpen, onClose);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [amount, setAmount] = useState('Muse.axis.sol');
  const [busy, setBusy] = useState(false);

  const EST_SOL = 0.1;
  const NAME_SPACE = 1000; // 公式例のまま

  const snsRegister = async () => {
    if (!connected || !publicKey || !sendTransaction) return;
    try {
      setBusy(true);

      const raw = name
        .trim()
        .toLowerCase()
        .replace(/\.sol$/i, '');
      if (!raw || !/^[a-z0-9._-]{2,32}$/.test(raw)) {
        throw new Error('Invalid name (2–32 chars: a-z 0-9 . _ -)');
      }
      const fqdn = `${raw}.sol`;

      const { pubkey: nameAccount } = await getDomainKey(raw);
      const exists = await getAccountInfoCompat(
        connection,
        nameAccount,
        'confirmed'
      );
      if (exists) throw new Error(`"${fqdn}" is already registered`);

      const needLamports = Math.ceil(EST_SOL * LAMPORTS_PER_SOL);
      await ensureWSOL(connection, publicKey, sendTransaction, needLamports);

      const fromAta = getAssociatedTokenAddressSync(
        NATIVE_MINT,
        publicKey,
        true
      );
      const regIxOrIxs = await snsDev.bindings.registerDomainNameV2(
        connection,
        raw,
        NAME_SPACE,
        publicKey, // payer
        fromAta, // wSOL から支払い
        NATIVE_MINT // wSOL
      );
      const tx = new Transaction();
      Array.isArray(regIxOrIxs) ? tx.add(...regIxOrIxs) : tx.add(regIxOrIxs);
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');

      setName('');
      if (onRegistered) onRegistered(fqdn); // ★追加
      onClose(); // ★モーダルを閉じる
      alert(`✅ Registered ${fqdn}\nTx: ${sig}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} titleId="buy-title">
      <ModalHeader
        networkName={networkName}
        publicKey={publicKey?.toBase58() || null}
        onClose={onClose}
        title="Buy AXIS"
      />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 lg:grid-cols-1">
        {/* Left: form */}
        <section className="bg-white/4 border border-white/10 rounded-xl p-4">
          <BalanceDisplay
            items={[
              { label: 'Your wSOL Balance', value: usdcBalance, decimals: 6 },
              {
                label: 'Current Price',
                value: indexPrice ? `$${indexPrice.toFixed(4)}` : 'N/A',
              },
            ]}
          />

          <label
            htmlFor="domain"
            className="block text-sm font-medium text-white/90"
          >
            Domain
          </label>

          <div className="mt-1 flex items-center gap-2">
            <input
              id="domain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Muse"
              autoComplete="off"
              className="
      flex-1 h-10 px-3 rounded-lg outline-none
      bg-transparent text-white placeholder:text-white/40
      border border-white/15 focus:border-white/30
    "
            />
            <span className="text-white/70 select-none">.sol</span>
          </div>
          {connected ? (
            <ModalButton onClick={snsRegister} disabled={busy || !publicKey}>
              {busy ? 'Registering…' : 'Get own .sol'}
            </ModalButton>
          ) : (
            <div style={{ marginTop: '1rem' }}></div>
          )}

          {!connected && (
            <div className="mt-2 text-xs text-amber-300">
              Connect your wallet to register
            </div>
          )}
        </section>

        {/* Right: details */}
        <InfoDisplay
          title="Purchase Details"
          description="Enter your desired subdomain in the box on the left.  WSOL is required for purchase. (You can purchase WSOL automatically at the time of purchase.)"
          items={[
            {
              label: 'Attention',
              value: 'Only one domain can be purchased per wallet',
            },
          ]}
        />
      </div>
    </ModalLayout>
  );
}
