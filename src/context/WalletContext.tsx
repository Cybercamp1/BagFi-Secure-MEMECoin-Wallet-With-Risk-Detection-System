'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getEncryptedWallet, decryptData, encryptData, saveEncryptedWallet, clearWallet } from '@/lib/crypto';
import { deriveWalletsFromMnemonic, WalletKeys, validateMnemonic } from '@/lib/wallet-core';

interface WalletContextType {
  wallet: WalletKeys | null;
  isLocked: boolean;
  hasWallet: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  createWallet: (password: string) => Promise<string>;
  importWallet: (mnemonic: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletKeys | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    const { mnemonic } = getEncryptedWallet();
    setHasWallet(!!mnemonic);
  }, []);

  const unlock = async (password: string) => {
    const { mnemonic } = getEncryptedWallet();
    if (!mnemonic) return false;

    const decryptedMnemonic = decryptData(mnemonic, password);
    if (!decryptedMnemonic || !validateMnemonic(decryptedMnemonic)) return false;

    const keys = await deriveWalletsFromMnemonic(decryptedMnemonic);
    setWallet(keys);
    setIsLocked(false);
    return true;
  };

  const lock = () => {
    setWallet(null);
    setIsLocked(true);
  };

  const createWallet = async (password: string) => {
    const { generateMnemonic } = await import('@/lib/wallet-core');
    const mnemonic = generateMnemonic();
    const encryptedMnemonic = encryptData(mnemonic, password);
    const keys = await deriveWalletsFromMnemonic(mnemonic);
    
    // In a real app, we'd encrypt individual keys too if stored separately
    saveEncryptedWallet(encryptedMnemonic, {});
    
    setWallet(keys);
    setIsLocked(false);
    setHasWallet(true);
    return mnemonic;
  };

  const importWallet = async (mnemonic: string, password: string) => {
    if (!validateMnemonic(mnemonic)) return false;
    
    const encryptedMnemonic = encryptData(mnemonic, password);
    const keys = await deriveWalletsFromMnemonic(mnemonic);
    
    saveEncryptedWallet(encryptedMnemonic, {});
    
    setWallet(keys);
    setIsLocked(false);
    setHasWallet(true);
    return true;
  };

  const logout = () => {
    clearWallet();
    setWallet(null);
    setIsLocked(true);
    setHasWallet(false);
  };

  return (
    <WalletContext.Provider value={{ wallet, isLocked, hasWallet, unlock, lock, createWallet, importWallet, logout }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
