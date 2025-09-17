// components/WalletBar.tsx
'use client'
import dynamic from 'next/dynamic'

const WalletConnect = dynamic(() => import('./WalletConnect'), { ssr: false })

export default function WalletBar() {
  return (
    <div className="w-full max-w-[1000px] mx-auto my-4 mb-8 px-4 py-3 flex justify-between items-center bg-transparent">
      <div className="text-gray-400 font-semibold">
        <span className="text-white"></span>
      </div>
      <WalletConnect />
    </div>
  )
}
