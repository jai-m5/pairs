import React, { useState, useEffect } from 'react';
import { getAllPoolsFromLocalStorage } from './utils/solana';
import { Pool } from './store';

const App: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [appError, setAppError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('App: Loading pools...');
      const savedPools = getAllPoolsFromLocalStorage();
      console.log('App: Loaded pools:', savedPools);
      setPools(savedPools);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('App: Error loading pools:', errMsg);
      setAppError('Failed to load pools: ' + errMsg);
    }
  }, []);

  return (
    <div className="app" style={{ background: '#0f1419' }}>
      <header className="app-header" style={{ background: '#1a1f2e', borderBottom: '1px solid #333', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', color: '#14f195' }}>🚀 Solana DEX - Liquidity Trading</h1>
        <div style={{ fontSize: '14px', color: '#14f195' }}>
          App Status: OK
        </div>
      </header>

      {appError && (
        <div style={{
          padding: '16px',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid #dc2626',
          color: '#dc2626',
          margin: '16px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          ⚠️ {appError}
        </div>
      )}

      <main style={{ flex: 1, padding: '20px', color: '#e0e0e0' }}>
        <h2>✅ Test App Loaded!</h2>
        <p>Pools Loaded: {pools.length}</p>
        <p>Storage working: {localStorage ? '✅ Yes' : '❌ No'}</p>
      </main>
    </div>
  );
};

export default App;
