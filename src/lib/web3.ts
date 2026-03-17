import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

/**
 * Public viem client for direct blockchain interactions without React hooks.
 * This replaces web3.js and ethers.js providers.
 */
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

/**
 * Example function to read an ERC20 Token Balance directly from the blockchain
 */
export async function getERC20Balance(
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`
) {
  const data = await publicClient.readContract({
    address: tokenAddress,
    abi: [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [walletAddress],
  });

  return data as bigint;
}

/**
 * Utility: Convert ETH to Wei (replaces ethers.utils.parseEther)
 */
export const toWei = (amount: string) => parseEther(amount);

/**
 * Utility: Convert Wei to ETH (replaces ethers.utils.formatEther)
 */
export const fromWei = (amount: bigint) => formatEther(amount);
