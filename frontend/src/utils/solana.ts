import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// Solana Token Addresses
export const SOLANA_TOKENS = {
  USDC: 'EPjFWaLb3p7bqxtuKe6vqMwVpmEdKe2iiJaFbavkYTC',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenErt',
  SOL: 'So11111111111111111111111111111111111111112',
};

export const PROGRAM_ID = '11111111111111111111111111111111';

/**
 * Get token balance for a wallet
 * @param connection Solana connection
 * @param walletAddress Wallet public key
 * @param tokenMint Token mint address
 * @returns Token balance
 */
export async function getTokenBalance(
  connection: Connection,
  walletAddress: string,
  tokenMint: string
): Promise<number> {
  try {
    // Handle wrapped SOL specially
    if (tokenMint === SOLANA_TOKENS.SOL) {
      const balance = await connection.getBalance(new PublicKey(walletAddress));
      return balance / 1e9;
    }

    // Get associated token account
    const associatedTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      new PublicKey(walletAddress)
    );

    // Fetch token account balance
    const accountInfo = await connection.getTokenAccountBalance(associatedTokenAccount);
    return parseInt(accountInfo.value.amount) / Math.pow(10, accountInfo.value.decimals);
  } catch (error) {
    console.log('Token account not found, balance: 0');
    return 0;
  }
}

/**
 * Get SOL balance
 */
export async function getSolBalance(
  connection: Connection,
  walletAddress: string
): Promise<number> {
  try {
    const balance = await connection.getBalance(new PublicKey(walletAddress));
    return balance / 1e9;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    return 0;
  }
}

/**
 * Get token symbol from mint address
 */
export function getTokenSymbol(mint: string): string {
  const symbolMap: Record<string, string> = {
    'EPjFWaLb3p7bqxtuKe6vqMwVpmEdKe2iiJaFbavkYTC': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenErt': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
  };
  return symbolMap[mint] || mint.slice(0, 4).toUpperCase();
}

/**
 * Format numbers for display
 */
export function formatNumber(num: number, decimals = 2): string {
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

/**
 * Create a liquidity pool (with localStorage persistence)
 */
export function createPool(
  tokenAMint: string,
  tokenBMint: string,
  tokenAAmount: number,
  tokenBAmount: number
) {
  const pool = {
    address: 'pool_' + Math.random().toString(36).substr(2, 9),
    tokenAMint,
    tokenBMint,
    tokenAAmount,
    tokenBAmount,
    lpTokenSupply: Math.sqrt(tokenAAmount * tokenBAmount),
    fee: 0.3,
    createdAt: Date.now(),
  };

  // Save to localStorage
  const pools = getAllPoolsFromLocalStorage();
  pools.push(pool);
  localStorage.setItem('solana_dex_pools', JSON.stringify(pools));

  return pool;
}

/**
 * Add liquidity to existing pool
 */
export function addLiquidity(
  poolAddress: string,
  tokenAAmount: number,
  tokenBAmount: number
): { lpTokensMinted: number; signature: string } {
  const pool = getPoolFromLocalStorage(poolAddress);
  if (!pool) throw new Error('Pool not found');

  const shareA = (tokenAAmount / pool.tokenAAmount) * pool.lpTokenSupply;
  const shareB = (tokenBAmount / pool.tokenBAmount) * pool.lpTokenSupply;
  const lpTokensMinted = Math.min(shareA, shareB);

  pool.tokenAAmount += tokenAAmount;
  pool.tokenBAmount += tokenBAmount;
  pool.lpTokenSupply += lpTokensMinted;

  savePoolToLocalStorage(poolAddress, pool);

  return {
    lpTokensMinted,
    signature: 'txn_' + Math.random().toString(36).substr(2, 9),
  };
}

/**
 * Remove liquidity from pool
 */
export function removeLiquidity(
  poolAddress: string,
  lpTokenAmount: number
): { tokenAAmount: number; tokenBAmount: number; signature: string } {
  const pool = getPoolFromLocalStorage(poolAddress);
  if (!pool) throw new Error('Pool not found');

  const sharePercent = lpTokenAmount / pool.lpTokenSupply;
  const tokenAAmount = pool.tokenAAmount * sharePercent;
  const tokenBAmount = pool.tokenBAmount * sharePercent;

  pool.tokenAAmount -= tokenAAmount;
  pool.tokenBAmount -= tokenBAmount;
  pool.lpTokenSupply -= lpTokenAmount;

  savePoolToLocalStorage(poolAddress, pool);

  return {
    tokenAAmount,
    tokenBAmount,
    signature: 'txn_' + Math.random().toString(36).substr(2, 9),
  };
}

/**
 * Swap tokens using AMM formula
 */
export function swap(
  poolAddress: string,
  amountIn: number,
  isTokenAIn: boolean,
  minAmountOut: number
): { amountOut: number; priceImpact: number; signature: string } {
  const pool = getPoolFromLocalStorage(poolAddress);
  if (!pool) throw new Error('Pool not found');

  const amountInWithFee = amountIn * 0.997;

  let amountOut: number;
  if (isTokenAIn) {
    amountOut = (amountInWithFee * pool.tokenBAmount) / (pool.tokenAAmount + amountInWithFee);
  } else {
    amountOut = (amountInWithFee * pool.tokenAAmount) / (pool.tokenBAmount + amountInWithFee);
  }

  if (amountOut < minAmountOut) {
    throw new Error(`Slippage too high. Expected ${minAmountOut}, got ${amountOut}`);
  }

  if (isTokenAIn) {
    pool.tokenAAmount += amountInWithFee;
    pool.tokenBAmount -= amountOut;
  } else {
    pool.tokenBAmount += amountInWithFee;
    pool.tokenAAmount -= amountOut;
  }

  savePoolToLocalStorage(poolAddress, pool);

  const priceImpact = ((amountIn - amountOut) / (amountIn + amountOut)) * 100;

  return {
    amountOut,
    priceImpact,
    signature: 'txn_' + Math.random().toString(36).substr(2, 9),
  };
}

/**
 * Calculate swap output without modifying pool
 */
export function calculateSwapOutput(
  poolAddress: string,
  amountIn: number,
  isTokenAIn: boolean
): { amountOut: number; priceImpact: number } {
  const pool = getPoolFromLocalStorage(poolAddress);

  if (!pool) return { amountOut: 0, priceImpact: 0 };

  const amountInWithFee = amountIn * 0.997;
  let amountOut: number;

  if (isTokenAIn) {
    amountOut = (amountInWithFee * pool.tokenBAmount) / (pool.tokenAAmount + amountInWithFee);
  } else {
    amountOut = (amountInWithFee * pool.tokenAAmount) / (pool.tokenBAmount + amountInWithFee);
  }

  const priceImpact = ((amountIn - amountOut) / (amountIn + amountOut)) * 100;

  return { amountOut, priceImpact };
}

// Local Storage Helpers

function getPoolFromLocalStorage(poolAddress: string) {
  try {
    const pools = JSON.parse(localStorage.getItem('solana_dex_pools') || '[]');
    return pools.find((p: any) => p.address === poolAddress) || null;
  } catch {
    return null;
  }
}

function savePoolToLocalStorage(poolAddress: string, pool: any): void {
  try {
    const pools = JSON.parse(localStorage.getItem('solana_dex_pools') || '[]');
    const index = pools.findIndex((p: any) => p.address === poolAddress);
    if (index >= 0) {
      pools[index] = pool;
    }
    localStorage.setItem('solana_dex_pools', JSON.stringify(pools));
  } catch (error) {
    console.error('Error saving pool:', error);
  }
}

export function getAllPoolsFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem('solana_dex_pools') || '[]');
  } catch {
    return [];
  }
}

export function deletePoolFromLocalStorage(poolAddress: string): void {
  try {
    const pools = JSON.parse(localStorage.getItem('solana_dex_pools') || '[]');
    const filtered = pools.filter((p: any) => p.address !== poolAddress);
    localStorage.setItem('solana_dex_pools', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting pool:', error);
  }
}
