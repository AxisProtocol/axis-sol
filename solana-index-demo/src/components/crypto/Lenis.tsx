'use client';

import { ReactLenis } from 'lenis/react';
import type { PropsWithChildren } from 'react';

export default function SmoothScroller({ children }: PropsWithChildren) {
  return (
    <ReactLenis
    root
    options={{
      duration: 1.2,      // lerp を使うなら外して OK
      lerp: 0.12,         // 0-1 の間で調整。0.05-0.15 が一般的設定
      smoothWheel: true,
      syncTouch: true,    // ← 旧 smoothTouch の代替
    }}
  >
      {children}                 {/* ← これでページが描画される */}
    </ReactLenis>
  );
}
