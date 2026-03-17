import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import bs58 from 'bs58';

export interface WalletKeys {
  ethereum: {
    address: string;
    privateKey: string;
  };
  solana: {
    address: string;
    privateKey: string;
  };
}

export const generateMnemonic = () => {
  return bip39.generateMnemonic();
};

export const validateMnemonic = (mnemonic: string) => {
  return bip39.validateMnemonic(mnemonic);
};

export const deriveWalletsFromMnemonic = async (mnemonic: string): Promise<WalletKeys> => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  
  // 1. Derive Ethereum (EVM) Wallet - m/44'/60'/0'/0/0
  const ethNode = ethers.HDNodeWallet.fromSeed(seed);
  const ethWallet = ethNode.derivePath("m/44'/60'/0'/0/0");
  
  // 2. Derive Solana Wallet - m/44'/501'/0'/0'
  const solanaSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
  const solanaKeypair = Keypair.fromSeed(solanaSeed);
  
  return {
    ethereum: {
      address: ethWallet.address,
      privateKey: ethWallet.privateKey,
    },
    solana: {
      address: solanaKeypair.publicKey.toBase58(),
      privateKey: bs58.encode(solanaKeypair.secretKey),
    },
  };
};

export const importWalletFromPrivateKey = (privateKey: string, type: 'ethereum' | 'solana') => {
  if (type === 'ethereum') {
    const wallet = new ethers.Wallet(privateKey);
    return { address: wallet.address, privateKey: wallet.privateKey };
  } else {
    const secretKey = bs58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(secretKey);
    return { address: keypair.publicKey.toBase58(), privateKey };
  }
};
