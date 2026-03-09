import React, { useState } from 'react';
import './styles/App.css';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <div className="app" style={{background: '#0f1419', color: '#14f195', padding: '20px', fontSize: '20px'}}>
      <h1>✓ Solana DEX Test</h1>
      <p>Wallet: {walletAddress ? 'Connected' : 'Not Connected'}</p>
    </div>
  );
};

export default App;
