import { useState, useEffect } from 'react';

interface IndexPriceData {
  currentPrice: number;
  normalizedPrice: number | null;
  dailyChange: number | null;
  lastUpdated: string;
  calculationBreakdown: any;
}

interface UseIndexPriceReturn {
  data: IndexPriceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// simple in-memory cache with TTL
let cachedData: IndexPriceData | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000; // 60s

export const useIndexPrice = (): UseIndexPriceReturn => {
  const [data, setData] = useState<IndexPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndexPrice = async () => {
    try {
      setLoading(true);
      setError(null);

      // serve from cache if fresh
      const now = Date.now();
      if (cachedData && now - cachedAt < CACHE_TTL_MS) {
        setData(cachedData);
        return;
      }

      // Fetch index price normalized to 100 at baseline
      const indexRes = await fetch('https://api.axis-protocol.xyz/api/famcindexprice', { cache: 'force-cache' });
      if (!indexRes.ok) {
        throw new Error('Failed to fetch index price from Axis Protocol');
      }
      const indexJson: {
        indexPrice: number; // normalized to 100 at baseline
        baseDate?: string | null;
        baseIndex: number;
        currentIndex: number;
        symbols: string[];
        count: number;
      } = await indexRes.json();

      const result: IndexPriceData = {
        currentPrice: indexJson.currentIndex,
        normalizedPrice: indexJson.indexPrice,
        dailyChange: null, // Not provided by this endpoint
        lastUpdated: new Date().toISOString(),
        calculationBreakdown: {
          source: 'axis-protocol',
          baseDate: indexJson.baseDate ?? null,
          baseIndex: indexJson.baseIndex,
          currentIndex: indexJson.currentIndex,
          symbols: indexJson.symbols,
          count: indexJson.count,
        },
      };

      cachedData = result;
      cachedAt = now;

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexPrice();
  }, []);

  const refetch = () => {
    // bypass cache on manual refetch
    cachedAt = 0;
    fetchIndexPrice();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};
