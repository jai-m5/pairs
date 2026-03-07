import { create } from 'zustand';

export interface Pool {
  address: string;
  tokenAMint: string;
  tokenBMint: string;
  tokenAAmount: number;
  tokenBAmount: number;
  lpTokens: number;
  fee: number;
}
