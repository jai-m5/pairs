import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

export const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

// Token metadata cache
const tokenMetadataCache: Record<string, { symbol: string; decimals: number }> = {
  'EPjFWaLb3p7bQ1L6FTs8wj4ChV7wxpUvD6khF5HA429r': { symbol: 'USDC', decimals: 6 },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenErt9': { symbol: 'USDT', decimals: 6 },
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9 },
};

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

export async function validateTokenAddress(connection: Connection, tokenMint: string): Promise<TokenInfo | null> {
  try {
    const mint = new PublicKey(tokenMint);
    const tokenData = await getMint(connection, mint);
    const cached = tokenMetadataCache[tokenMint];
    return { address: tokenMint, symbol: cached?.symbol || 'UNKNOWN', decimals: tokenData.decimals };
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}

export async function searchToken(connection: Connection, query: string): Promise<TokenInfo | null> {
  query = query.trim();
  if (!query) return null;

  if (query.length === 43 || query.length === 44) {
    try {
      new PublicKey(query);
      return await validateTokenAddress(connection, query);
    } catch {
      return null;
    }
  }

  const upper = query.toUpperCase();
  for (const [address, metadata] of Object.entries(tokenMetadataCache)) {
    if (metadata.symbol.toUpperCase().includes(upper)) {
      return { address, symbol: metadata.symbol, decimals: metadata.decimals };
    }
  }
  return null;
}

export async function getTokenBalance(connection: Connection, walletAddress: PublicKey, tokenMint: PublicKey): Promise<number> {
  try {
    const mint = new PublicKey(tokenMint);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, { mint });
    if (tokenAccounts.value.length === 0) return 0;
    const tokenAccount = tokenAccounts.value[0];
    return tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}

export async function getSolBalance(connection: Connection, walletAddress: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(walletAddress);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    return 0;
  }
}

export function createPool(tokenAMint: string, tokenBMint: string, amountA: number, amountB: number) {
  return {
    address: `Pool_${Math.random().toString(36).substr(2, 9)}`,
    tokenAMint,
    tokenBMint,
    tokenAAmount: amountA,
    tokenBAmount: amountB,
    lpTokens: Math.sqrt(amountA * amountB),
    fee: 0.3,
  };
}
