import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: latestEntry, error: latestEntryError } = await supabase
      .from('index_history')
      .select('created_at, index_value, calculation_breakdown')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (latestEntryError) throw new Error(`Failed to fetch latest entry: ${latestEntryError.message}`);

    const { data: previousEntry, error: previousEntryError } = await supabase
      .from('index_history')
      .select('index_value')
      .order('created_at', { ascending: false })
      .range(1, 1)
      .single();

    let dailyChange: number | null = null;
    if (!previousEntryError && previousEntry) {
      const currentValue = Number(latestEntry.index_value);
      const previousValue = Number(previousEntry.index_value);
      if (isFinite(currentValue) && isFinite(previousValue) && previousValue > 0) {
        dailyChange = ((currentValue - previousValue) / previousValue) * 100;
      }
    }

    // 獲取基準數據（用於正規化）
    const { data: firstEntry, error: firstEntryError } = await supabase
      .from('index_history')
      .select('index_value')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    let normalizedValue: number | null = null;
    if (!firstEntryError && firstEntry) {
      const baseIndexValue = Number(firstEntry.index_value);
      if (baseIndexValue > 0) {
        normalizedValue = (Number(latestEntry.index_value) / baseIndexValue) * 100;
      }
    }

    return NextResponse.json({
      currentPrice: Number(latestEntry.index_value),
      normalizedPrice: normalizedValue,
      dailyChange,
      lastUpdated: latestEntry.created_at,
      calculationBreakdown: latestEntry.calculation_breakdown,
    });

  } catch (err: any) {
    console.error("Error in /api/get-index-price:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
