'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  Wallet, RefreshCw, BarChart2, ShieldAlert, ArrowUpRight, 
  ArrowDownRight, Eye, Zap, ShieldCheck, AlertTriangle, ChevronDown, 
  Settings, Clock, Search, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from '@/context/WalletContext';
import { AuthScreens } from '@/components/AuthScreens';

// Live Tokens List Configuration
const SUPPORTED_TOKENS = [
  { id: 'solana', name: 'Solana', symbol: 'SOL', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png', defaultBalance: 1.24 },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', defaultBalance: 0.045 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', defaultBalance: 0.8 },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ripple/info/logo.png', defaultBalance: 450 },
  { id: 'tether', name: 'USDT', symbol: 'USDT', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png', defaultBalance: 154.2 },
  { id: 'usd-coin', name: 'USDC', symbol: 'USDC', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png', defaultBalance: 200.0 },
];

export default function Home() {
  const { wallet, isLocked, logout } = useWallet();
  const { address: connectedAddress } = useAccount();
  
  // Use the local wallet address if available, otherwise fallback to connected address
  const address = wallet?.ethereum.address || connectedAddress;

  const [activeTab, setActiveTab] = useState('home');
  const [innerTab, setInnerTab] = useState('tokens');
  
  // Price & Balance State
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});
  const [balances, setBalances] = useState<Record<string, number>>(
    SUPPORTED_TOKENS.reduce((acc, t) => ({ ...acc, [t.symbol]: t.defaultBalance }), {})
  );
  const [liveTokens, setLiveTokens] = useState<any[]>([]);

  // Send Flow State
  const [sendStep, setSendStep] = useState<'token' | 'amount'>('token');
  const [selectedSendToken, setSelectedSendToken] = useState<any>(SUPPORTED_TOKENS[0]);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Swap Flow State
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState<'pay' | 'receive' | 'buy' | null>(null);
  const [payTokenSymbol, setPayTokenSymbol] = useState('SOL');
  const [receiveTokenSymbol, setReceiveTokenSymbol] = useState('ETH');
  const [swapAmount, setSwapAmount] = useState('1');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Buy Flow State
  const [selectedBuyToken, setSelectedBuyToken] = useState<any>(SUPPORTED_TOKENS[2]); // Default ETH
  const [buyAmount, setBuyAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  // Modal State
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  // Fetch Live Prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,solana,ripple,tether,usd-coin');
        const json = await res.json();
        
        const newPrices: Record<string, { price: number; change: number }> = {};
        if (json.data) {
          json.data.forEach((coin: any) => {
            // Map CoinCap symbol to our internal symbol if necessary
            const symbol = coin.symbol === 'XRP' ? 'XRP' : coin.symbol;
            newPrices[symbol] = {
              price: parseFloat(coin.priceUsd),
              change: parseFloat(coin.changePercent24Hr)
            };
          });
        }
        setPrices(newPrices);
      } catch (e) {
        console.error("Failed to fetch prices", e);
      }
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute enriched token data reactively
  const tokenData = React.useMemo(() => {
    return SUPPORTED_TOKENS.reduce((acc, token) => {
      const priceInfo = prices[token.symbol];
      acc[token.symbol] = {
        ...token,
        price: priceInfo?.price || (token.symbol === 'USDT' || token.symbol === 'USDC' ? 1.0 : 0),
        change: priceInfo?.change || 0,
        balance: balances[token.symbol] || 0
      };
      return acc;
    }, {} as Record<string, any>);
  }, [prices, balances]);

  // Fetch DexScreener Live Intel
  useEffect(() => {
    const fetchLiveTokens = async () => {
      try {
        const profilesRes = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
        const profiles = await profilesRes.json();
        const topProfiles = profiles.slice(0, 10);
        const addresses = topProfiles.map((p: any) => p.tokenAddress).join(',');
        
        const detailsRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`);
        const details = await detailsRes.json();
        
        if (details && details.pairs) {
          const uniqueTokens = details.pairs.filter((pair: any, index: number, self: any[]) => 
              index === self.findIndex((t: any) => t.baseToken.address === pair.baseToken.address)
          );
          setLiveTokens(uniqueTokens.slice(0, 6));
        }
      } catch (e) {
        // Silent error
      }
    };
    fetchLiveTokens();
    const interval = setInterval(fetchLiveTokens, 10000);
    return () => clearInterval(interval);
  }, []);

  // Swap Calculations
  const payTokenData = tokenData[payTokenSymbol];
  const receiveTokenData = tokenData[receiveTokenSymbol];
  const payPrice = payTokenData?.price || 0;
  const receivePrice = receiveTokenData?.price || 0;

  const receiveAmount = swapAmount && !isNaN(Number(swapAmount)) && receivePrice > 0 
      ? ((Number(swapAmount) * payPrice) / receivePrice).toFixed(6) 
      : '0.00';

  const totalBalance = Object.values(tokenData).reduce((sum: number, t: any) => {
    const price = t.price || 0;
    return sum + (t.balance * price);
  }, 0);

  const pageVariants = {
    initial: { opacity: 0, x: -10 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 10 }
  };

  const handleSendExecute = async () => {
    if (!wallet) return;
    setIsSending(true);
    try {
      if (selectedSendToken.symbol === 'SOL') {
        const { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
        const bs58 = (await import('bs58')).default;
        
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const fromKeypair = (await import('@solana/web3.js')).Keypair.fromSecretKey(bs58.decode(wallet.solana.privateKey));
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: new PublicKey(sendAddress),
            lamports: Number(sendAmount) * LAMPORTS_PER_SOL,
          })
        );
        
        console.log('Sending Solana Transaction...');
        // await connection.sendTransaction(transaction, [fromKeypair]);
      } else {
        const { ethers } = await import('ethers');
        const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_ID');
        const ethWallet = new ethers.Wallet(wallet.ethereum.privateKey, provider);
        
        console.log('Sending ETH Transaction...');
        // await ethWallet.sendTransaction({ to: sendAddress, value: ethers.parseEther(sendAmount) });
      }
      
      setTimeout(() => {
        setIsSending(false);
        setSendSuccess(true);
      }, 2000);
    } catch (e: any) {
      alert('Transaction failed: ' + e.message);
      setIsSending(false);
    }
  };

  const handleSwapExecute = async () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setSwapSuccess(true);
    }, 2500);
  };

  const handleBuyExecute = async () => {
    if (!wallet) return;
    setIsBuying(true);
    try {
      const price = tokenData[selectedBuyToken.symbol]?.price || 0;
      if (price === 0) throw new Error("Price not available");

      // Simulate real-time price fetching & gas estimation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const targetToken = selectedBuyToken.symbol;
      const amountUSD = Number(buyAmount);
      const tokensToCredit = amountUSD / price;
      
      console.log(`Initiating Direct Buy for ${amountUSD} USD of ${targetToken}`);
      
      // Update local balances
      setBalances(prev => ({
        ...prev,
        [targetToken]: (prev[targetToken] || 0) + tokensToCredit
      }));

      // In a production app, this would use a Uniswap/Jupiter aggregator
      setTimeout(() => {
        setIsBuying(false);
        setBuySuccess(true);
      }, 1000);
    } catch (e: any) {
      alert('Purchase failed: ' + e.message);
      setIsBuying(false);
    }
  };

  const filteredTokens = Object.values(tokenData).filter((t: any) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!wallet || isLocked) {
    return <AuthScreens />;
  }

  return (
    <div className="app-container">
      {/* Phantom-style Header */}
      <nav className="navbar" style={{ padding: '0.75rem 1rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            <div className="logo-box" style={{ width: 32, height: 32, fontSize: '12px' }}>
              B1
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>BagFi Wallet</span>
               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{address ? `${address.substring(0,6)}...${address.substring(address.length-4)}` : 'Not Connected'}</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
         </div>
         <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Zap size={20} color="var(--primary)" />
            <Settings size={20} color="var(--text-muted)" onClick={logout} style={{ cursor: 'pointer' }} />
         </div>
      </nav>

      {/* Main Dashboard */}
      <main className="dashboard">
         <AnimatePresence mode="wait">
           {activeTab === 'home' && (
             <motion.div 
               key="home"
               initial="initial" animate="in" exit="out" variants={pageVariants}
             >
               <div className="portfolio-header">
                 <div className="portfolio-value">
                   ${totalBalance > 0 ? totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                 </div>
                 <div className="pnl-badge pnl-positive" style={{ fontSize: '1rem', border: 'none', background: 'transparent' }}>
                   +$15.42 &nbsp;&nbsp; +1.2% (24h)
                 </div>
               </div>

               <div className="action-grid">
                  <div className="action-btn" onClick={() => { setActiveTab('send'); setSendStep('token'); setSendSuccess(false); }}>
                    <ArrowUpRight size={18} color="var(--primary)" />
                    Send
                  </div>
                  <div className="action-btn" onClick={() => { setActiveTab('swap'); setSwapSuccess(false); }}>
                    <RefreshCw size={18} color="var(--accent)" />
                    Swap
                  </div>
                  <div className="action-btn" onClick={() => setIsReceiveOpen(true)}>
                    <ArrowDownRight size={18} color="var(--success)" />
                    Receive
                  </div>
                  <div className="action-btn" onClick={() => { setActiveTab('buy'); setBuySuccess(false); }}>
                    <Wallet size={18} color="var(--secondary)" />
                    Buy
                  </div>
               </div>

               <div className="tab-header" style={{ marginTop: '1rem' }}>
                  <button className={`tab-btn ${innerTab === 'tokens' ? 'active' : ''}`} onClick={() => setInnerTab('tokens')}>Tokens</button>
                  <button className={`tab-btn ${innerTab === 'intel' ? 'active' : ''}`} onClick={() => setInnerTab('intel')}>Live Drops</button>
               </div>

               {innerTab === 'tokens' && (
                  <div className="token-list" style={{ marginTop: 0 }}>
                    {Object.values(tokenData).map((token: any) => (
                      <div key={token.symbol} className="token-item" style={{ padding: '0.75rem' }} onClick={() => {
                        setPayTokenSymbol(token.symbol);
                        setSwapSuccess(false);
                        setActiveTab('swap');
                      }}>
                        <div className="token-info">
                          <div className="token-icon" style={{ width: 36, height: 36 }}>
                            <img src={token.icon} alt={token.symbol} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                          </div>
                          <div>
                            <div className="token-name" style={{ fontSize: '0.9rem' }}>{token.name}</div>
                            <div className="token-symbol" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{token.balance.toFixed(4)} {token.symbol}</div>
                          </div>
                        </div>
                        <div className="token-price-info">
                          <div className="token-name" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>${token.price ? token.price.toFixed(2) : '0.00'}</div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: token.change >= 0 ? 'var(--success)' : 'var(--danger)',
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem'
                          }}>
                            {token.change >= 0 ? '+' : ''}{token.change ? token.change.toFixed(2) : '0.00'}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               )}

               {innerTab === 'intel' && (
                 <div className="token-list" style={{ marginTop: 0 }}>
                    {liveTokens.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 1rem' }}>Scanning for live token launches...</div>
                    ) : liveTokens.map((token, i) => (
                      <div key={i} className="token-item" style={{ padding: '0.75rem' }} onClick={() => window.open(token.url, '_blank')}>
                        <div style={{
                          width: '36px', height: '36px', border: '2px solid',
                          background: 'rgba(57, 255, 20, 0.1)', borderColor: 'var(--success)', color: 'var(--success)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Zap size={16} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', marginLeft: '0.75rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--accent)' }}>
                            {token.baseToken.name}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            <span style={{ color: 'var(--text-main)' }}>${Number(token.priceUsd).toPrecision(4)}</span> 
                            <span style={{ color: token.priceChange && token.priceChange.m5 >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {token.priceChange?.m5}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
             </motion.div>
           )}

           {activeTab === 'send' && (
             <motion.div key="send" initial="initial" animate="in" exit="out" variants={pageVariants} className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
               {!sendSuccess ? (
                 sendStep === 'token' ? (
                   <>
                     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                       <ArrowLeft size={20} style={{ cursor: 'pointer', marginRight: '0.75rem' }} onClick={() => setActiveTab('home')} />
                       <h2 className="section-title" style={{ margin: 0 }}>Send Token</h2>
                     </div>
                     <div className="token-item" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.5rem 1rem', marginBottom: '1rem' }}>
                       <Search size={18} color="var(--text-muted)" />
                       <input type="text" placeholder="Search token..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', marginLeft: '0.5rem' }} />
                     </div>
                     <div className="token-list" style={{ marginTop: '0.5rem', flex: 1, overflowY: 'auto' }}>
                       {filteredTokens.map((token: any) => (
                         <div key={token.symbol} className="token-item" style={{ padding: '0.75rem' }} onClick={() => { setSelectedSendToken(token); setSendStep('amount'); }}>
                           <div className="token-info">
                             <div className="token-icon" style={{ width: 36, height: 36 }}>
                               <img src={token.icon} alt={token.symbol} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                             </div>
                             <div>
                               <div className="token-name">{token.name}</div>
                               <div className="token-symbol" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{token.symbol}</div>
                             </div>
                           </div>
                           <div className="token-price-info">
                             <div className="token-name">{token.balance}</div>
                             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>${(token.balance * (token.price || 0)).toFixed(2)}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </>
                 ) : (
                   <>
                     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                       <ArrowLeft size={20} style={{ cursor: 'pointer', marginRight: '0.75rem' }} onClick={() => setSendStep('token')} />
                       <h2 className="section-title" style={{ margin: 0 }}>Amount</h2>
                     </div>
                     <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div className="token-icon" style={{ width: 48, height: 48, margin: '0 auto 0.5rem' }}><img src={selectedSendToken.icon} alt={selectedSendToken.symbol} style={{ width: "100%", height: "100%", borderRadius: "50%" }} /></div>
                        <div style={{ color: 'var(--text-muted)' }}>Balance: {selectedSendToken.balance} {selectedSendToken.symbol}</div>
                     </div>
                     <div className="swap-input-container">
                        <input type="text" placeholder="Recipient Address" value={sendAddress} onChange={(e) => setSendAddress(e.target.value)} className="swap-input" style={{ fontSize: '1rem', marginBottom: '1rem' }} />
                        <input type="number" placeholder="0.0" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} className="swap-input" />
                     </div>
                     <button className="primary-btn" style={{ marginTop: 'auto' }} onClick={handleSendExecute} disabled={isSending}>
                       {isSending ? 'Sending...' : 'Confirm Send'}
                     </button>
                   </>
                 )
               ) : (
                 <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                    <h2>Send Successful!</h2>
                    <button className="primary-btn" style={{ marginTop: '2rem' }} onClick={() => { setActiveTab('home'); setSendSuccess(false); }}>Back to Home</button>
                 </div>
               )}
             </motion.div>
           )}

           {activeTab === 'swap' && (
             <motion.div key="swap" initial="initial" animate="in" exit="out" variants={pageVariants} className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
               {!swapSuccess ? (
                 <>
                   <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                     <ArrowLeft size={20} style={{ cursor: 'pointer', marginRight: '0.75rem' }} onClick={() => setActiveTab('home')} />
                     <h2 className="section-title" style={{ margin: 0 }}>Swap</h2>
                   </div>
                   <div className="swap-input-container">
                      <div className="swap-input-row">
                        <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} className="swap-input" />
                        <div className="token-selector" onClick={() => setIsTokenSelectOpen('pay')}>
                          {payTokenSymbol} <ChevronDown size={14} />
                        </div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                     <RefreshCw size={24} color="var(--primary)" />
                   </div>
                   <div className="swap-input-container">
                      <div className="swap-input-row">
                        <input type="text" value={receiveAmount} readOnly className="swap-input" />
                        <div className="token-selector" onClick={() => setIsTokenSelectOpen('receive')}>
                          {receiveTokenSymbol} <ChevronDown size={14} />
                        </div>
                      </div>
                   </div>
                   <button className="swap-btn" style={{ marginTop: 'auto' }} onClick={handleSwapExecute} disabled={isSwapping}>
                     {isSwapping ? 'Swapping...' : 'Execute Swap'}
                   </button>
                 </>
               ) : (
                 <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                    <h2>Swap Complete!</h2>
                    <button className="primary-btn" style={{ marginTop: '2rem' }} onClick={() => { setActiveTab('home'); setSwapSuccess(false); }}>Back to Home</button>
                 </div>
               )}
             </motion.div>
           )}

           {activeTab === 'buy' && (
             <motion.div key="buy" initial="initial" animate="in" exit="out" variants={pageVariants} className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
               {!buySuccess ? (
                 <>
                   <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                     <ArrowLeft size={20} style={{ cursor: 'pointer', marginRight: '0.75rem' }} onClick={() => setActiveTab('home')} />
                     <h2 className="section-title" style={{ margin: 0 }}>Buy Tokens</h2>
                   </div>
                   
                   <div className="token-item" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setIsTokenSelectOpen('buy')}>
                      <div className="token-info">
                        <div className="token-icon" style={{ width: 40, height: 40}}><img src={selectedBuyToken.icon} alt={selectedBuyToken.symbol} style={{ width: "100%", height: "100%", borderRadius: "50%" }} /></div>
                        <div>
                          <div className="token-name" style={{ fontSize: '1.1rem' }}>{selectedBuyToken.name}</div>
                          <div className="token-symbol" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedBuyToken.symbol}</div>
                        </div>
                        <ChevronDown size={20} style={{ marginLeft: 'auto' }} />
                      </div>
                   </div>

                   <div className="swap-input-container">
                      <div className="swap-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Purchase Amount (USD)</span>
                        <span style={{ color: tokenData[selectedBuyToken.symbol]?.price > 0 ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Zap size={10} /> {tokenData[selectedBuyToken.symbol]?.price > 0 
                            ? `Live Price: $${tokenData[selectedBuyToken.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                            : 'Fetching Price...'}
                        </span>
                      </div>
                      <div className="swap-input-row">
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          value={buyAmount} 
                          onChange={(e) => setBuyAmount(e.target.value)} 
                          className="swap-input" 
                        />
                        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>USD</div>
                      </div>
                      
                      {/* Quick Select Amounts */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {['10', '50', '100', '500'].map(amt => (
                          <button 
                            key={amt}
                            onClick={() => setBuyAmount(amt)}
                            style={{ 
                              flex: 1, padding: '0.4rem', fontSize: '0.75rem', 
                              background: buyAmount === amt ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                              color: buyAmount === amt ? 'black' : 'var(--text-main)',
                              border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '4px'
                            }}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>

                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span>Estimated {selectedBuyToken.symbol}</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem' }}>
                            {buyAmount && tokenData[selectedBuyToken.symbol]?.price ? (Number(buyAmount) / tokenData[selectedBuyToken.symbol].price).toFixed(6) : '0.0000'} {selectedBuyToken.symbol}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          1 {selectedBuyToken.symbol} = ${tokenData[selectedBuyToken.symbol]?.price?.toLocaleString()} USD
                        </div>
                      </div>
                   </div>

                   <div style={{ background: 'var(--bg-dark)', padding: '0.75rem 1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Network Gas Fee</span>
                        <span style={{ color: 'var(--text-main)' }}>~$0.45</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Exchange Rate</span>
                        <span style={{ color: 'var(--success)' }}>Guaranteed (10s)</span>
                      </div>
                   </div>

                   <button className="primary-btn" style={{ marginTop: 'auto', background: 'var(--secondary)' }} onClick={handleBuyExecute} disabled={isBuying || !buyAmount}>
                     {isBuying ? 'PREVIEWING & SIGNING...' : 'CONFIRM PURCHASE'}
                   </button>
                 </>
               ) : (
                 <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                    <h2>Tokens Purchased!</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Your {selectedBuyToken.symbol} will appear shortly.</p>
                    <button className="primary-btn" style={{ marginTop: '2rem' }} onClick={() => { setActiveTab('home'); setBuySuccess(false); setBuyAmount(''); }}>Back to Home</button>
                 </div>
               )}
             </motion.div>
           )}

           {activeTab === 'history' && (
             <motion.div key="history" initial="initial" animate="in" exit="out" variants={pageVariants}>
                <h2 className="section-title"><Clock size={20} /> History</h2>
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No transactions found</div>
             </motion.div>
           )}

           {activeTab === 'risk' && (
             <motion.div key="risk" initial="initial" animate="in" exit="out" variants={pageVariants} className="glass-card">
               <h2 className="section-title"><ShieldAlert size={20} /> Risk Scanner</h2>
               <div className="risk-meter">
                 <div className="meter-bg"><div className="meter-fill" style={{ width: '85%' }}></div></div>
                 <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>85/100 (Safe)</div>
               </div>
               <div className="risk-checks">
                 <div className="check-item"><ShieldCheck color="var(--success)" /> Liquidity Locked</div>
                 <div className="check-item"><ShieldCheck color="var(--success)" /> Renounced</div>
                 <div className="check-item"><AlertTriangle color="var(--accent)" /> High Concentration</div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
      </main>

      <div className="bottom-nav">
         <div className={`bottom-nav-item ${activeTab === 'home' || activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Wallet size={20} /></div>
         <div className={`bottom-nav-item ${activeTab === 'swap' ? 'active' : ''}`} onClick={() => setActiveTab('swap')}><RefreshCw size={20} /></div>
         <div className={`bottom-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><Clock size={20} /></div>
         <div className={`bottom-nav-item ${activeTab === 'risk' ? 'active' : ''}`} onClick={() => setActiveTab('risk')}><ShieldAlert size={20} /></div>
      </div>

      {isReceiveOpen && (
        <div className="modal-overlay" onClick={() => setIsReceiveOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsReceiveOpen(false)}>X</button>
            <h2 className="section-title">Receive</h2>
            <div style={{ textAlign: 'center' }}>
              <div className="qr-container"><QRCodeSVG value={address || ""} size={180} /></div>
              <div style={{ wordBreak: 'break-all', fontSize: '0.8rem', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem', marginTop: '1rem' }}>{address}</div>
            </div>
          </div>
        </div>
      )}

      {isTokenSelectOpen && (
        <div className="modal-overlay" onClick={() => setIsTokenSelectOpen(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsTokenSelectOpen(null)}>X</button>
            <h2 className="section-title">Select Token</h2>
            <div className="token-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {SUPPORTED_TOKENS.map((token: any) => (
                <div key={token.symbol} className="token-item" onClick={() => {
                  if (isTokenSelectOpen === 'pay') setPayTokenSymbol(token.symbol);
                  else if (isTokenSelectOpen === 'receive') setReceiveTokenSymbol(token.symbol);
                  else if (isTokenSelectOpen === 'buy') setSelectedBuyToken(token);
                  setIsTokenSelectOpen(null);
                }}>
                  <div className="token-info">
                    <img src={token.icon} alt={token.symbol} style={{ width: 24, height: 24, borderRadius: '50%', marginRight: '12px' }} />
                    {token.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
