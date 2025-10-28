This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

###  1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API

The waitlist functionality now uses the external API at `https://api.axis-protocol.xyz/api/waitlist`.

### Test with curl

```bash
curl -X POST https://api.axis-protocol.xyz/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "consentMarketing": true,
    "source": "website"
  }'
```
