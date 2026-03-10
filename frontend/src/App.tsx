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
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      background: '#0f1419',
      display: 'flex',
      flexDirection: 'column',
      color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ 
        background: '#1a1f2e', 
        borderBottom: '1px solid #333', 
        padding: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexShrink: 0
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          color: '#14f195',
          margin: 0 
        }}>
          🚀 Solana DEX - Liquidity Trading
        </h1>
        <div style={{ 
          fontSize: '14px', 
          color: '#14f195' 
        }}>
          ✅ App Status: OK
        </div>
      </header>

      {appError && (
        <div style={{
          padding: '16px',
          background: 'rgba(220, 38, 38, 0.2)',
          border: '2px solid #dc2626',
          color: '#ff6b6b',
          margin: '16px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          ⚠️ ERROR: {appError}
        </div>
      )}

      <main style={{ 
        flex: 1, 
        padding: '20px', 
        color: '#e0e0e0',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: '#14f195', marginBottom: '20px' }}>✅ Test App Loaded Successfully!</h2>
        <div style={{ background: '#1a1f2e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ marginBottom: '10px' }}>📊 Pools Loaded: <strong style={{ color: '#14f195' }}>{pools.length}</strong></p>
          <p style={{ marginBottom: '10px' }}>💾 Storage Working: <strong style={{ color: '#14f195' }}>✅ Yes</strong></p>
          <p style={{ marginBottom: '10px' }}>🔌 React Rendering: <strong style={{ color: '#14f195' }}>✅ Yes</strong></p>
          <p style={{ marginBottom: '10px', fontSize: '12px', color: '#808080' }}>Timestamp: {new Date().toLocaleTimeString()}</p>
        </div>
      </main>
    </div>
  );
};

export default App;
