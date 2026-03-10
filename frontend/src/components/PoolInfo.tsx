import React, { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { Pool } from '../App';
import CreatePoolModal from './CreatePoolModal';
import '../styles/PoolInfo.css';

interface PoolInfoProps {
  pools: Pool[];
  onAddLiquidity: (pool: Pool) => void;
  onCreatePool: (pool: Pool) => void;
  walletAddress: string | undefined;
  connection: Connection;
}

const PoolInfo: React.FC<PoolInfoProps> = ({ 
  pools, 
  onAddLiquidity, 
  onCreatePool,
  walletAddress,
  connection
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="pool-info">
      <div className="pool-header">
        <h2>📊 Liquidity Pools</h2>
        <button 
          className="create-pool-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Pool
        </button>
      </div>

      <div className="pools-list">
        {pools.length === 0 ? (
          <div className="no-pools">
            <p>No pools yet. Create one to get started!</p>
          </div>
        ) : (
          pools.map((pool, index) => (
            <div key={index} className="pool-card">
              <div className="pool-title">
                <h3>Pool #{index + 1}</h3>
                <span className="pool-address">{pool.address?.slice(0, 8)}...</span>
              </div>

              <div className="pool-details">
                <div className="detail-row">
                  <span className="label">Token A:</span>
                  <span className="value">{pool.tokenAAmount.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Token B:</span>
                  <span className="value">{pool.tokenBAmount.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">LP Tokens:</span>
                  <span className="value" style={{color: '#8b5cf6'}}>{pool.lpTokens.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fee:</span>
                  <span className="value" style={{color: '#f59e0b'}}>{pool.fee}%</span>
                </div>
              </div>

              <div className="pool-ratio">
                <span>1 A = {(pool.tokenBAmount / pool.tokenAAmount).toFixed(6)} B</span>
              </div>

              <button 
                className="add-liquidity-btn"
                onClick={() => onAddLiquidity(pool)}
              >
                💧 Add Liquidity
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreatePoolModal
          onClose={() => setShowCreateModal(false)}
          onPoolCreated={(pool) => {
            onCreatePool(pool);
            setShowCreateModal(false);
          }}
          walletAddress={walletAddress}
          connection={connection}
        />
      )}
    </div>
  );
};

export default PoolInfo;
