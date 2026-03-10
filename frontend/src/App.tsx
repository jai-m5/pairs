import React, { useState, useEffect } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import DexScreen from './components/DexScreen';
import AddLiquidityModal from './components/AddLiquidityModal';
import ConnectWallet from './components/ConnectWallet';
import PoolInfo from './components/PoolInfo';
import { getAllPoolsFromLocalStorage } from './utils/solana';
import './styles/App.css';

export interface Pool {
  address: string;
  tokenAMint: string;
  tokenBMint: string;
  tokenAAmount: number;
  tokenBAmount: number;
  lpTokens: number;
  fee: number;
}

const App: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connection] = useState(
    new Connection(clusterApiUrl('devnet'), 'confirmed')
  );
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);

  useEffect(() => {
    // Load pools from local storage
    try {
      const savedPools = getAllPoolsFromLocalStorage();
      setPools(savedPools);
    } catch (error) {
      console.error('Error loading pools:', error);
    }
  }, []);

  const handleConnectWallet = (address: string | undefined) => {
    setWalletAddress(address || null);
    setConnected(!!address);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setWalletAddress(null);
  };

  const handleAddLiquidity = (pool: Pool) => {
    setSelectedPool(pool);
    setShowAddLiquidityModal(true);
  };

  const handleCreatePool = (newPool: Pool) => {
    const updatedPools = [...pools, newPool];
    setPools(updatedPools);
    localStorage.setItem('liquidityPools', JSON.stringify(updatedPools));
  };

  const handleLiquidityAdded = (updatedPool: Pool) => {
    const updatedPools = pools.map(p => 
      p.address === updatedPool.address ? updatedPool : p
    );
    setPools(updatedPools);
    localStorage.setItem('liquidityPools', JSON.stringify(updatedPools));
    setShowAddLiquidityModal(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Solana DEX - Liquidity Trading</h1>
        <ConnectWallet 
          onConnect={handleConnectWallet}
          onDisconnect={handleDisconnect}
          connected={connected}
          address={walletAddress}
        />
      </header>

      <main className="app-main">
        {connected ? (
          <div className="dex-container">
            <div className="left-panel">
              <PoolInfo 
                pools={pools}
                onAddLiquidity={handleAddLiquidity}
                onCreatePool={handleCreatePool}
                walletAddress={walletAddress || undefined}
                connection={connection}
              />
            </div>
            <div className="right-panel">
              <DexScreen 
                pools={pools}
                selectedPool={selectedPool}
                walletAddress={walletAddress || undefined}
              />
            </div>
          </div>
        ) : (
          <div className="connect-prompt">
            <h2>Connect Your Wallet to Get Started</h2>
            <p>Please connect your Solana wallet to start trading and adding liquidity.</p>
          </div>
        )}
      </main>

      {showAddLiquidityModal && selectedPool && (
        <AddLiquidityModal
          pool={selectedPool}
          onClose={() => setShowAddLiquidityModal(false)}
          onLiquidityAdded={handleLiquidityAdded}
          walletAddress={walletAddress || undefined}
        />
      )}
    </div>
  );
};

export default App;
