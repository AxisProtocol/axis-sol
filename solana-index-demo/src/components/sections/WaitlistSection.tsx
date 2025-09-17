'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Key, Gift, Lock, Wallet, Send } from 'lucide-react';
import { Button, Card } from '../common';

interface WaitlistSectionProps {
  setModalState: (state: { isOpen: boolean; type: 'success' | 'error'; title: string; message: string }) => void;
}

const WaitlistSection = ({ setModalState }: WaitlistSectionProps) => {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!publicKey) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: publicKey.toBase58() }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setIsJoined(true);
        setModalState({ 
          isOpen: true, 
          type: 'success', 
          title: 'Welcome!', 
          message: 'You will be notified of early access and future rewards. Thank you for your support!' 
        });
      } else {
        setModalState({ 
          isOpen: true, 
          type: 'error', 
          title: 'Oops!', 
          message: result.message || 'An error occurred. Please try again.' 
        });
      }
    } catch (err) {
      console.error("Failed to join waitlist:", err);
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Error', 
        message: 'An unexpected error occurred.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectClick = () => {
    setVisible(true);
  };

  const shortenAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Join the Future</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Be part of the journey. Join our waitlist for early access.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
        <div className="text-left space-y-6">
          <h4 className="text-xl font-semibold">Benefits:</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-4 text-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <div className="bg-blue-500/20 text-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                  <Key size={16} />
                </div>
              </div>
              <span>Early access to beta platform</span>
            </li>
            <li className="flex items-center gap-4 text-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <div className="bg-blue-500/20 text-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                  <Gift size={16} />
                </div>
              </div>
              <span>Future airdrops and rewards</span>
            </li>
            <li className="flex items-center gap-4 text-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <div className="bg-blue-500/20 text-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                  <Lock size={16} />
                </div>
              </div>
              <span>Secured spot for launches</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500 italic">
            We only store your wallet address. Privacy respected.
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <div className="text-center space-y-6">
            {!connected ? (
              <>
                <p className="text-lg">Connect your wallet to get started.</p>
                <Button 
                  onClick={handleConnectClick} 
                  variant="primary"
                  size="lg"
                  className="gap-2"
                >
                  <Wallet size={20} /> Connect Wallet
                </Button>
              </>
            ) : (
              <>
                <div className="alert alert-info">
                  <span>Connected as: {shortenAddress(publicKey!.toBase58())}</span>
                  <Button 
                    onClick={() => disconnect()} 
                    variant="ghost"
                    size="sm"
                  >
                    Disconnect
                  </Button>
                </div>

                {!isJoined ? (
                  <Button 
                    onClick={handleJoin} 
                    variant="primary"
                    size="lg"
                    className="gap-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : (
                      <>
                        <Send size={18} /> Join Community
                      </>
                    )}
                  </Button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="alert alert-success"
                  >
                    <span>✅ Welcome! You're on the list.</span>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WaitlistSection;
