// components/WalletBar.tsx
"use client";
import dynamic from "next/dynamic";

const WalletConnect = dynamic(() => import("./WalletConnect"), { ssr: false });

export default function WalletBar() {
  return (
    <div className="w-full flex justify-center items-center mt-4">
      <div className="text-gray-400 font-semibold">
        <span className="text-white"></span>
      </div>
      <WalletConnect />
    </div>
  );
}
