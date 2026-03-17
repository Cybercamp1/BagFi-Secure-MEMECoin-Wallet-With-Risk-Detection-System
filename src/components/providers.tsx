'use client'

import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { mainnet, base, arbitrum } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { phantomWallet, metaMaskWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'

const queryClient = new QueryClient()

export const config = getDefaultConfig({
  appName: 'BagFi Wallet',
  projectId: 'a3d68df8eb0ea7be8249ddff1d6daeb6', // Public shared ID for demo purposes
  chains: [mainnet, base, arbitrum],
  wallets: [
    {
      groupName: 'Popular',
      wallets: [phantomWallet, metaMaskWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  ssr: true,
})

import { WalletProvider } from '@/context/WalletContext'

export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#1CD48B',
          accentColorForeground: '#0a0a0a',
          borderRadius: 'medium',
        })}>
          <WalletProvider>
            {mounted && children}
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
