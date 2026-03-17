import './globals.css'
import type { Metadata } from 'next'
import { Web3Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'BagFi Wallet | Next-Gen Memecoin Trading',
  description: 'A dedicated wallet and trading platform for discovering, analyzing, and trading memecoins safely.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Web3Providers>
          {children}
        </Web3Providers>
      </body>
    </html>
  )
}
