'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import { Shield, Key, Plus, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AuthScreens: React.FC = () => {
  const { hasWallet, isLocked, unlock, createWallet, importWallet } = useWallet();
  const [view, setView] = useState<'welcome' | 'create' | 'import' | 'unlock'>(hasWallet ? 'unlock' : 'welcome');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleUnlock = async () => {
    setError('');
    const success = await unlock(password);
    if (!success) setError('Incorrect password');
  };

  const handleCreate = async () => {
    if (password.length < 8) return setError('Password must be 8+ characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setError('');
    const m = await createWallet(password);
    setGeneratedMnemonic(m);
    setStep(2);
  };

  const handleImport = async () => {
    if (password.length < 8) return setError('Password must be 8+ characters');
    setError('');
    const success = await importWallet(mnemonic, password);
    if (!success) setError('Invalid seed phrase');
  };

  if (view === 'unlock') {
    return (
      <div className="auth-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
          <div className="logo-section">
            <div className="logo-box">B1</div>
            <h2>BagFi Wallet</h2>
          </div>
          <p className="auth-subtitle">Welcome back, trader</p>
          
          <div className="input-group">
            <label>Wallet Password</label>
            <div className="password-input">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}

          <button className="primary-btn" onClick={handleUnlock}>Unlock Wallet</button>
          
          <button className="text-btn" onClick={() => {/* Forgot password */}}>
            Trouble logging in?
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === 'welcome') {
    return (
      <div className="auth-container">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="auth-card">
          <div className="logo-section big">
            <div className="logo-box bigger">B1</div>
            <h1>BagFi</h1>
            <p>Next-Gen Memecoin Terminal</p>
          </div>
          
          <div className="welcome-actions">
            <button className="action-card" onClick={() => setView('create')}>
              <div className="icon-circle"><Plus color="var(--primary)" /></div>
              <div className="action-text">
                <h3>Create New Wallet</h3>
                <p>Generate a new seed phrase</p>
              </div>
            </button>

            <button className="action-card" onClick={() => setView('import')}>
              <div className="icon-circle"><LogIn color="var(--accent)" /></div>
              <div className="action-text">
                <h3>Import Wallet</h3>
                <p>Use existing 12/24 word phrase</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="auth-container">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="auth-card">
          {step === 1 ? (
            <>
              <h2>Secure your wallet</h2>
              <p className="auth-subtitle">Set a password to encrypt your keys</p>
              
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="New Password (8+ chars)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}
              <button className="primary-btn" onClick={handleCreate}>Continue</button>
              <button className="text-btn" onClick={() => setView('welcome')}>Back</button>
            </>
          ) : (
            <>
              <h2>Secret Recovery Phrase</h2>
              <p className="auth-subtitle">Write these 12 words down and keep them safe.</p>
              <div className="mnemonic-grid">
                {generatedMnemonic.split(' ').map((word, i) => (
                  <div key={i} className="mnemonic-word">
                    <span>{i + 1}</span> {word}
                  </div>
                ))}
              </div>
              <div className="warning-box">
                <Shield size={16} />
                If you lose this, your funds are gone forever. No one can recover it.
              </div>
              <button className="primary-btn" onClick={() => window.location.reload()}>I've saved it</button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  if (view === 'import') {
    return (
      <div className="auth-container">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="auth-card">
          <h2>Import with Seed Phrase</h2>
          <p className="auth-subtitle">Enter your 12 or 24 word recovery phrase</p>
          
          <textarea 
            className="mnemonic-input"
            placeholder="word1 word2 word3..."
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
          />

          <div className="input-group">
            <input 
              type="password" 
              placeholder="Set New Password (8+ chars)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}
          <button className="primary-btn" onClick={handleImport}>Import Wallet</button>
          <button className="text-btn" onClick={() => setView('welcome')}>Back</button>
        </motion.div>
      </div>
    );
  }

  return null;
};
