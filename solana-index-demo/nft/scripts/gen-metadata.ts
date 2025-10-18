// nft/scripts/gen-metadata.ts
import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "nft/assets");
const SRC_PNG = path.join(process.cwd(), "nft/og_badge.png");
const TOTAL = 1000;

const base = {
  name: "Axis OG Badge",
  symbol: "AXISOG",
  description:
    "Non-transferable OG badge for early Discord OG members. Grants access to future benefits and incentives on mainnet.",
  image: "og_badge.png",
  attributes: [
    { trait_type: "Badge", value: "OG" },
    { trait_type: "Transferability", value: "Non-Transferable" },
    { trait_type: "Whitelist", value: "Discord OG" }
  ],
  properties: {
    files: [{ uri: "og_badge.png", type: "image/png" }],
    category: "image"
  },
  collection: { name: "Axis OG Collection", family: "AXIS" },
  external_url: "https://axis-protocol.xyz/claim",
  seller_fee_basis_points: 0
};

if (!fs.existsSync(SRC_PNG)) {
  console.error("❌ nft/og_badge.png が見つかりません。先に置いてください。");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (let i = 0; i < TOTAL; i++) {
  const json = {
    ...base,
    name: `Axis OG Badge #${i + 1}`,
    attributes: [
      ...base.attributes,
      { trait_type: "Edition", value: `${i + 1}/${TOTAL}` }
    ]
  };
  fs.copyFileSync(SRC_PNG, path.join(OUT_DIR, `${i}.png`));
  fs.writeFileSync(path.join(OUT_DIR, `${i}.json`), JSON.stringify(json, null, 2), "utf8");
}

console.log(`✅ Generated ${TOTAL * 2} files in nft/assets`);
