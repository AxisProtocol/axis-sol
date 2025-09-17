import React from 'react';

export interface EChartProps {
  data: (string | number)[][]            // = EChartsData
  events: { event_date: string; title: string; description: string }[]
  disableAnimation?: boolean             // ← ここを props に定義
}


// イベント用の型定義
type MarketEvent = {
  event_date: string;
  title: string;
  description: string;
};

type Props = {
  data: (string | number)[][];
  events: MarketEvent[]; // eventsを受け取る
};

const EChartsChart: React.FC<Props> = ({ data, events }) => {
  // === NEW === イベントデータをマークポイント用のデータ形式に変換
  const markPointData = events.map(event => {
    // イベントの日付に合致する価格データを検索
    const priceData = data.find(d => d[0] === event.event_date);
    if (!priceData) return null;

    return {
      name: event.title,
      // 座標 [日付, 価格]。価格はその日の高値に設定し、ローソク足の上に来るようにする
      coord: [event.event_date, priceData[4]], 
      value: event.description, // ツールチップで表示する詳細
      symbol: 'pin', // アイコンの形
      symbolSize: 25,  // アイコンの大きさ
      itemStyle: {
        color: '#00E5FF' // アイコンの色
      },
      label: {
        show: false // アイコン上のテキストは非表示
      }
    };
  }).filter(Boolean); // nullになったデータを除外


  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(22, 26, 37, 0.8)',
      borderColor: '#484c58',
      textStyle: { color: '#EAF0F7' },
      // === NEW === ツールチップの表示内容をカスタマイズ
      formatter: (params: any) => {
        const ohlcData = params[0];
        const date = ohlcData.axisValue;
        const [open, close, low, high] = ohlcData.value;
        const color = close >= open ? '#26a69a' : '#ef5350';

        // OHLC情報のHTMLを作成
        let tooltipHtml = `
          <strong>${date}</strong><br/>
          Open: ${open.toFixed(2)}<br/>
          High: ${high.toFixed(2)}<br/>
          Low: ${low.toFixed(2)}<br/>
          Close: <strong style="color: ${color};">${close.toFixed(2)}</strong>
        `;

        // その日のイベントを探す
        const event = events.find(e => e.event_date === date);
        if (event) {
          // イベント情報があればHTMLを追加
          tooltipHtml += `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #484c58;">
              <strong style="color: #00E5FF;">EVENT: ${event.title}</strong><br/>
              <p style="white-space: normal; max-width: 250px; margin: 5px 0 0; color: #aeb8c4;">${event.description}</p>
            </div>
          `;
        }
        return tooltipHtml;
      }
    },
    dataZoom: [
      { type: 'inside', start: 50, end: 100 },
      {
        start: 50,
        end: 100,
        handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: { color: '#fff', shadowBlur: 3, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffsetX: 2, shadowOffsetY: 2 },
        textStyle: { color: '#8392A5' },
        borderColor: '#929292',
      },
    ],
    xAxis: {
      type: 'category',
      data: data.map(item => item[0]),
      axisLine: { show: false },
      axisLabel: { color: '#8392A5' },
      axisTick: { show: false },
    },
    yAxis: {
      scale: true,
      axisLine: { show: false },
      axisLabel: { color: '#8392A5' },
      splitLine: { lineStyle: { color: '#2a2e39', type: 'dashed' } },
    },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    series: [
      {
        type: 'candlestick',
        data: data.map(item => [item[1], item[2], item[3], item[4]]),
        itemStyle: {
          color: '#26a69a',
          color0: '#ef5350',
          borderColor: '#26a69a',
          borderColor0: '#ef5350',
          borderWidth: 1.5,
        },
        // === NEW === ここにマークポイントを追加
        markPoint: {
          data: markPointData,
        }
      },
    ],
  };

  return (
    <div id="echarts-container" />
  );
};

export default EChartsChart;