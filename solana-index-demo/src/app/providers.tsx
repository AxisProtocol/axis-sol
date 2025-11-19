'use client'

import React, { FC, useMemo, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Toaster } from 'react-hot-toast'
import SmoothScroller from '../components/crypto/Lenis'

type Props = { children: React.ReactNode }

const Providers: FC<Props> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = 'https://api.devnet.solana.com'

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  // ここでモバイルかどうかを判定
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px未満をスマホ扱い
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {isMobile ? (
            // スマホ：慣性スクロール OFF（そのまま描画）
            <>
              {children}
              <Toaster position="top-right" />
            </>
          ) : (
            // PC / タブレット：慣性スクロール ON
            <SmoothScroller>
              {children}
              <Toaster position="top-right" />
            </SmoothScroller>
          )}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Providers
