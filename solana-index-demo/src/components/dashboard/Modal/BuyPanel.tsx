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

export default function BuyPanel({
  indexPrice,
}: {
  indexPrice: number | null;
}) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, connected } = wallet;

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [amount, setAmount] = useState("10.0");
  const [busy, setBusy] = useState(false);

  const { networkName } = useModalLogic(true, () => {}); // フォーカス制御だけ利用

  useEffect(() => {
    if (publicKey)
      getUserUsdcBalance(connection, publicKey).then(setUsdcBalance);
  }, [publicKey, connection, busy]);

  const expectedAxis = useMemo(() => {
    const q = parseFloat(amount);
    return calculateExpectedTokens(q, indexPrice, true);
  }, [amount, indexPrice]);

  const setPct = (p: number) => {
    const v = usdcBalance * p;
    setAmount(v.toFixed(6));
  };

  const handleBuy = async () => {
    if (!connected || !publicKey || !wallet.signTransaction)
      return alert("Please connect your wallet.");
    if (networkName !== "Devnet")
      return alert("This dApp runs on Devnet only.");

    const usdcAmount = parseFloat(amount);
    if (!isFinite(usdcAmount) || usdcAmount <= 0)
      return alert("Enter a valid amount.");
    if (usdcAmount > usdcBalance) return alert("Insufficient USDC.");

    try {
      setBusy(true);
      const { AxisSDK } = await import("@axis-protocol/sdk");
      const sdk = new AxisSDK(connection, wallet as any);
      const { transaction } = await sdk.buildUsdcDepositTransaction(usdcAmount);
      await sendTransaction(transaction, connection);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="bg-base-200/50 border border-base-300 rounded-2xl p-4 space-y-4">
      <h3 className="text-lg font-semibold">Buy AXIS</h3>

      <BalanceDisplay
        items={[
          { label: "Your USDC Balance", value: usdcBalance, decimals: 6 },
          {
            label: "Current Index Price",
            value: indexPrice ? `$${indexPrice.toFixed(4)}` : "N/A",
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
          label: "Expected AXIS",
          value: expectedAxis ? `~ ${expectedAxis.toFixed(6)}` : "—",
          formula: "Q_AXIS = Q_USDC / Index",
        }}
      />

      {connected ? (
        <ModalButton onClick={handleBuy} disabled={busy || !publicKey}>
          {busy ? "Processing…" : "Buy AXIS"}
        </ModalButton>
      ) : (
        <div className="mt-2">
          <WalletMultiButton />
        </div>
      )}
    </aside>
  );
}
