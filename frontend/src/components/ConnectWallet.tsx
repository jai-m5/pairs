import React, { useState, useEffect } from 'react';
import '../styles/ConnectWallet.css';

interface ConnectWalletProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  connected: boolean;
  address: string | null;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, onDisconnect, connected, address }) => {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (connecting) return;
    setConnecting(true);
    try {
      if ((window as any).solana && (window as any).solana.isPhantom) {
        const response = await (window as any).solana.connect();
        const publicKey = response.publicKey.toString();
        localStorage.setItem('phantomWallet', publicKey);
        onConnect(publicKey);
      } else {
        alert('Please install Phantom wallet');
      }
    } catch (error) {
      alert('Error connecting: ' + error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if ((window as any).solana) {
        await (window as any).solana.disconnect();
      }
      localStorage.removeItem('phantomWallet');
      onDisconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  useEffect(() => {
    const savedWallet = localStorage.getItem('phantomWallet');
    if (savedWallet && !connected) {
      onConnect(savedWallet);
    }
  }, []);

  if (connected && address) {
    return (
      <div className="wallet-info">
        <span className="wallet-address">{address.slice(0, 8)}...</span>
        <button className="disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
      </div>
    );
  }

  return <button className="connect-btn" onClick={handleConnect} disabled={connecting}>{connecting ? 'Connecting...' : 'Connect Phantom'}</button>;
};

export default ConnectWallet;
