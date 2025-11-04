"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ModalInput,
  PercentageButtons,
  ModalButton,
  BalanceDisplay,
  InfoDisplay,
} from "./ModalComponents";
import {
  useModalLogic,
  AXIS_MINT_2022,
  AXIS_DECIMALS,
  TREASURY_OWNER,
  USDC_MINT as USDC_DEV_MINT,
  calculateExpectedTokens,
} from "./modalUtils";

type Props = {
  /** 現在のIndex価格（Index Value） */
  indexPrice: number | null;
};

/**
 * 右サイドバー常設の Sell（Redeem）パネル
 * - モーダルレイアウトを外し、asideセクションとして再利用できるようにリファクタ
 * - 既存 BurnModal のロジックを極力維持
 */
export default function SellPanel({ indexPrice }: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, connected } = wallet;

  const [axisBalance, setAxisBalance] = useState(0);
  const [amount, setAmount] = useState("0.01");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<
    "idle" | "building" | "submitted" | "settling" | "settled" | "error"
  >("idle");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // モーダル専用のフォーカス制御等を流用（モーダルは使わないが networkName 取得に使う）
  const { networkName } = useModalLogic(true, () => {});

  // -------- Fetch AXIS balance --------
  useEffect(() => {
    let aborted = false;
    (async () => {
      if (!connected || !publicKey) return;
      try {
        const ata = await getAssociatedTokenAddress(
          AXIS_MINT_2022,
          publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        const bal = await connection
          .getTokenAccountBalance(ata)
          .catch(() => null);
        if (!aborted) setAxisBalance(bal?.value?.uiAmount || 0);
      } catch {
        if (!aborted) setAxisBalance(0);
      }
    })();
    return () => {
      aborted = true;
    };
    // 「settled」直後に再取得したいので依存に含める
  }, [connected, publicKey, connection, step === "settled"]);

  // 受け取り見込み（USDC）: Q_USDC = Q_AXIS × Index
  const expectedUsdc = useMemo(() => {
    const q = parseFloat(amount);
    return calculateExpectedTokens(q, indexPrice, /* isBuy */ false);
  }, [amount, indexPrice]);

  const setPct = (p: number) => {
    const q = axisBalance * p;
    setAmount(q.toFixed(AXIS_DECIMALS));
  };

  const handleRedeem = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      setErrorMsg("Connect your wallet on Devnet.");
      setStep("error");
      return;
    }
    if (networkName !== "Devnet") {
      setErrorMsg("This dApp runs on Devnet only.");
      setStep("error");
      return;
    }
    const qAxis = parseFloat(amount);
    if (!isFinite(qAxis) || qAxis <= 0) {
      setErrorMsg("Enter a valid amount.");
      setStep("error");
      return;
    }
    if (qAxis > axisBalance) {
      setErrorMsg("Insufficient AXIS balance.");
      setStep("error");
      return;
    }

    try {
      setBusy(true);
      setErrorMsg(null);
      setStep("building");

      const { AxisSDK } = await import("@axis-protocol/sdk");
      const sdk = new AxisSDK(connection, wallet as any);

      // AXIS をトレジャリーにデポジット → バックエンドで償還しUSDC払い戻し
      const { transaction, memoId: mid } =
        await sdk.buildIndexTokenDepositTransaction(qAxis);
      setMemoId(mid);

      setStep("submitted");
      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);

      setStep("settling");

      // バックエンドのsettlementをポーリング（簡易）
      let done = false;
      const deadline = Date.now() + 90_000;
      while (!done && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 4000));
        // TODO: API があればここでステータス確認
        done = true; // デモ用
      }
      if (done) setStep("settled");
      else setStep("settling");
    } catch (e: any) {
      console.error("[SellPanel] error:", e);
      setErrorMsg(e?.message || "Unexpected error");
      setStep("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="bg-base-200/50 border border-base-300 rounded-2xl p-4 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Sell / Redeem</h3>
          <img
            src="/cap5.png"
            alt="CaP5 Logo"
            className="w-15 h-15 object-contain ml-5"
          />
        </div>

        <span className="text-xs text-base-content/50">{networkName}</span>
      </div>

      <BalanceDisplay
        items={[
          {
            label: "Your CaP5 balances",
            value: axisBalance,
            decimals: AXIS_DECIMALS,
          },
          {
            label: "Current Index Value",
            value: indexPrice ? indexPrice.toFixed(6) : "N/A",
          },
        ]}
      />

      <ModalInput
        id="redeem-amt"
        label="Amount to Redeem (AXIS)"
        value={amount}
        onChange={setAmount}
        min="0"
        step="0.000000001"
        disabled={busy}
        inputMode="decimal"
      />

      <PercentageButtons onSetPercentage={setPct} disabled={busy} />

      <ModalButton
        onClick={handleRedeem}
        disabled={busy || !publicKey}
        className="bg-red-500/80 hover:bg-red-500"
      >
        {busy ? "Processing…" : "Redeem (Burn)"}
      </ModalButton>

      {/* Inline status */}
      {step !== "idle" && (
        <div className="mt-2 p-3 rounded-lg bg-black/35 border border-white/12 text-sm space-y-1">
          {step === "building" && <p>Preparing transaction…</p>}
          {step === "submitted" && (
            <p>Transaction sent. Waiting for confirmation…</p>
          )}
          {step === "settling" && <p>Waiting for backend settlement…</p>}
          {step === "settled" && (
            <p>Redeemed successfully. USDC should arrive shortly.</p>
          )}
          {step === "error" && <p className="text-[#ff7b7b]">{errorMsg}</p>}
          {txSig && (
            <p>
              Tx:{" "}
              <a
                className="text-[#9db7ff] underline hover:text-blue-300 transition-colors"
                href={`https://solscan.io/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
              >
                view
              </a>
            </p>
          )}
          {memoId && <p>Memo: {memoId}</p>}
        </div>
      )}

      <InfoDisplay
        title="Redemption Details"
        description="Your AXIS (Token-2022) is transferred to the treasury. The backend then executes the redemption settlement and returns USDC according to the index."
        items={[
          { label: "AXIS Mint", value: AXIS_MINT_2022.toBase58() },
          { label: "Treasury (Owner)", value: TREASURY_OWNER.toBase58() },
          { label: "USDC (devnet)", value: USDC_DEV_MINT.toBase58() },
        ]}
        expectedValue={{
          label: "Expected USDC",
          value: expectedUsdc ? expectedUsdc.toFixed(6) : "—",
          formula: "Formula: Q<sub>USDC</sub> = Q<sub>AXIS</sub> × Index",
        }}
      />
    </aside>
  );
}
