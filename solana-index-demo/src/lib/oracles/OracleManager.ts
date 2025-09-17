import { ethers } from 'ethers';
const TronWeb = require('tronweb'); 
import { PriceStrategy, ASSET_PRICE_STRATEGIES } from '../config/oracleStrategies';
import { getChainlinkPrice } from './providers/chainlink';
import { getPythPrice } from './providers/pyth';

export class OracleManager {
  private providers: Map<string, any> = new Map();

  constructor() {
    // EVM系プロバイダー
    if (process.env.ETHEREUM_RPC_URL) {
      this.providers.set('ethereum', new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL));
    }
    if (process.env.BNB_CHAIN_RPC_URL) { 
      this.providers.set('bsc', new ethers.JsonRpcProvider(process.env.BNB_CHAIN_RPC_URL));
    }
    if (process.env.AVALANCHE_RPC_URL) {
      this.providers.set('avalanche', new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL));
    }
    
    // TRONプロバイダー
    // ▼▼▼ ここを最終修正 ▼▼▼
    // new TronWeb.default(...) -> new TronWeb.TronWeb(...)
    const tronWeb = new TronWeb.TronWeb({
        fullHost: 'https://rpc.ankr.com/tron',
    });
    this.providers.set('tron', tronWeb);
  }

  // ... 以下の部分は変更なし ...
  async getAssetPrice(symbol: string): Promise<number> {
    const strategies = ASSET_PRICE_STRATEGIES[symbol];
    if (!strategies || strategies.length === 0) {
      throw new Error(`No price strategy found for symbol: ${symbol}`);
    }

    for (const strategy of strategies) {
      try {
        const price = await this.fetchPriceFromStrategy(strategy);
        if (price > 0) {
          console.log(`Successfully fetched ${symbol} price from ${strategy.type} source.`);
          return price;
        }
      } catch (error: any) {
        console.warn(`Failed to fetch ${symbol} from ${strategy.type}. Reason: ${error.message}. Trying next strategy...`);
      }
    }
    throw new Error(`Failed to fetch price for ${symbol} from all available sources.`);
  }

  private async fetchPriceFromStrategy(strategy: PriceStrategy): Promise<number> {
    switch (strategy.type) {
      case 'chainlink': {
        if (!strategy.chain || !strategy.address) throw new Error('Chainlink strategy requires a chain and address.');
        const provider = this.providers.get(strategy.chain);
        if (!provider) throw new Error(`Provider for chain '${strategy.chain}' is not initialized.`);
        return getChainlinkPrice(provider, strategy.address);
      }
      
      case 'pyth': {
        if (!strategy.feedId) throw new Error('Pyth strategy requires a feedId.');
        return getPythPrice(strategy.feedId);
      }

      default:
        // @ts-ignore
        throw new Error(`Unsupported oracle type: ${strategy.type}`);
    }
  }
}