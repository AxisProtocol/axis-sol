import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { marketEvents } from '../../../lib/market-events';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. 基準となる「一番古い」データを取得
    const { data: firstEntry, error: firstEntryError } = await supabase
      .from('index_history')
      .select('index_value')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (firstEntryError) throw new Error(`Failed to fetch first entry: ${firstEntryError.message}`);
    const baseIndexValue = Number(firstEntry.index_value);
    if (baseIndexValue === 0) throw new Error("Base index value is zero, cannot normalize.");

    // 2. 最新のインデックスデータを取得 (内訳付き)
    const { data: latestEntry, error: latestEntryError } = await supabase
      .from('index_history')
      .select('created_at, index_value, calculation_breakdown')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (latestEntryError) throw new Error(`Failed to fetch latest entry: ${latestEntryError.message}`);

    // 3. チャート用の日足データをDB関数から取得
    const { data: dailyHistory, error: dailyHistoryError } = await supabase.rpc('get_daily_index_history');
    if (dailyHistoryError) throw dailyHistoryError;
    if (!dailyHistory) throw new Error("Daily history data is null.");

    // 4. 全てのデータを正規化（最初の値を100とする）
    const normalizedHistory = dailyHistory.map((item: any) => ({
      day: item.day,
      index_value: (Number(item.index_value) / baseIndexValue) * 100,
    }));
    
    // 5. 前日比を計算
    let dailyChange: number | null = null;
    if (normalizedHistory.length >= 2) {
      const latestValue = normalizedHistory[normalizedHistory.length - 1].index_value;
      const previousValue = normalizedHistory[normalizedHistory.length - 2].index_value;
      if (isFinite(latestValue) && isFinite(previousValue) && previousValue > 0) {
        dailyChange = ((latestValue - previousValue) / previousValue) * 100;
      }
    }
    
    // 6. フロントエンドに全てのデータを返す
    return NextResponse.json({
      latestEntry, // 生の最新データ（計算内訳テーブル用）
      echartsData: normalizedHistory, // 正規化されたチャート用データ
      dailyChange,
      events: marketEvents,
    });

  } catch (err: any) {
    console.error("Error in /api/get-latest-data:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
