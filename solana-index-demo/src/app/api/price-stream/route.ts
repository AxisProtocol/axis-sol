import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Feed IDs expected by the client mapping in DashboardClient
const FEED_IDS = [
  'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC
  'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL
  '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB
  'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', // XRP
  'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c', // DOGE
  '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d', // ADA
  '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7', // AVAX
  '67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b', // TRX
  '23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744', // SUI
]

function makePrices() {
  // Mock prices around a baseline per asset
  const baselines: Record<string, number> = {
    BTC: 60000,
    ETH: 3000,
    SOL: 150,
    BNB: 500,
    XRP: 0.6,
    DOGE: 0.15,
    ADA: 0.8,
    AVAX: 35,
    TRX: 0.13,
    SUI: 1.3,
  }
  // expo 0 to match client logic (they also check exponent)
  const expo = 0
  return FEED_IDS.map((id) => {
    // Pick a symbol by id suffix heuristic just for mock shaping
    let symbol: keyof typeof baselines = 'BTC'
    if (id.startsWith('ff6149')) symbol = 'ETH'
    else if (id.startsWith('ef0d8b')) symbol = 'SOL'
    else if (id.startsWith('2f9586')) symbol = 'BNB'
    else if (id.startsWith('ec5d39')) symbol = 'XRP'
    else if (id.startsWith('dcef50')) symbol = 'DOGE'
    else if (id.startsWith('2a01de')) symbol = 'ADA'
    else if (id.startsWith('93da33')) symbol = 'AVAX'
    else if (id.startsWith('67aed5')) symbol = 'TRX'
    else if (id.startsWith('23d731')) symbol = 'SUI'
    const base = baselines[symbol]
    const jitter = base * (Math.random() - 0.5) * 0.004 // ±0.2%
    const price = Math.max(0, base + jitter)
    return { id, price: { price, expo } }
  })
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  const { signal } = request

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Send an initial comment to establish the stream quickly
      controller.enqueue(encoder.encode(`: connected\n\n`))

      const send = () => {
        const payload = makePrices()
        const message = { type: 'prices', payload }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
      }

      // Send immediately, then on interval
      send()
      const intervalId = setInterval(send, 1000)

      // Heartbeat every 15s to keep intermediaries from closing the stream
      const heartbeatId = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`))
      }, 15000)

      // Handle client abort/close
      const onAbort = () => {
        clearInterval(intervalId)
        clearInterval(heartbeatId)
        try { controller.close() } catch {}
      }
      signal.addEventListener('abort', onAbort)
    },
    cancel() {
      // No-op; timers are cleared on abort above
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // helpful for some proxies
      // CORS not strictly needed for same-origin EventSource, but harmless
      'Access-Control-Allow-Origin': '*',
    },
  })
}
