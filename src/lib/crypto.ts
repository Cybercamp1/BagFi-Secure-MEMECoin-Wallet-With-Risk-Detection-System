import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_PREFIX = 'bagfi-vault-';

export const encryptData = (data: string, password: string) => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

export const decryptData = (encryptedData: string, password: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};

export const saveEncryptedWallet = (encryptedMnemonic: string, encryptedPrivateKeys: Record<string, string>) => {
  localStorage.setItem(`${ENCRYPTION_KEY_PREFIX}mnemonic`, encryptedMnemonic);
  localStorage.setItem(`${ENCRYPTION_KEY_PREFIX}keys`, JSON.stringify(encryptedPrivateKeys));
};

export const getEncryptedWallet = () => {
  const mnemonic = localStorage.getItem(`${ENCRYPTION_KEY_PREFIX}mnemonic`);
  const keysRaw = localStorage.getItem(`${ENCRYPTION_KEY_PREFIX}keys`);
  const keys = keysRaw ? JSON.parse(keysRaw) : {};
  return { mnemonic, keys };
};

export const clearWallet = () => {
  localStorage.removeItem(`${ENCRYPTION_KEY_PREFIX}mnemonic`);
  localStorage.removeItem(`${ENCRYPTION_KEY_PREFIX}keys`);
};
