import React, { useState } from 'react';
import { Pool } from '../store';
import CreatePoolModal from './CreatePoolModal';
import '../styles/PoolInfo.css';

interface PoolInfoProps {
  pools: Pool[];
  onAddLiquidity: (pool: Pool) => void;
  onCreatePool: (pool: Pool) => void;
  walletAddress?: string;
}

const PoolInfo: React.FC<PoolInfoProps> = ({ pools, onAddLiquidity, onCreatePool, walletAddress }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="pool-info">
      <div className="pool-header">
        <h2>📊 Liquidity Pools</h2>
        <button className="create-pool-btn" onClick={() => setShowCreateModal(true)}>+ Create Pool</button>
      </div>
      <div className="pools-list">
        {pools.length === 0 ? (
          <div className="no-pools"><p>No pools yet. Create one!</p></div>
        ) : (
          pools.map((pool, index) => (
            <div key={index} className="pool-card">
              <h3>Pool #{index + 1}</h3>
              <div className="pool-details">
                <div>Token A: {pool.tokenAAmount.toFixed(2)}</div>
                <div>Token B: {pool.tokenBAmount.toFixed(2)}</div>
                <div>LP Tokens: {pool.lpTokens.toFixed(2)}</div>
              </div>
              <button className="add-liquidity-btn" onClick={() => onAddLiquidity(pool)}>💧 Add Liquidity</button>
            </div>
          ))
        )}
      </div>
      {showCreateModal && (
        <CreatePoolModal
          onClose={() => setShowCreateModal(false)}
          onPoolCreated={(pool) => { onCreatePool(pool); setShowCreateModal(false); }}
          walletAddress={walletAddress}
        />
      )}
    </div>
  );
};

export default PoolInfo;
