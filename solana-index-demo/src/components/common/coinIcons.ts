'use client';

// Centralized CoinGecko icon URLs for reuse across the app.
// Keys should be uppercase ticker symbols.
export const coinIcons: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  TRX: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  SUI: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg',
  LINK: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  HLP: 'https://assets.coingecko.com/coins/images/50882/large/hyperliquid.jpg',
  XLM: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
};

export function getCoinIcon(symbol: string, fallback?: string): string {
  const key = (symbol || '').toUpperCase();
  return coinIcons[key] || fallback || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png';
}


