# Axis

![GitHub License](https://img.shields.io/github/license/AxisProtocol/axis-sol) ![NPM Downloads](https://img.shields.io/npm/d18m/%40axis-protocol%2Fsdk)

**Axis** is the first crypto index built on Solana that lets investors gain diversified exposure to the digital asset market with a single token.

## Axis index

The **Axis Index** is the first full fledged benchmark on Solana that reflects the performance of top tier assets from across the entire crypto market.
Composed of a multi-chain basket of assets, it serves as a new financial Lego block for the DeFi ecosystem.

> **Research & Methodology:**
> The quantitative methodology behind the index construction (Inverse Volatility Weighting) and its 5-year empirical backtest are detailed in the following research paper, authored by our founder, **Yusuke Kikuta (Muse)**.
>
> **Kikuta, Yusuke (Muse). (2025). *An Empirical Analysis of the Inverse Volatility Weighted Top-5 Crypto Index (AXIS): A Comparison with MCW_Cap40 and SOL Buy-and-Hold*. Zenodo.**
> **[https://doi.org/10.5281/zenodo.17521527](https://doi.org/10.5281/zenodo.17521527)**

## Axis token

The **Axis Token** tracks the performance of the Axis Index.
By holding this single token, users gain exposure to the entire market without managing multiple assets or chains.

## Axis SDK

The Axis SDK helps developers interact with the Axis Protocol without manually constructing complex Solana transactions.

### Key Features

- Build valid **mint** (USDC → Treasury) and **burn** (AXIS → Treasury) transactions
- Automatically attach unique memo IDs for tracking and reconciliation
- Built on modern Solana APIs (`VersionedTransaction`, Token-2022)
- Wallet agnostic — works with Phantom, Backpack, Solflare, etc.

### 📦 Installation

```bash
npm install @solana/web3.js @solana/spl-token buffer
# or
yarn add @solana/web3.js @solana/spl-token buffer
```

Then import the SDK:

```ts
import { AxisSDK } from './src/axis-sdk/AxisSDK'
```

### Usage

1. Initialize

```ts
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { AxisSDK } from './src/axis-sdk/AxisSDK'

const connection = new Connection(clusterApiUrl('devnet'))
const wallet = {
  publicKey: myPublicKey,
  signTransaction: async (tx) => await myWallet.signTransaction(tx),
  signAllTransactions: async (txs) => await myWallet.signAllTransactions(txs),
}

const sdk = new AxisSDK(connection, wallet)
```

2. Deposit USDC

```ts
const { transaction, memoId } = await sdk.buildUsdcDepositTransaction(10) // 10 USDC
console.log('Memo ID:', memoId)

const signedTx = await wallet.signTransaction(transaction)
const txid = await connection.sendTransaction(signedTx)
console.log('Transaction ID:', txid)
```

3. Deposit AXIS

```ts
const { transaction, memoId } = await sdk.buildIndexTokenDepositTransaction(10) // 10 AXIS
console.log('Memo ID:', memoId)

const signedTx = await wallet.signTransaction(transaction)
const txid = await connection.sendTransaction(signedTx)
console.log('Transaction ID:', txid)
```
