import React, { useState, useEffect } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { searchToken, getTokenBalance, getSolBalance, formatNumber, TokenInfo, createPool } from '../utils/solana';
import { Pool } from '../store';
import '../styles/Modal.css';

interface CreatePoolModalProps {
  onClose: () => void;
  onPoolCreated: (pool: Pool) => void;
  walletAddress?: string;
}

const CreatePoolModal: React.FC<CreatePoolModalProps> = ({ onClose, onPoolCreated, walletAddress }) => {
  const connection = new Connection(clusterApiUrl('devnet'));
  
  const [tokenA, setTokenA] = useState<TokenInfo | null>(null);
  const [tokenB, setTokenB] = useState<TokenInfo | null>(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [balanceA, setBalanceA] = useState(0);
  const [balanceB, setBalanceB] = useState(0);
  const [solBalance, setSolBalance] = useState(0);

  useEffect(() => {
    if (!walletAddress) return;
    const fetchBalances = async () => {
      try {
        const wallet = new PublicKey(walletAddress);
        const sol = await getSolBalance(connection, wallet);
        setSolBalance(sol);
        if (tokenA) {
          const balance = await getTokenBalance(connection, wallet, new PublicKey(tokenA.address));
          setBalanceA(balance);
        }
        if (tokenB) {
          const balance = await getTokenBalance(connection, wallet, new PublicKey(tokenB.address));
          setBalanceB(balance);
        }
      } catch (err: unknown) {
        console.error('Error fetching balances:', err);
      }
    };
    fetchBalances();
  }, [walletAddress, tokenA, tokenB]);

  const handleSearchToken = async (query: string, isTokenA: boolean) => {
    if (!query.trim()) {
      if (isTokenA) setTokenA(null);
      else setTokenB(null);
      return;
    }
    try {
      const result = await searchToken(connection, query);
      if (result) {
        if (isTokenA) setTokenA(result);
        else setTokenB(result);
        setError('');
      } else {
        setError('Token not found');
      }
    } catch (err: unknown) {
      setError('Error searching token: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCreatePool = async () => {
    setError('');
    if (!walletAddress) { setError('Please connect wallet'); return; }
    if (!tokenA || !tokenB) { setError('Please select both tokens'); return; }
    if (tokenA.address === tokenB.address) { setError('Please select different tokens'); return; }
    if (!amountA || !amountB) { setError('Please enter amounts'); return; }

    const parsedAmountA = parseFloat(amountA);
    const parsedAmountB = parseFloat(amountB);

    if (parsedAmountA <= 0 || parsedAmountB <= 0) { setError('Amounts must be > 0'); return; }
    if (balanceA < parsedAmountA) { setError(`Need ${parsedAmountA} ${tokenA.symbol}, have ${balanceA}`); return; }
    if (balanceB < parsedAmountB) { setError(`Need ${parsedAmountB} ${tokenB.symbol}, have ${balanceB}`); return; }
    if (solBalance < 0.005) { setError(`Need 0.005 SOL for gas, have ${solBalance.toFixed(4)}`); return; }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPool = createPool(tokenA.address, tokenB.address, parsedAmountA, parsedAmountB);
      onPoolCreated(newPool);
      onClose();
    } catch (err: unknown) {
      setError('Error creating pool: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Liquidity Pool</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <div className="form-group">
            <label>Token A</label>
            <input type="text" placeholder="Search by symbol or address" onChange={(e) => handleSearchToken(e.target.value, true)} />
            {tokenA && <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f0f0' }}>
              <div><strong>{tokenA.symbol}</strong></div>
              <div>Balance: {formatNumber(balanceA)}</div>
            </div>}
          </div>
          <div className="form-group">
            <label>Amount A</label>
            <input type="number" placeholder="Amount" value={amountA} onChange={(e) => setAmountA(e.target.value)} disabled={isProcessing} />
          </div>
          <div className="form-group">
            <label>Token B</label>
            <input type="text" placeholder="Search by symbol or address" onChange={(e) => handleSearchToken(e.target.value, false)} />
            {tokenB && <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f0f0' }}>
              <div><strong>{tokenB.symbol}</strong></div>
              <div>Balance: {formatNumber(balanceB)}</div>
            </div>}
          </div>
          <div className="form-group">
            <label>Amount B</label>
            <input type="number" placeholder="Amount" value={amountB} onChange={(e) => setAmountB(e.target.value)} disabled={isProcessing} />
          </div>
          <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#f9f9f9'}}>
            <div>SOL Balance: {solBalance.toFixed(4)} SOL</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isProcessing}>Cancel</button>
          <button className="create-btn" onClick={handleCreatePool} disabled={isProcessing || !tokenA || !tokenB}>Create Pool</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolModal;
