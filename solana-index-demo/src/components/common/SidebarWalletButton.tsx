"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import UnifiedDashboard from "../../app/dashboard/UnifiedDashboard";
import ModernButton from "./ModernButton";
import {
  getAllDomains,
  reverseLookup,
  devnet as snsDev,
} from "@bonfida/spl-name-service";
// splana-SPLトークン発行ライブラリ
import {
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token";
import { P } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

type SidebarWalletButtonProps = {
  layout?: "stack" | "inline";
  className?: string;
};

const SnsModal = dynamic(() => import("../dashboard/Modal/snsModal"), {
  ssr: false,
});

function shortAddr(pk: PublicKey | null) {
  if (!pk) return "";
  const s = pk.toBase58();
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}
const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

const SidebarWalletButton = ({
  layout = "stack",
  className = "",
}: SidebarWalletButtonProps) => {
  const inline = layout === "inline";
  const { connection } = useConnection();
  const {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    wallets,
    wallet,
    select,
  } = useWallet();

  // SNSsystem
  const [domains, setDomains] = useState<string[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [domainsError, setDomainsError] = useState<string | null>(null);
  const [desiredName, setDesiredName] = useState("");
  const [regBusy, setRegBusy] = useState(false);
  const [regMsg, setRegMsg] = useState<string | null>(null);
  const [snsOpen, setSnsOpen] = useState(false);

  async function ensureWSOL(
    connection: Connection,
    owner: PublicKey,
    payer: any, // wallet.adapter
    amountLamports: number
  ) {
    const ata = getAssociatedTokenAddressSync(
      NATIVE_MINT,
      owner,
      true, // allowOwnerOffCurve
      TOKEN_PROGRAM_ID, // ★ 明示
      ASSOCIATED_TOKEN_PROGRAM_ID // ★ 明示
    );

    const ixs: any[] = [];
    const ataInfo = await connection.getAccountInfo(ata);

    // 1) ATA がなければ作成
    if (!ataInfo) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          owner, // payer
          ata, // ata
          owner, // owner
          NATIVE_MINT, // mint
          TOKEN_PROGRAM_ID, // ★ 明示
          ASSOCIATED_TOKEN_PROGRAM_ID // ★ 明示
        )
      );
    }

    // 2) SOL を入れて同期（= wrap）
    ixs.push(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: ata,
        lamports: amountLamports,
      }),
      createSyncNativeInstruction(ata, TOKEN_PROGRAM_ID) // ★ 明示
    );

    const tx = new Transaction().add(...ixs);
    tx.feePayer = owner;

    // デバッグ（開発中のみ）：すべてのixに programId が入っているか確認
    // console.log("ix programIds", ixs.map(ix => ix?.programId?.toBase58?.()));

    const sig = await payer.sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, "confirmed");
    return ata;
  }

  // === 登録トランザクション ===
  async function onRegister() {
    if (!connection || !publicKey || !wallet?.adapter) return;
    try {
      setRegBusy(true);
      setRegMsg(null);

      const raw = desiredName.trim().replace(/\.sol$/i, "");
      if (!raw || !/^[a-z0-9._-]+$/i.test(raw)) {
        throw new Error("Invalid name");
      }

      // 0.1 SOL を wSOL 化（必要なら増やしてOK）
      const wsolAta = await ensureWSOL(
        connection,
        publicKey,
        wallet.adapter,
        0.1 * LAMPORTS_PER_SOL
      );

      // devnetの登録Ix（単発 or 配列どちらでも対応）
      const regIxOrIxs = await snsDev.bindings.registerDomainNameV2(
        connection,
        raw,
        1000, // space
        publicKey, // payer
        wsolAta, // from
        NATIVE_MINT // mint (wSOL)
      );

      const tx2 = new Transaction();
      if (Array.isArray(regIxOrIxs)) {
        tx2.add(...regIxOrIxs);
      } else if (regIxOrIxs) {
        tx2.add(regIxOrIxs);
      } else {
        throw new Error("registerDomainNameV2 returned no instruction");
      }
      tx2.feePayer = publicKey;

      const sig2 = await wallet.adapter.sendTransaction(tx2, connection);
      await connection.confirmTransaction(sig2, "confirmed");

      setDesiredName("");
      setDomains((d) => (d.includes(`${raw}.sol`) ? d : [`${raw}.sol`, ...d]));
    } catch (e: any) {
      setRegMsg(`Error: ${e?.message ?? String(e)}`);
    } finally {
      setRegBusy(false);
    }
  }

  // menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const network = useMemo(() => "devnet", []);
  const explorer = publicKey
    ? `https://solscan.io/account/${publicKey.toBase58()}?cluster=devnet`
    : "https://solscan.io/?cluster=devnet";

  // SOL 残高（任意表示）
  useEffect(() => {
    let sub = 0;
    async function run() {
      if (!connection || !publicKey) {
        setSolBalance(null);
        return;
      }
      try {
        const lamports = await connection.getBalance(publicKey, "confirmed");
        setSolBalance(lamports / LAMPORTS_PER_SOL);
        // 口座変更を購読（簡易）
        sub = connection.onAccountChange(
          publicKey,
          (acc) => setSolBalance(acc.lamports / LAMPORTS_PER_SOL),
          "confirmed"
        );
      } catch {
        /* noop */
      }
    }
    run();
    return () => {
      if (sub) connection.removeAccountChangeListener(sub);
    };
  }, [connection, publicKey]);

  /// SNS ドメイン取得
  useEffect(() => {
    let cancelled = false;
    async function fetchDomains() {
      if (!connection || !publicKey) {
        // ✅ 未接続時は状態をクリアしてローディングも false に戻す
        setDomains([]);
        setDomainsError(null);
        setDomainsLoading(false);
        return;
      }

      setDomainsLoading(true);
      setDomainsError(null);
      try {
        const keys = await getAllDomains(connection, publicKey);
        const names = await Promise.all(
          keys.map((k) => reverseLookup(connection, k).catch(() => null))
        );
        if (!cancelled) {
          setDomains(
            names
              .filter((n): n is string => !!n)
              .map((n) => (n.endsWith(".sol") ? n : `${n}.sol`))
          );
        }
      } catch (e: any) {
        if (!cancelled)
          setDomainsError(e?.message ?? "Failed to fetch domains");
      } finally {
        if (!cancelled) setDomainsLoading(false);
      }
    }
    fetchDomains();
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey]);
  // 點擊外部關閉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  async function handleConnect() {
    try {
      // 自前UIなので Phantom を自動選択（PhantomWalletAdapter を使っている前提）
      if (!wallet) {
        const phantom = wallets.find((w) => w.adapter.name === "Phantom");
        if (phantom) await select(phantom.adapter.name);
      }
      await connect();
      setMenuOpen(false);
    } catch (e) {
      console.error("[SidebarWalletButton] connect error:", e);
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect();
      setMenuOpen(false);
    } catch (e) {
      console.error("[SidebarWalletButton] disconnect error:", e);
    }
  }

  function copyAddress() {
    if (!publicKey) return;
    navigator.clipboard?.writeText(publicKey.toBase58()).catch(() => {});
  }

  // 非接続時のボタン
  if (!connected) {
    return (
      <div
        className={cx(
          inline
            ? "inline-flex items-center gap-2 whitespace-nowrap"
            : "w-full flex flex-col",
          className
        )}
      >
        <button
          type="button"
          className={cx(
            "inline-flex items-center justify-center align-middle leading-none font-medium rounded-lg transition-all duration-200 text-white",
            inline
              ? "h-10 px-4 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600"
              : "w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600"
          )}
          onClick={handleConnect}
          aria-busy={connecting}
          aria-label="Connect Solana wallet"
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>

        {domains.length === 0 &&
          !domainsLoading &&
          (inline ? (
            <ModernButton
              onClick={() => setSnsOpen(true)}
              className="
              ml-2 inline-flex items-center justify-center align-middle
              h-10 px-4 rounded-lg leading-none font-black
              bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
              text-white whitespace-nowrap text-lg


            "
            >
              Get own .sol
            </ModernButton>
          ) : (
            <div className="relative w-full mt-4">
              <ModernButton
                onClick={() => setSnsOpen(true)}
                className="w-full font-semibold py-3 px-5 rounded-xl
                         bg-gradient-to-r from-blue-600 to-purple-600
                         hover:from-blue-700 hover:to-purple-700
                         text-white shadow-lg hover:shadow-purple-400/40
                         transition transform duration-300 hover:scale-105"
              >
                Get own .sol
              </ModernButton>
            </div>
          ))}

        {snsOpen && (
          <SnsModal
            isOpen={snsOpen}
            onClose={() => setSnsOpen(false)}
            indexPrice={null}
            onRegistered={(fqdn) => {
              setDomains((d) => (d.includes(fqdn) ? d : [fqdn, ...d]));
              setSnsOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  // 接続中のドロップダウン
  return (
    <div
      ref={menuRef}
      className={cx(
        inline
          ? "relative inline-flex items-center gap-2 whitespace-nowrap"
          : "relative w-full flex flex-col",
        className
      )}
    >
      <button
        type="button"
        className={cx(
          "font-medium rounded-lg transition-all duration-200 text-white",
          inline
            ? "h-10 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            : "w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        )}
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-controls="wallet-menu"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />{" "}
        {domains.length > 0 ? domains[0] : shortAddr(publicKey)}
      </button>
      {domains.length === 0 &&
        !domainsLoading &&
        (inline ? (
          <ModernButton
            onClick={() => setSnsOpen(true)}
            className="
        ml-2 inline-flex items-center justify-center align-middle
        h-10 px-4 rounded-lg leading-none font-bold
        bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
        text-white whitespace-nowrap text-lg
      "
          >
            Get own .sol
          </ModernButton>
        ) : (
          <div className="relative w-full mt-4">
            <ModernButton
              onClick={() => setSnsOpen(true)}
              className="
          w-full font-semibold py-3 px-5 rounded-xl
          bg-gradient-to-r from-blue-600 to-purple-600
          hover:from-blue-700 hover:to-purple-700
          text-white shadow-lg hover:shadow-purple-400/40
          transition transform duration-300 hover:scale-105
        "
            >
              Get own .sol
            </ModernButton>
          </div>
        ))}

      {snsOpen && (
        <SnsModal
          isOpen={snsOpen}
          onClose={() => setSnsOpen(false)}
          indexPrice={null}
          onRegistered={(fqdn) => {
            setDomains((d) => (d.includes(fqdn) ? d : [fqdn, ...d]));
            setSnsOpen(false);
          }}
        />
      )}

      {menuOpen && (
        <div
          id="wallet-menu"
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] min-w-[280px]
    bg-gray-900/85 backdrop-blur-md border border-white/12
    rounded-xl shadow-2xl shadow-black/45
    z-[9999] max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 pb-2 border-b border-white/8">
            <div className="font-mono text-gray-300 text-sm break-all">
              {publicKey?.toBase58()}
            </div>
            {domainsError && (
              <div className="mt-1 text-xs text-red-400">{domainsError}</div>
            )}
            {solBalance != null && (
              <div className="mt-1 text-green-300 font-semibold text-sm">
                {solBalance.toFixed(4)} SOL
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <button
              role="menuitem"
              className="w-full text-left px-4 py-3 text-gray-200 font-semibold hover:bg-white/6"
              onClick={copyAddress}
            >
              Copy address
            </button>

            <a
              role="menuitem"
              className="w-full text-left px-4 py-3 text-gray-200 font-semibold hover:bg-white/6"
              href={explorer}
              target="_blank"
              rel="noreferrer"
            >
              View on Solscan
            </a>

            <button
              role="menuitem"
              className="w-full text-left px-4 py-3 text-red-400 font-semibold hover:bg-white/6"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarWalletButton;
