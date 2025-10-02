// src/components/modals/ClaimModal.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { signerIdentity, generateSigner, publicKey, type Umi } from '@metaplex-foundation/umi';
import { createSignerFromWalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { fetchCandyMachine, mintV2, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';
import { some } from '@metaplex-foundation/umi';


type DiscordStatus = {
  authenticated: boolean;
  isMember: boolean;
  username?: string;
  avatarUrl?: string;
};

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=374fbc07-7a28-4318-9765-fa8b062f0af5';
const CANDY_MACHINE_ID = 'FrPBbXmredqHUKwfWhagrXNyCoe1eXZYQ7xbJgsCVwRE';
const CANDY_GUARD_ID  = '39ow3e4KbLCBLwGDY8sayY9VrocvWyhUkPHeavVM8Zhp';
const DISCORD_INVITE  = 'https://discord.gg/yFj7YAzK';

const log = (...a: any[]) => console.log('[ClaimModal]', ...a);
const err = (...a: any[]) => console.error('[ClaimModal]', ...a);

export default function ClaimModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // ---------- wallet ----------
  const { connected, wallet, wallets, select, connect } = useWallet();

  // ---------- state ----------
  const [claimed, setClaimed] = useState<number>();
  const [remaining, setRemaining] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null); // ✅ for explorer link

  // Discord auth state
  const [discord, setDiscord] = useState<DiscordStatus>({
    authenticated: false,
    isMember: false,
  });
  const [checkingDiscord, setCheckingDiscord] = useState(false);

  // ---------- umi ----------
  const makeUmi = useCallback((): Umi => createUmi(RPC_URL).use(mplCandyMachine()), []);

  // ---------- supply ----------
  const refreshSupply = useCallback(async () => {
    try {
      const umi = makeUmi();
      const cm = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
      const total = Number(cm.data.itemsAvailable ?? 0);
      const minted = Number(
        (cm as any)?.data?.itemsRedeemed ??
        (cm as any)?.itemsRedeemed ??
        (cm as any)?.data?.itemsMinted ??
        (cm as any)?.itemsMinted ??
        0
      );
      
      setClaimed(minted);
      setRemaining(Math.max(total - minted, 0));
      log('supply', { total, minted, remaining: Math.max(total - minted, 0) });
    } catch (e) {
      err('refreshSupply failed', e);
      setClaimed(0);
      setRemaining(0);
    }
  }, [makeUmi]);

  // 初回読み込み
  useEffect(() => {
    if (!isOpen) return;
    refreshSupply();
  }, [isOpen, refreshSupply]);

  // ✅ モーダルが開いている間は10秒ごとに自動更新（ポーリング）
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(refreshSupply, 10_000);
    return () => clearInterval(id);
  }, [isOpen, refreshSupply]);

  // ---------- discord ----------
  const fetchDiscordStatus = useCallback(async () => {
    setCheckingDiscord(true);
    try {
      const res = await fetch('/api/discord/status', { credentials: 'include' });
      if (!res.ok) throw new Error('status fetch failed');
      const data = (await res.json()) as DiscordStatus;
      setDiscord(data);
    } catch (e) {
      err('discord status error', e);
      setDiscord({ authenticated: false, isMember: false });
    } finally {
      setCheckingDiscord(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchDiscordStatus();
  }, [isOpen, fetchDiscordStatus]);

  const signInDiscord = useCallback(() => {
    window.location.href = '/api/discord/login';
  }, []);
  const signOutDiscord = useCallback(() => {
    window.location.href = '/api/discord/logout';
  }, []);
  const joinDiscord = useCallback(() => {
    window.open(DISCORD_INVITE, '_blank', 'noopener,noreferrer');
  }, []);

  // ---------- wallet helpers ----------
  const ensurePhantom = useCallback(async () => {
    if (!wallet?.adapter) {
      const phantom = wallets.find((w) => w.adapter.name === 'Phantom');
      if (phantom) await select(phantom.adapter.name);
    }
    if (!connected) await connect();
  }, [wallet, wallets, select, connect, connected]);

  // ---------- claim ----------
  const canClaim = useMemo(() => {
    return (
      discord.authenticated &&
      discord.isMember &&
      connected &&
      (remaining ?? 0) > 0
    );
  }, [discord, connected, remaining]);

  const solscanUrl = useMemo(
    () => (txSig ? `https://solscan.io/tx/${txSig}` : '#'),
    [txSig]
  );

  const handleClaim = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    setTxSig(null);
  
    try {
      // --- 前提チェック ---
      if (!discord.authenticated) {
        setMsg('Please sign in with Discord first.');
        return;
      }
      if (!discord.isMember) {
        setMsg('Please join our Discord server to proceed.');
        return;
      }
      if (!connected) {
        await ensurePhantom();
        if (!connected) return;
      }
      if ((remaining ?? 0) <= 0) {
        setMsg('All NFTs have been claimed.');
        return;
      }
  
      // --- Umi & Signer 準備 ---
      const adapter = wallet!.adapter;
      const signer = createSignerFromWalletAdapter(adapter);
      const umi = makeUmi().use(signerIdentity(signer));
  
      // --- CM と新規ミント取得 ---
      const candyMachine = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
      const newMint = generateSigner(umi);
  
      // --- ComputeBudget と PriorityFee ---
      // μ-lamports: 1e6 μ-lamports = 1 SOL。デフォルト 100,000 μ-lamports = 0.0001 SOL/compute unit
      const microLamports = Number(process.env.NEXT_PUBLIC_PRIORITY_FEE_MICROLAMPORTS ?? 100_000);
      // Compute Units の上限（新規ATA作成などで重くなることがあるため余裕を持たせる）
      const computeUnits  = Number(process.env.NEXT_PUBLIC_COMPUTE_UNITS ?? 350_000);
  
      // --- トランザクション組み立て ---
      const builder = mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        candyGuard: publicKey(CANDY_GUARD_ID),
        // グループは設定なし（default ガードのみ）なので group は指定しない
        nftMint: newMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        mintArgs: {
          // sugar guard show で確認した default の mintLimit(id=1, amount=1) に合わせる
          mintLimit: some({ id: 1 }),
        },
      })
        // 先頭に ComputeBudget 命令を差し込む（順番が重要なので prepend）
        .prepend(setComputeUnitLimit(umi, { units: computeUnits }))
        .prepend(setComputeUnitPrice(umi, { microLamports }));
  
      // --- 送信＆確定 ---
      const { signature } = await builder.sendAndConfirm(umi);
  
      const sigStr = String(signature);
      setTxSig(sigStr);
      setMsg('success');
  
      // 供給情報を即時更新
      await refreshSupply();
    } catch (e: any) {
      err('mint failed', e);
      const m = String(e?.message || e);
  
      // よくあるケースの軽い文言マッピング
      if (m.toLowerCase().includes('insufficient')) {
        setMsg('Insufficient SOL for fees.');
      } else if (m.toLowerCase().includes('computational budget exceeded')) {
        setMsg('Computational budget exceeded. Please try again in a moment.');
      } else {
        setMsg(`❌ Mint failed: ${m}`);
      }
    } finally {
      setBusy(false);
    }
  }, [discord, connected, ensurePhantom, remaining, wallet, makeUmi, refreshSupply]);
  

  // ---------- UI helpers ----------
  const Step = ({
    done,
    label,
    subtle,
  }: {
    done: boolean;
    label: string;
    subtle?: string;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/15 bg-white/5">
      <div
        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${
          done ? 'bg-emerald-500' : 'bg-gray-600'
        } text-white text-[10px] font-bold`}
      >
        {done ? '✓' : '•'}
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        {subtle && <div className="text-xs text-white/70">{subtle}</div>}
      </div>
    </div>
  );

  const PrimaryBtn = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="
        w-full font-semibold py-3 px-5 rounded-xl
        bg-white/10 hover:bg-white/15
        border border-white/20
        text-white shadow-lg shadow-black/20
        transition transform duration-300 hover:scale-[1.02] disabled:opacity-50
        backdrop-blur-md
      "
    >
      <span className="relative z-10">{busy ? 'Processing…' : children}</span>
    </button>
  );

  const ClaimBtn = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="
        w-full font-semibold py-3 px-5 rounded-xl
        bg-emerald-500/90 hover:bg-emerald-500
        text-white transition transform duration-300 hover:scale-[1.02]
        disabled:opacity-50
        shadow-lg shadow-emerald-900/30
      "
    >
      {busy ? 'Claiming…' : 'Verify & Claim'}
    </button>
  );

  const claimedLabel = typeof claimed === 'number' ? claimed : '…';
  const remainingLabel = typeof remaining === 'number' ? remaining : '…';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* 半透明のオーバーレイ（背景ブラー） */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="
            w-full max-w-xl rounded-2xl p-6
            border border-white/20
            bg-white/10                 /* ✅ 完全半透明（色は持たずガラス風） */
            backdrop-blur-xl backdrop-saturate-150
            shadow-2xl shadow-black/40
            text-white
          "
        >
          <Dialog.Title className="text-2xl font-bold text-center mb-2">
            Axis OG Badge — Claim
          </Dialog.Title>
          <p className="text-center text-white/80 mb-6">
            OG Badges are non-transferable proof that you supported Axis early.
            Join our Discord, link your account, connect your wallet, and claim.
          </p>

          {/* supply */}
          <div className="mb-5 text-center text-sm">
            <span className="font-semibold">{claimedLabel}</span> claimed ·{' '}
            <span className="text-emerald-300 font-semibold">{remainingLabel}</span> remaining
          </div>

          {/* steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <Step
              done={discord.authenticated}
              label="Discord Sign-in"
              subtle={
                checkingDiscord
                  ? 'Checking…'
                  : discord.authenticated
                  ? discord.username
                    ? `Signed in as ${discord.username}`
                    : 'Signed in'
                  : 'Required'
              }
            />
            <Step
              done={discord.isMember}
              label="Server Membership"
              subtle={discord.isMember ? 'Axis server joined' : 'Join required'}
            />
            <Step
              done={connected}
              label="Wallet Connected"
              subtle={connected ? 'Ready to mint' : 'Phantom recommended'}
            />
          </div>

          {/* actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryBtn onClick={joinDiscord}>Join Axis Discord</PrimaryBtn>

            {!discord.authenticated ? (
              <PrimaryBtn onClick={signInDiscord}>Sign in with Discord</PrimaryBtn>
            ) : !discord.isMember ? (
              <PrimaryBtn onClick={joinDiscord}>Open Invite Again</PrimaryBtn>
            ) : !connected ? (
              <PrimaryBtn
                onClick={async () => {
                  try {
                    if (!wallet?.adapter) {
                      const phantom = wallets.find((w) => w.adapter.name === 'Phantom');
                      if (phantom) await select(phantom.adapter.name);
                    }
                    await connect();
                  } catch (e) {
                    err('wallet connect error', e);
                  }
                }}
              >
                Connect Wallet
              </PrimaryBtn>
            ) : (
              <ClaimBtn onClick={handleClaim} disabled={!canClaim} />
            )}
          </div>

          {/* ✅ Mint success panel */}
          {msg === 'success' && txSig && (
            <div className="mt-5 rounded-xl border border-white/15 bg-white/5">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="font-semibold text-white">Mint succeeded</div>
                <a
                  href={solscanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#aecdff] underline hover:text-white"
                >
                  View on Solscan
                </a>
              </div>

              <div className="p-4 space-y-3">
                <div className="text-sm text-white/80">Signature</div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={txSig}
                    className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 font-mono text-xs text-white/90"
                  />
                  <button
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 font-semibold"
                    onClick={() => navigator.clipboard?.writeText(txSig)}
                  >
                    Copy signature
                  </button>
                  <a
                    href={solscanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg bg-[#7aa2ff] hover:bg-blue-400 text-[#0b1020] font-semibold"
                  >
                    Open in Solscan
                  </a>
                </div>

                <div className="text-xs text-white/70">
                  If you don’t see the NFT in Phantom, open “Collectibles Manager” and check spam/hidden, or refresh.
                </div>
              </div>
            </div>
          )}

          {/* helper row */}
          <div className="mt-4 flex items-center justify-between text-xs text-white/70">
            <button
              className="underline decoration-white/30 hover:decoration-white/70"
              onClick={fetchDiscordStatus}
            >
              Refresh Discord status
            </button>
            {discord.authenticated && (
              <button
                className="underline decoration-white/30 hover:decoration-white/70"
                onClick={signOutDiscord}
              >
                Sign out of Discord
              </button>
            )}
          </div>

          {/* message (errorなど) */}
          {msg && msg !== 'success' && (
            <div className="mt-4 text-center text-sm bg-white/5 border border-white/15 rounded-lg px-3 py-2 break-all">
              {msg}
            </div>
          )}

          <button
            className="mt-6 w-full text-center text-sm text-white/80 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </motion.div>
      </div>
    </Dialog>
  );
}
