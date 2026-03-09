import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import PoolInfo from './components/PoolInfo';
import AddLiquidityModal from './components/AddLiquidityModal';
import { Pool } from './store';
import './styles/App.css';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);

  const handleCreatePool = (newPool: Pool) => {
    setPools([...pools, newPool]);
  };

  const handleAddLiquidity = (pool: Pool) => {
    setSelectedPool(pool);
    setShowAddLiquidity(true);
  };

  const handleLiquidityAdded = (updatedPool: Pool) => {
    setPools(pools.map(p => p.address === updatedPool.address ? updatedPool : p));
    setShowAddLiquidity(false);
  };

  return (
    <div className="app" style={{background: '#0f1419', color: '#e0e0e0'}}>
      <div style={{fontSize: '12px', padding: '5px', background: '#1a1f2e', textAlign: 'center', color: '#14f195'}}>
        ✓ DEX Loaded
      </div>
      <header className="app-header">
        <h1>🌊 Solana Liquidity DEX</h1>
        <ConnectWallet
          onConnect={setWalletAddress}
          onDisconnect={() => setWalletAddress(null)}
          connected={!!walletAddress}
          address={walletAddress}
        />
      </header>
      <main className="app-main">
        {walletAddress ? (
          <>
            <PoolInfo pools={pools} onAddLiquidity={handleAddLiquidity} onCreatePool={handleCreatePool} walletAddress={walletAddress} />
            {showAddLiquidity && selectedPool && (
              <AddLiquidityModal
                pool={selectedPool}
                onClose={() => setShowAddLiquidity(false)}
                onLiquidityAdded={handleLiquidityAdded}
                walletAddress={walletAddress}
              />
            )}
          </>
        ) : (
          <div className="connect-prompt">
            <h2>Connect Phantom Wallet to Get Started</h2>
            <p>Create and manage liquidity pools on Solana Devnet</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
