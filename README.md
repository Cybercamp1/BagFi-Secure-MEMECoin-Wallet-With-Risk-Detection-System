# BagFi-Secure-MEMECoin-Wallet-With-Risk-Detection-System
# 💰 BagFi: Next-Gen Memecoin Trading Wallet

BagFi is a high-performance, secure, and feature-rich Web3 wallet specifically designed for memecoin traders. It combines real-time market intelligence, institutional-grade risk detection, and a seamless trading experience across major blockchains.

![BagFi Banner](https://raw.githubusercontent.com/Antigravity-AI/assets/main/bagfi-banner.png)

## 🚀 Key Features

- **⚡ Memecoin Intel**: Direct integration with DexScreener for live token launch notifications and real-time price action.
- **🛡️ Institutional Risk Scanner**: Automated safety checks for liquidity locks, contract renouncements, and holder concentration.
- **🔄 Multi-Chain Support**: Native support for Solana and Ethereum ecosystems.
- **💳 Direct Buy/Swap**: Integrated swap aggregator and simulated fiat-to-crypto purchase flow.
- **📊 Portfolio Analytics**: Real-time tracking of assets with PnL visualization.
- **📱 Cross-Platform**: Built for Web, Chrome Extension, and Mobile (Android/iOS) using Capacitor.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS + Framer Motion (Animations)
- **Icons**: Lucide React
- **Blockchain**: Solana Web3.js, Ethers.js, Wagmi, Viem
- **Mobile**: Capacitor
- **API**: DexScreener (Market Intel), CoinCap (Price Data)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Android Studio / Xcode (for mobile development)

<img width="356" height="718" alt="Screenshot 2026-03-16 013800" src="https://github.com/user-attachments/assets/6ffe719a-10da-47dd-b661-aacdaea7e35a" />

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Cybercamp1/BagFi-Secure-MEMECoin-Wallet-With-Risk-Detection-System.git
   cd BagFi-Secure-MEMECoin-Wallet-With-Risk-Detection-System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📦 Building and Deployment

### Chrome Extension Build

To build BagFi as a Chrome Extension:

1. Build the project:
   ```bash
   npm run build
   ```
2. Export the static files:
   ```bash
   npm run export 
   ```
3. Run the extension fix script (removes inline scripts for MV3 compliance):
   ```bash
   node fix-extension.js
   ```
4. Load the `out` directory into Chrome via `chrome://extensions/` -> **Load unpacked**.

### Mobile Build (Capacitor)

1. Build the web project:
   ```bash
   npm run build
   ```
2. Sync with Android/iOS:
   ```bash
   npx cap sync
   ```
3. Open in native IDE:
   ```bash
   npx cap open android # or ios
   ```

## 🔒 Security

BagFi uses AES-256 encryption to secure private keys locally. No keys are ever uploaded to a server. The Risk Scanner utilizes real-time on-chain data to provide a "Safety Score" for any scanned token.

---

Built with ❤️ by the BagFi Team.

- Nithish
