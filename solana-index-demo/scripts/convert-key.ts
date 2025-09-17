// convert-key.ts (修正版)

import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import bs58 from 'bs58';

// TODO: あなたのキーペアファイルの正しいパスに書き換えてください
const KEYPAIR_PATH = '/Users/kikutayuusuke/.config/solana/id.json';

try {
  // ファイルから秘密鍵を読み込む
  const secretKeyString = fs.readFileSync(KEYPAIR_PATH, 'utf-8');
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  
  // Keypairオブジェクトを作成
  const keypair = Keypair.fromSecretKey(secretKey);

  // Phantomが要求するBase58形式に変換
  const privateKeyBase58 = bs58.encode(keypair.secretKey);

  console.log("✅ 変換に成功しました！");
  console.log("以下の秘密鍵をPhantomに貼り付けてください:");
  console.log("-------------------------------------------------");
  console.log(privateKeyBase58);
  console.log("-------------------------------------------------");

} catch (error) {
  // エラーオブジェクト全体を出力するように修正
  console.error("🛑 変換中にエラーが発生しました:", error);
  console.error("キーペアファイルのパスが正しいか、ファイルの中身が正しいJSON形式か確認してください。");
}