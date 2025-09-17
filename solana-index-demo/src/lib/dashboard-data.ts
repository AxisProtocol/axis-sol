// dashboard-data.ts - Static data for dashboard to avoid fs.readFile in Cloudflare Workers

export interface DashboardDataPoint {
  created_at: string;
  index_value: number;
}

export interface EChartsDataPoint {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
}

// Sample data points for the dashboard
export const dashboardData: DashboardDataPoint[] = [
  { created_at: '2025-01-01T00:00:00Z', index_value: 100.0 },
  { created_at: '2025-01-02T00:00:00Z', index_value: 102.5 },
  { created_at: '2025-01-03T00:00:00Z', index_value: 101.8 },
  { created_at: '2025-01-04T00:00:00Z', index_value: 104.2 },
  { created_at: '2025-01-05T00:00:00Z', index_value: 103.9 },
  { created_at: '2025-01-06T00:00:00Z', index_value: 106.1 },
  { created_at: '2025-01-07T00:00:00Z', index_value: 105.7 },
  { created_at: '2025-01-08T00:00:00Z', index_value: 108.3 },
  { created_at: '2025-01-09T00:00:00Z', index_value: 107.8 },
  { created_at: '2025-01-10T00:00:00Z', index_value: 110.2 },
  { created_at: '2025-01-11T00:00:00Z', index_value: 109.9 },
  { created_at: '2025-01-12T00:00:00Z', index_value: 112.5 },
  { created_at: '2025-01-13T00:00:00Z', index_value: 111.8 },
  { created_at: '2025-01-14T00:00:00Z', index_value: 114.2 },
  { created_at: '2025-01-15T00:00:00Z', index_value: 113.9 },
  { created_at: '2025-01-16T00:00:00Z', index_value: 116.1 },
  { created_at: '2025-01-17T00:00:00Z', index_value: 115.7 },
  { created_at: '2025-01-18T00:00:00Z', index_value: 118.3 },
  { created_at: '2025-01-19T00:00:00Z', index_value: 117.8 },
  { created_at: '2025-01-20T00:00:00Z', index_value: 120.2 },
  { created_at: '2025-01-21T00:00:00Z', index_value: 119.9 },
  { created_at: '2025-01-22T00:00:00Z', index_value: 122.5 },
  { created_at: '2025-01-23T00:00:00Z', index_value: 121.8 },
  { created_at: '2025-01-24T00:00:00Z', index_value: 124.2 },
  { created_at: '2025-01-25T00:00:00Z', index_value: 123.9 },
  { created_at: '2025-01-26T00:00:00Z', index_value: 126.1 },
  { created_at: '2025-01-27T00:00:00Z', index_value: 125.7 },
  { created_at: '2025-01-28T00:00:00Z', index_value: 128.3 },
  { created_at: '2025-01-29T00:00:00Z', index_value: 127.8 },
  { created_at: '2025-01-30T00:00:00Z', index_value: 130.2 },
  { created_at: '2025-01-31T00:00:00Z', index_value: 129.9 },
  { created_at: '2025-02-01T00:00:00Z', index_value: 132.5 },
  { created_at: '2025-02-02T00:00:00Z', index_value: 131.8 },
  { created_at: '2025-02-03T00:00:00Z', index_value: 134.2 },
  { created_at: '2025-02-04T00:00:00Z', index_value: 133.9 },
  { created_at: '2025-02-05T00:00:00Z', index_value: 136.1 },
  { created_at: '2025-02-06T00:00:00Z', index_value: 135.7 },
  { created_at: '2025-02-07T00:00:00Z', index_value: 138.3 },
  { created_at: '2025-02-08T00:00:00Z', index_value: 137.8 },
  { created_at: '2025-02-09T00:00:00Z', index_value: 140.2 },
  { created_at: '2025-02-10T00:00:00Z', index_value: 139.9 },
  { created_at: '2025-02-11T00:00:00Z', index_value: 142.5 },
  { created_at: '2025-02-12T00:00:00Z', index_value: 141.8 },
  { created_at: '2025-02-13T00:00:00Z', index_value: 144.2 },
  { created_at: '2025-02-14T00:00:00Z', index_value: 143.9 },
  { created_at: '2025-02-15T00:00:00Z', index_value: 146.1 },
  { created_at: '2025-02-16T00:00:00Z', index_value: 145.7 },
  { created_at: '2025-02-17T00:00:00Z', index_value: 148.3 },
  { created_at: '2025-02-18T00:00:00Z', index_value: 147.8 },
  { created_at: '2025-02-19T00:00:00Z', index_value: 150.2 },
  { created_at: '2025-02-20T00:00:00Z', index_value: 149.9 },
  { created_at: '2025-02-21T00:00:00Z', index_value: 152.5 },
  { created_at: '2025-02-22T00:00:00Z', index_value: 151.8 },
  { created_at: '2025-02-23T00:00:00Z', index_value: 154.2 },
  { created_at: '2025-02-24T00:00:00Z', index_value: 153.9 },
  { created_at: '2025-02-25T00:00:00Z', index_value: 156.1 },
  { created_at: '2025-02-26T00:00:00Z', index_value: 155.7 },
  { created_at: '2025-02-27T00:00:00Z', index_value: 158.3 },
  { created_at: '2025-02-28T00:00:00Z', index_value: 157.8 },
  { created_at: '2025-03-01T00:00:00Z', index_value: 160.2 },
  { created_at: '2025-03-02T00:00:00Z', index_value: 159.9 },
  { created_at: '2025-03-03T00:00:00Z', index_value: 162.5 },
  { created_at: '2025-03-04T00:00:00Z', index_value: 161.8 },
  { created_at: '2025-03-05T00:00:00Z', index_value: 164.2 },
  { created_at: '2025-03-06T00:00:00Z', index_value: 163.9 },
  { created_at: '2025-03-07T00:00:00Z', index_value: 166.1 },
  { created_at: '2025-03-08T00:00:00Z', index_value: 165.7 },
  { created_at: '2025-03-09T00:00:00Z', index_value: 168.3 },
  { created_at: '2025-03-10T00:00:00Z', index_value: 167.8 },
  { created_at: '2025-03-11T00:00:00Z', index_value: 170.2 },
  { created_at: '2025-03-12T00:00:00Z', index_value: 169.9 },
  { created_at: '2025-03-13T00:00:00Z', index_value: 172.5 },
  { created_at: '2025-03-14T00:00:00Z', index_value: 171.8 },
  { created_at: '2025-03-15T00:00:00Z', index_value: 174.2 },
  { created_at: '2025-03-16T00:00:00Z', index_value: 173.9 },
  { created_at: '2025-03-17T00:00:00Z', index_value: 176.1 },
  { created_at: '2025-03-18T00:00:00Z', index_value: 175.7 },
  { created_at: '2025-03-19T00:00:00Z', index_value: 178.3 },
  { created_at: '2025-03-20T00:00:00Z', index_value: 177.8 },
  { created_at: '2025-03-21T00:00:00Z', index_value: 180.2 },
  { created_at: '2025-03-22T00:00:00Z', index_value: 179.9 },
  { created_at: '2025-03-23T00:00:00Z', index_value: 182.5 },
  { created_at: '2025-03-24T00:00:00Z', index_value: 181.8 },
  { created_at: '2025-03-25T00:00:00Z', index_value: 184.2 },
  { created_at: '2025-03-26T00:00:00Z', index_value: 183.9 },
  { created_at: '2025-03-27T00:00:00Z', index_value: 186.1 },
  { created_at: '2025-03-28T00:00:00Z', index_value: 185.7 },
  { created_at: '2025-03-29T00:00:00Z', index_value: 188.3 },
  { created_at: '2025-03-30T00:00:00Z', index_value: 187.8 },
  { created_at: '2025-03-31T00:00:00Z', index_value: 190.2 },
  { created_at: '2025-04-01T00:00:00Z', index_value: 189.9 },
  { created_at: '2025-04-02T00:00:00Z', index_value: 192.5 },
  { created_at: '2025-04-03T00:00:00Z', index_value: 191.8 },
  { created_at: '2025-04-04T00:00:00Z', index_value: 194.2 },
  { created_at: '2025-04-05T00:00:00Z', index_value: 193.9 },
  { created_at: '2025-04-06T00:00:00Z', index_value: 196.1 },
  { created_at: '2025-04-07T00:00:00Z', index_value: 195.7 },
  { created_at: '2025-04-08T00:00:00Z', index_value: 198.3 },
  { created_at: '2025-04-09T00:00:00Z', index_value: 197.8 },
  { created_at: '2025-04-10T00:00:00Z', index_value: 200.2 },
  { created_at: '2025-04-11T00:00:00Z', index_value: 199.9 },
  { created_at: '2025-04-12T00:00:00Z', index_value: 202.5 },
  { created_at: '2025-04-13T00:00:00Z', index_value: 201.8 },
  { created_at: '2025-04-14T00:00:00Z', index_value: 204.2 },
  { created_at: '2025-04-15T00:00:00Z', index_value: 203.9 },
  { created_at: '2025-04-16T00:00:00Z', index_value: 206.1 },
  { created_at: '2025-04-17T00:00:00Z', index_value: 205.7 },
  { created_at: '2025-04-18T00:00:00Z', index_value: 208.3 },
  { created_at: '2025-04-19T00:00:00Z', index_value: 207.8 },
  { created_at: '2025-04-20T00:00:00Z', index_value: 210.2 },
  { created_at: '2025-04-21T00:00:00Z', index_value: 209.9 },
  { created_at: '2025-04-22T00:00:00Z', index_value: 212.5 },
  { created_at: '2025-04-23T00:00:00Z', index_value: 211.8 },
  { created_at: '2025-04-24T00:00:00Z', index_value: 214.2 },
  { created_at: '2025-04-25T00:00:00Z', index_value: 213.9 },
  { created_at: '2025-04-26T00:00:00Z', index_value: 216.1 },
  { created_at: '2025-04-27T00:00:00Z', index_value: 215.7 },
  { created_at: '2025-04-28T00:00:00Z', index_value: 218.3 },
  { created_at: '2025-04-29T00:00:00Z', index_value: 217.8 },
  { created_at: '2025-04-30T00:00:00Z', index_value: 220.2 },
  { created_at: '2025-05-01T00:00:00Z', index_value: 219.9 },
  { created_at: '2025-05-02T00:00:00Z', index_value: 222.5 },
  { created_at: '2025-05-03T00:00:00Z', index_value: 221.8 },
  { created_at: '2025-05-04T00:00:00Z', index_value: 224.2 },
  { created_at: '2025-05-05T00:00:00Z', index_value: 223.9 },
  { created_at: '2025-05-06T00:00:00Z', index_value: 226.1 },
  { created_at: '2025-05-07T00:00:00Z', index_value: 225.7 },
  { created_at: '2025-05-08T00:00:00Z', index_value: 228.3 },
  { created_at: '2025-05-09T00:00:00Z', index_value: 227.8 },
  { created_at: '2025-05-10T00:00:00Z', index_value: 230.2 },
  { created_at: '2025-05-11T00:00:00Z', index_value: 229.9 },
  { created_at: '2025-05-12T00:00:00Z', index_value: 232.5 },
  { created_at: '2025-05-13T00:00:00Z', index_value: 231.8 },
  { created_at: '2025-05-14T00:00:00Z', index_value: 234.2 },
  { created_at: '2025-05-15T00:00:00Z', index_value: 233.9 },
  { created_at: '2025-05-16T00:00:00Z', index_value: 236.1 },
  { created_at: '2025-05-17T00:00:00Z', index_value: 235.7 },
  { created_at: '2025-05-18T00:00:00Z', index_value: 238.3 },
  { created_at: '2025-05-19T00:00:00Z', index_value: 237.8 },
  { created_at: '2025-05-20T00:00:00Z', index_value: 240.2 },
  { created_at: '2025-05-21T00:00:00Z', index_value: 239.9 },
  { created_at: '2025-05-22T00:00:00Z', index_value: 242.5 },
  { created_at: '2025-05-23T00:00:00Z', index_value: 241.8 },
  { created_at: '2025-05-24T00:00:00Z', index_value: 244.2 },
  { created_at: '2025-05-25T00:00:00Z', index_value: 243.9 },
  { created_at: '2025-05-26T00:00:00Z', index_value: 246.1 },
  { created_at: '2025-05-27T00:00:00Z', index_value: 245.7 },
  { created_at: '2025-05-28T00:00:00Z', index_value: 248.3 },
  { created_at: '2025-05-29T00:00:00Z', index_value: 247.8 },
  { created_at: '2025-05-30T00:00:00Z', index_value: 250.2 },
  { created_at: '2025-05-31T00:00:00Z', index_value: 249.9 },
  { created_at: '2025-06-01T00:00:00Z', index_value: 252.5 },
  { created_at: '2025-06-02T00:00:00Z', index_value: 251.8 },
  { created_at: '2025-06-03T00:00:00Z', index_value: 254.2 },
  { created_at: '2025-06-04T00:00:00Z', index_value: 253.9 },
  { created_at: '2025-06-05T00:00:00Z', index_value: 256.1 },
  { created_at: '2025-06-06T00:00:00Z', index_value: 255.7 },
  { created_at: '2025-06-07T00:00:00Z', index_value: 258.3 },
  { created_at: '2025-06-08T00:00:00Z', index_value: 257.8 },
  { created_at: '2025-06-09T00:00:00Z', index_value: 260.2 },
  { created_at: '2025-06-10T00:00:00Z', index_value: 259.9 },
  { created_at: '2025-06-11T00:00:00Z', index_value: 262.5 },
  { created_at: '2025-06-12T00:00:00Z', index_value: 261.8 },
  { created_at: '2025-06-13T00:00:00Z', index_value: 264.2 },
  { created_at: '2025-06-14T00:00:00Z', index_value: 263.9 },
  { created_at: '2025-06-15T00:00:00Z', index_value: 266.1 },
  { created_at: '2025-06-16T00:00:00Z', index_value: 265.7 },
  { created_at: '2025-06-17T00:00:00Z', index_value: 268.3 },
  { created_at: '2025-06-18T00:00:00Z', index_value: 267.8 },
  { created_at: '2025-06-19T00:00:00Z', index_value: 270.2 },
  { created_at: '2025-06-20T00:00:00Z', index_value: 269.9 },
  { created_at: '2025-06-21T00:00:00Z', index_value: 272.5 },
  { created_at: '2025-06-22T00:00:00Z', index_value: 271.8 },
  { created_at: '2025-06-23T00:00:00Z', index_value: 274.2 },
  { created_at: '2025-06-24T00:00:00Z', index_value: 273.9 },
  { created_at: '2025-06-25T00:00:00Z', index_value: 276.1 },
  { created_at: '2025-06-26T00:00:00Z', index_value: 277.7 },
  { created_at: '2025-06-27T00:00:00Z', index_value: 278.3 },
  { created_at: '2025-06-28T00:00:00Z', index_value: 277.8 },
  { created_at: '2025-06-29T00:00:00Z', index_value: 280.2 },
  { created_at: '2025-06-30T00:00:00Z', index_value: 279.9 },
];

// Process data for ECharts format
export function processDashboardData(): {
  initialLatestEntry: DashboardDataPoint | null;
  echartsData: (string | number)[][];
  initialDailyChange: number | null;
} {
  if (!dashboardData.length) {
    return {
      initialLatestEntry: null,
      echartsData: [],
      initialDailyChange: null,
    };
  }

  // Group data by day and calculate OHLC
  const dayMap = new Map<string, { open: number; high: number; low: number; close: number }>();
  
  dashboardData.forEach((point) => {
    if (!point.created_at || !point.index_value) return;
    const day = new Date(point.created_at).toISOString().split('T')[0];
    const price = point.index_value;
    
    if (!dayMap.has(day)) {
      dayMap.set(day, { open: price, high: price, low: price, close: price });
    } else {
      const existing = dayMap.get(day)!;
      existing.high = Math.max(existing.high, price);
      existing.low = Math.min(existing.low, price);
      existing.close = price;
    }
  });

  // Convert to ECharts format and sort by date
  const echartsData: (string | number)[][] = [...dayMap.entries()]
    .map(([date, ohlc]) => [date, ohlc.open, ohlc.close, ohlc.low, ohlc.high])
    .sort((a, b) => new Date(a[0] as string).getTime() - new Date(b[0] as string).getTime());

  // Calculate daily change
  const dailyChange = echartsData.length >= 2
    ? ((echartsData.at(-1)![2] as number) - (echartsData.at(-2)![2] as number)) / (echartsData.at(-2)![2] as number) * 100
    : null;

  return {
    initialLatestEntry: dashboardData[dashboardData.length - 1],
    echartsData,
    initialDailyChange: dailyChange,
  };
}
