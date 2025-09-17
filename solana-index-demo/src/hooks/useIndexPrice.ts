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

export const useIndexPrice = (): UseIndexPriceReturn => {
  const [data, setData] = useState<IndexPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndexPrice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/get-index-price');
      if (!response.ok) {
        throw new Error('Failed to fetch index price');
      }
      
      const result = await response.json();
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
    fetchIndexPrice();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};
