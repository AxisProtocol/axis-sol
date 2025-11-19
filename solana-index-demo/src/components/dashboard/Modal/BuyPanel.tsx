// components/dashboard/Modal/BuyPanel.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  BalanceDisplay,
  InfoDisplay,
  ModalInput,
  PercentageButtons,
  ModalButton,
} from "./ModalComponents";
import {
  useModalLogic,
  USDC_MINT,
  TREASURY_USDC_ATA,
  AXIS_MINT_2022,
  getUserUsdcBalance,
  calculateExpectedTokens,
} from "./modalUtils";

export default function BuyPanel({ indexPrice }: { indexPrice: number | null }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, connected } = wallet;

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [amount, setAmount] = useState("10.0");
  const [busy, setBusy] = useState(false);

  const { networkName } = useModalLogic(true, () => {});

  useEffect(() => {
    if (!publicKey) return setUsdcBalance(0);
    (async () => {
      try {
        const bal = await getUserUsdcBalance(connection, publicKey);
        setUsdcBalance(bal);
      } catch (e) {
        console.error("[BuyPanel] getUserUsdcBalance failed:", e);
        setUsdcBalance(0);
      }
    })();
  }, [publicKey, connection, busy]);

  const expectedAxis = useMemo(() => {
    const q = parseFloat(amount);
    if (!isFinite(q) || q <= 0 || !isFinite(indexPrice ?? NaN)) return 0;
    return calculateExpectedTokens(q, indexPrice!, true);
  }, [amount, indexPrice]);

  const setPct = (p: number) => setAmount((usdcBalance * p).toFixed(6));

  const handleBuy = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet.");
      return;
    }
    if (networkName !== "Devnet") {
      alert("This dApp runs on Devnet only.");
      return;
    }
    const usdcAmount = parseFloat(amount);
    if (!isFinite(usdcAmount) || usdcAmount <= 0) {
      alert("Enter a valid amount.");
      return;
    }
    if (usdcAmount > usdcBalance) {
      alert("Insufficient USDC.");
      return;
    }
    if (!isFinite(indexPrice ?? NaN)) {
      alert("Index price is not available. Try again.");
      return;
    }
    try {
      setBusy(true);
      const { AxisSDK } = await import("@axis-protocol/sdk");
      const sdk = new AxisSDK(connection, wallet as any);
      const { transaction } = await sdk.buildUsdcDepositTransaction(usdcAmount);
      await sendTransaction(transaction, connection);
    } catch (e: any) {
      console.error("[BuyPanel] buy failed:", e);
      alert(e?.message || "Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* ポータルで挿入される WalletAdapter 要素にも効くようにグローバルで強制 */}
      <style jsx global>{`
        :root {
          /* Wallet Adapter のフォント変数を明朝に差し替え */
          --wallet-adapter-font-family: var(--font-serif);
        }
        .wallet-adapter-button,
        .wallet-adapter-modal,
        .wallet-adapter-modal * {
          font-family: var(--font-serif) !important;
        }
      `}</style>

      <aside
        className={`
          bg-base-200/50 border border-base-300 rounded-2xl p-4 space-y-4
          font-serif [&_*]:font-serif
          [&_.btn]:font-serif [&_.badge]:font-serif [&_.dropdown-content]:font-serif
          [&_.wallet-adapter-button]:font-serif
        `}
        /* 念のためローカルでも上書き。WalletAdapter はこの変数を読む */
        style={{
          fontFamily: "var(--font-serif)",
          // Shadow DOM ではないが、変数を明示しておくと確実
          // @ts-ignore: CSS custom property
          ["--wallet-adapter-font-family" as any]: "var(--font-serif)",
        }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Buy</h3>
          <img src="/cap5.png" alt="CaP5 Logo" className="w-12 h-12 object-contain" />
        </div>

        <BalanceDisplay
          items={[
            { label: "Your USDC Balance", value: usdcBalance, decimals: 6 },
            {
              label: "Current Index Price",
              value:
                indexPrice && isFinite(indexPrice)
                  ? `$${indexPrice.toFixed(4)}`
                  : "N/A",
            },
          ]}
        />

        <ModalInput
          id="buy-amt"
          label="Amount to Spend (USDC)"
          value={amount}
          onChange={setAmount}
          min="0"
          step="0.01"
          disabled={busy || !connected}
          inputMode="decimal"
        />

        <PercentageButtons
          onSetPercentage={setPct}
          disabled={busy || !connected}
        />

        <InfoDisplay
          title="Details"
          description=""
          items={[
            { label: "Receiving Token (AXIS)", value: AXIS_MINT_2022.toBase58() },
            { label: "Treasury USDC ATA", value: TREASURY_USDC_ATA.toBase58() },
            { label: "Spending Token (USDC)", value: USDC_MINT.toBase58() },
          ]}
          expectedValue={{
            label: "Expected CaP5",
            value:
              expectedAxis && isFinite(expectedAxis)
                ? `~ ${expectedAxis.toFixed(6)}`
                : "—",
            formula: "Q_AXIS = Q_USDC / Index",
          }}
        />

        {connected ? (
          <ModalButton onClick={handleBuy} disabled={busy || !publicKey}>
            {busy ? "Processing…" : <>Buy Cap5</>}
          </ModalButton>
        ) : (
          <div className="mt-2">
            <WalletMultiButton />
          </div>
        )}
      </aside>
    </>
  );
}
