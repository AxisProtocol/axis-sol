'use client'

import React, { FC, useMemo, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Toaster } from 'react-hot-toast'
import SmoothScroller from '../components/crypto/Lenis'

// Phantom SDK Imports
import { PhantomProvider, darkTheme } from '@phantom/react-sdk'
import { AddressType } from '@phantom/browser-sdk'

type Props = { children: React.ReactNode }

const Providers: FC<Props> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = 'https://api.devnet.solana.com'

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  // ★★★ 環境ごとのURL切り替えロジック ★★★
  // process.env.NODE_ENV は 'production' か 'development' を返します
  const isProduction = process.env.NODE_ENV === 'production';
  
  const redirectUrl = isProduction 
    ? "https://www.axis-protocol.xyz/dashboard"// 本番用 
    : "http://localhost:3000/dashboard";        // 開発用

  // モバイル判定
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])
  
  const axisTheme = {
    // モーダルの背景色：サイトに合わせて「深い黒」または「透過ブラック」に
    background: '#050A12', 
    
    // テキスト色
    text: '#ffffff', 
    
    // サブテキストや境界線（少し薄く）
    secondary: '#888888', 
    
    // ブランドカラー（ボタンやアクセント）：Axisの青系に合わせる
    brand: '#205C8C', 
    
    // エラー色
    error: '#ff4444', 
    
    // 成功色
    success: '#00ff00', 
    
    // 角丸：Axisのボタンに合わせて大きめに（例: 24px）
    borderRadius: '24px', 
    
    // モーダルの外側のオーバーレイ（背景の暗さ）
    overlay: 'rgba(0, 0, 0, 0.7)', 
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          
          <PhantomProvider
            config={{
              // ★ PortalのApp ID
              appId: "d8b2f739-d412-4823-8d52-65d4d886c215", 
              
              providers: ["google", "apple", "injected"],
              addressTypes: [AddressType.solana],
              authOptions: {
                // ★ ここに変数を渡す
                redirectUrl: redirectUrl, 
              },
            }}
            theme={axisTheme}
            
          >
            
            {isMobile ? (
              <>
                {children}
                <Toaster position="top-right" />
              </>
            ) : (
              <SmoothScroller>
                {children}
                <Toaster position="top-right" />
              </SmoothScroller>
            )}

          </PhantomProvider>
          
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Providers