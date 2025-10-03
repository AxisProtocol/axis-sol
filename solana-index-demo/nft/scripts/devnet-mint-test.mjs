import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getMintLen,
  createMintToInstruction
} from "@solana/spl-token-2022";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID, createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import fs from "fs";

const DEVNET_RPC = "https://api.devnet.solana.com";
const connection = new Connection(DEVNET_RPC, "confirmed");

// サーバ権限（Devnetのテスト用）— id.json を使う例（危険：本番はKMS推奨）
const secret = JSON.parse(fs.readFileSync(process.env.KEYPAIR || process.env.HOME + "/.config/solana/id.json", "utf8"));
const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(secret));

// 受取先（Phantom Devnet の公開鍵に置換）
const OWNER = new PublicKey(process.env.OWNER || "PASTE_DEVNET_PUBLIC_KEY_HERE");

// 先ほどの devnet.json から1つURIを拾う
const cache = JSON.parse(fs.readFileSync(".sugar/devnet.json", "utf8"));
const firstItem = cache.items[0]; // { name, image_link, link, ... }
const URI = firstItem.link;

const NAME = firstItem.name || "Axis OG Badge #1";
const SYMBOL = "AXISOG";

(async () => {
  const mint = Keypair.generate();
  const extensions = ["NonTransferable"];
  const mintLen = getMintLen(extensions);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

  const ata = getAssociatedTokenAddressSync(mint.publicKey, OWNER, false, TOKEN_2022_PROGRAM_ID);

  const ixes = [];

  ixes.push(SystemProgram.createAccount({
    fromPubkey: mintAuthority.publicKey,
    newAccountPubkey: mint.publicKey,
    lamports,
    space: mintLen,
    programId: TOKEN_2022_PROGRAM_ID
  }));
  ixes.push(createInitializeNonTransferableMintInstruction(mint.publicKey, TOKEN_2022_PROGRAM_ID));
  ixes.push(createInitializeMintInstruction(mint.publicKey, 0, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID));
  ixes.push(createAssociatedTokenAccountInstruction(mintAuthority.publicKey, ata, OWNER, mint.publicKey, TOKEN_2022_PROGRAM_ID));
  ixes.push(createMintToInstruction(mint.publicKey, ata, mintAuthority.publicKey, 1, [], TOKEN_2022_PROGRAM_ID));

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
  ixes.push(createCreateMetadataAccountV3Instruction(
    { metadata: metadataPda, mint: mint.publicKey, mintAuthority: mintAuthority.publicKey, payer: mintAuthority.publicKey, updateAuthority: mintAuthority.publicKey },
    { createMetadataAccountArgsV3: { data: { name: NAME, symbol: SYMBOL, uri: URI, sellerFeeBasisPoints: 0, creators: null, collection: null, uses: null }, isMutable: false, collectionDetails: null } }
  ));

  const tx = new Transaction().add(...ixes);
  tx.feePayer = mintAuthority.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

  tx.sign(mintAuthority, mint);
  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(sig, "confirmed");

  console.log("✅ Minted on Devnet");
  console.log("Signature:", sig);
  console.log("Mint:", mint.publicKey.toBase58());
  console.log("Owner:", OWNER.toBase58());
})();
