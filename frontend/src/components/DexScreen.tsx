import React, { useState } from 'react';
import { Pool } from '../store';
import '../styles/DexScreen.css';

interface DexScreenProps {
  pools: Pool[];
  selectedPool: Pool | null;
  walletAddress?: string;
}

const DexScreen: React.FC<DexScreenProps> = ({ selectedPool, walletAddress }) => {
  const [swapAmount, setSwapAmount] = useState('');

  return (
    <div className="dex-screen">
      <h2>🔄 Swap Tokens</h2>
      {selectedPool ? (
        <div className="swap-container">
          <div>Select Pool: {selectedPool.address?.slice(0, 8)}...</div>
          <input type="number" placeholder="0.00" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} />
          <button disabled={!swapAmount || !walletAddress}>Swap</button>
        </div>
      ) : (
        <p>Select a pool to swap</p>
      )}
    </div>
  );
};

export default DexScreen;
