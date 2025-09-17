'use client'

import React, { FC, useMemo } from 'react'
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

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SmoothScroller>
            {children}
            <Toaster position="top-right" />
          </SmoothScroller>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Providers


