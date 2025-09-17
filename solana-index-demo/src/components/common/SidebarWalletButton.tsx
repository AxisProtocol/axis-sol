'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

function shortAddr(pk: PublicKey | null) {
  if (!pk) return ''
  const s = pk.toBase58()
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

const SidebarWalletButton = () => {
  const { connection } = useConnection();
  const {
    publicKey, connected, connecting,
    connect, disconnect, wallets, wallet, select
  } = useWallet();

  const [menuOpen, setMenuOpen] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const network = useMemo(() => 'Devnet', []);
  const explorer = publicKey
    ? `https://solscan.io/account/${publicKey.toBase58()}?cluster=devnet`
    : 'https://solscan.io/?cluster=devnet'

  // SOL 残高（任意表示）
  useEffect(() => {
    let sub = 0
    async function run() {
      if (!connection || !publicKey) { setSolBalance(null); return }
      try {
        const lamports = await connection.getBalance(publicKey, 'confirmed')
        setSolBalance(lamports / LAMPORTS_PER_SOL)
        // 口座変更を購読（簡易）
        sub = connection.onAccountChange(
          publicKey,
          (acc) => setSolBalance(acc.lamports / LAMPORTS_PER_SOL),
          'confirmed'
        )
      } catch {/* noop */}
    }
    run()
    return () => { if (sub) connection.removeAccountChangeListener(sub) }
  }, [connection, publicKey])

  // 點擊外部關閉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  async function handleConnect() {
    try {
      // 自前UIなので Phantom を自動選択（PhantomWalletAdapter を使っている前提）
      if (!wallet) {
        const phantom = wallets.find(w => w.adapter.name === 'Phantom')
        if (phantom) await select(phantom.adapter.name)
      }
      await connect()
      setMenuOpen(false)
    } catch (e) {
      console.error('[SidebarWalletButton] connect error:', e)
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect()
      setMenuOpen(false)
    } catch (e) {
      console.error('[SidebarWalletButton] disconnect error:', e)
    }
  }

  function copyAddress() {
    if (!publicKey) return
    navigator.clipboard?.writeText(publicKey.toBase58()).catch(() => {})
  }

  // 非接続時のボタン
  if (!connected) {
    return (
      <div className="relative w-full">
        <button
          type="button"
          className="w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-200 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white"
          onClick={handleConnect}
          aria-busy={connecting}
          aria-label="Connect Solana wallet"
        >
          {connecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
        <div className="mt-2 text-xs text-gray-400 text-center px-2 py-1 border border-white/15 rounded-md select-none">{network}</div>
      </div>
    )
  }

  // 接続中のドロップダウン
  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        type="button"
        className="w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        onClick={() => setMenuOpen(v => !v)}
        aria-expanded={menuOpen}
        aria-controls="wallet-menu"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-white mr-2 animate-pulse" /> {shortAddr(publicKey)}
      </button>
      <div className="mt-2 text-xs text-gray-400 text-center px-2 py-1 border border-white/15 rounded-md select-none">{network}</div>

      {menuOpen && (
        <div id="wallet-menu" role="menu" className="absolute left-0 bottom-[calc(100%+0.5rem)] w-full min-w-[280px] bg-gray-900/85 backdrop-blur-md border border-white/12 rounded-xl shadow-2xl shadow-black/45 overflow-hidden z-30">
          <div className="px-4 py-3 pb-2 border-b border-white/8">
            <div className="font-mono text-gray-300 text-sm break-all">{publicKey?.toBase58()}</div>
            {solBalance != null && (
              <div className="mt-1 text-green-300 font-semibold text-sm">{solBalance.toFixed(4)} SOL</div>
            )}
          </div>
          <button role="menuitem" className="w-full text-left px-4 py-3 bg-transparent border-none text-gray-200 font-semibold cursor-pointer block no-underline hover:bg-white/6" onClick={copyAddress}>
            Copy address
          </button>
          <a role="menuitem" className="w-full text-left px-4 py-3 bg-transparent border-none text-gray-200 font-semibold cursor-pointer block no-underline hover:bg-white/6" href={explorer} target="_blank" rel="noreferrer">
            View on Solscan
          </a>
          <button role="menuitem" className="w-full text-left px-4 py-3 bg-transparent border-none text-red-400 font-semibold cursor-pointer block no-underline hover:bg-white/6" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
};

export default SidebarWalletButton;
