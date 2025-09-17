import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    AddressLookupTableProgram,
  } from '@solana/web3.js';
  import { createJupiterApiClient } from '@jup-ag/api';
  import fs from 'fs';
  import os from 'os';
  import path from 'path';
  
  // グローバルフェッチを設定
  global.fetch = fetch;
  
  // --- 設定項目 ---
  
  // 1. 接続先ネットワーク
  const RPC_ENDPOINT = 'https://api.devnet.solana.com';
  const connection = new Connection(RPC_ENDPOINT);
  
  // 2. 支払いと権限を持つウォレットを取得する関数
  function getPayer(): Keypair {
    try {
      const defaultKeypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
      if (fs.existsSync(defaultKeypairPath)) {
        console.log(`Found default Solana CLI keypair at: ${defaultKeypairPath}`);
        const secretKey = new Uint8Array(JSON.parse(fs.readFileSync(defaultKeypairPath, 'utf-8')));
        return Keypair.fromSecretKey(secretKey);
      }
    } catch (err) {
      console.warn('Could not load default Solana CLI keypair. Ensure it is a valid keypair file.');
    }
    throw new Error(
      'Payer keypair not found. Please ensure your Solana CLI is set up with a default keypair (at ~/.config/solana/id.json).'
    );
  }
  
  // 3. プロジェクトの定数
  
  const INPUT_MINT = new PublicKey('So11111111111111111111111111111111111111112'); // Wrapped SOL
  
  const TREASURY_WALLET_ADDRESS = new PublicKey('BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj');
  
  // 【最終修正】構成銘柄を、Devnetで流動性が保証されている公式・準公式トークンに完全に入れ替え
  const CONSTITUENT_MINTS = [
      new PublicKey('So11111111111111111111111111111111111111112'), // SOL
      new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'), // USDC (Devnet)
      new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), // USDT (Devnet)
      new PublicKey('MarB2vj21K4g2dJAnWTCT22tPLoT22GgR42aVjXgSE1'), // mSOL (Devnet)
      new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'), // JitoSOL (Devnet)
      new PublicKey('HZ1JovNiVvGrGNiiYvEozEVgZ58AteCaStRRrdkvggS4'), // PYTH (Devnet)
      new PublicKey('jtojtomepa8beP8AuQc6eXt5Fri4AftNBb2MCEssPzz'), // JTO (Devnet)
      new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'), // SRM (Classic Devnet)
      new PublicKey('GeDSbC4QXoPZor63Pi374p9i5sRjG5B951L53x9s1bA'), // Test Token A
      new PublicKey('85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ'), // Test Token B
  ];
  
  /**
   * Jupiter APIを叩いて、スワップに必要なすべてのアドレスを動的に収集する関数
   */
  async function fetchAllRequiredAddresses() {
    console.log('Fetching all required addresses from Jupiter API...');
    
    const jupiterApi = createJupiterApiClient({
      basePath: 'https://quote-api.jup.ag/v6',
    });
  
    const addressSet = new Set<string>();
  
    addressSet.add(INPUT_MINT.toBase58());
    addressSet.add(TREASURY_WALLET_ADDRESS.toBase58());
    CONSTITUENT_MINTS.forEach(mint => addressSet.add(mint.toBase58()));
  
    const quotePromises = CONSTITUENT_MINTS.map(async (mint) => {
      if (INPUT_MINT.equals(mint)) return null;
  
      const outputMintAddress = mint.toBase58();
      console.log(`-> Fetching quote for: SOL -> ${outputMintAddress}`);
      try {
        const quote = await jupiterApi.quoteGet({
          inputMint: INPUT_MINT.toBase58(),
          outputMint: outputMintAddress,
          amount: 10_000_000, // 0.01 SOL
          onlyDirectRoutes: false,
        });
        return quote;
      } catch (e: any) {
        console.error(`--- ERROR fetching quote for ${outputMintAddress} ---`);
        if (e.response) {
          console.error(`Status: ${e.response.status} ${e.response.statusText}`);
          const errorBody = await e.response.text();
          console.error(`Body: ${errorBody}`);
        } else if (e instanceof Error) {
          console.error(`Error: ${e.message}`);
        } else {
          console.error('An unknown error occurred', e);
        }
        console.error('--------------------------------------------------');
        return null;
      }
    });
  
    const quotes = await Promise.all(quotePromises);
  
    for (const quote of quotes) {
      if (!quote) continue;
      
      const anyQuote = quote as any;
  
      if (anyQuote.marketInfos && Array.isArray(anyQuote.marketInfos)) {
        for (const marketInfo of anyQuote.marketInfos) {
          if (marketInfo.id) addressSet.add(marketInfo.id);
          if (marketInfo.lpMint) addressSet.add(marketInfo.lpMint);
          if (marketInfo.inputMint) addressSet.add(marketInfo.inputMint);
          if (marketInfo.outputMint) addressSet.add(marketInfo.outputMint);
        }
      }
    }
  
    console.log(`Found ${addressSet.size} unique addresses.`);
    return Array.from(addressSet).map(addr => new PublicKey(addr));
  }
  
  /**
   * メインの実行関数
   */
  async function main() {
    const payer = getPayer();
    console.log(`Payer wallet address: ${payer.publicKey.toBase58()}`);
    
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Payer balance: ${balance / 1e9} SOL`);
    if (balance < 0.01) {
      console.error('Payer account has insufficient SOL. Please fund it with at least 0.01 Devnet SOL.');
      return;
    }
  
    const addresses = await fetchAllRequiredAddresses();
    if (addresses.length <= CONSTITUENT_MINTS.length + 1) {
      console.error("Could not fetch dynamic addresses from Jupiter. Aborting LUT creation.");
      return;
    }
  
    const [lookupTableInst, lookupTableAddress] =
      AddressLookupTableProgram.createLookupTable({
        authority: payer.publicKey,
        payer: payer.publicKey,
        recentSlot: await connection.getSlot(),
      });
  
    console.log(`Lookup Table Address will be: ${lookupTableAddress.toBase58()}`);
  
    const createLutTx = new Transaction().add(lookupTableInst);
    try {
      const createTxid = await sendAndConfirmTransaction(connection, createLutTx, [payer]);
      console.log(`✅ LUT created successfully. Tx: ${createTxid}`);
    } catch (e) {
      if (e instanceof Error) {
          console.warn("Failed to create LUT. It might already exist.", e.message);
      } else {
          console.warn("Failed to create LUT with an unknown error.", e);
      }
    }
    
    console.log("Waiting for LUT to be confirmed on-chain...");
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    const chunkSize = 20;
    for (let i = 0; i < addresses.length; i += chunkSize) {
      const chunk = addresses.slice(i, i + chunkSize);
      console.log(`\nExtending LUT with chunk ${i/chunkSize + 1}...`);
      
      const extendInstruction = AddressLookupTableProgram.extendLookupTable({
        payer: payer.publicKey,
        authority: payer.publicKey,
        lookupTable: lookupTableAddress,
        addresses: chunk,
      });
  
      const extendTx = new Transaction().add(extendInstruction);
      try {
        const extendTxid = await sendAndConfirmTransaction(connection, extendTx, [payer]);
        console.log(`✅ Extended LUT with ${chunk.length} addresses. Tx: ${extendTxid}`);
      } catch(e) {
        if (e instanceof Error) {
          console.error(`Failed to extend LUT: ${e.message}`);
        } else {
          console.error('An unknown error occurred while extending LUT', e);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  
    console.log("\n🎉 --- All done! --- 🎉");
    console.log("Copy this Address Lookup Table address and paste it into your AxisSDK.js:");
    console.log(`\n${lookupTableAddress.toBase58()}\n`);
  }
  
  main().catch(err => {
    console.error(err);
  });