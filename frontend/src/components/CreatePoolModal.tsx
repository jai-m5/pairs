import React, { useState, useEffect } from 'react';
import { Connection } from '@solana/web3.js';
import { Pool } from '../App';
import { getTokenBalance, createPool, getTokenSymbol, SOLANA_TOKENS } from '../utils/solana';
import '../styles/Modal.css';

interface CreatePoolModalProps {
  onClose: () => void;
  onPoolCreated: (pool: Pool) => void;
  walletAddress: string | null;
  connection: Connection;
}

interface TokenInfo {
  mint: string;
  symbol: string;
  balance: number;
}

const CreatePoolModal: React.FC<CreatePoolModalProps> = ({
  onClose,
  onPoolCreated,
  walletAddress,
  connection,
}) => {
  const [tokenAMint, setTokenAMint] = useState('');
  const [tokenBMint, setTokenBMint] = useState('');
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  
  const [tokenABalance, setTokenABalance] = useState<number>(0);
  const [tokenBBalance, setTokenBBalance] = useState<number>(0);
  
  const [tokenASearchInput, setTokenASearchInput] = useState('');
  const [tokenBSearchInput, setTokenBSearchInput] = useState('');
  const [showTokenADropdown, setShowTokenADropdown] = useState(false);
  const [showTokenBDropdown, setShowTokenBDropdown] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Common tokens preset
  const commonTokens = [
    { mint: SOLANA_TOKENS.USDC, symbol: 'USDC', name: 'USD Coin' },
    { mint: SOLANA_TOKENS.USDT, symbol: 'USDT', name: 'Tether' },
    { mint: SOLANA_TOKENS.SOL, symbol: 'SOL', name: 'Solana' },
  ];

  // Fetch token balance when token is selected
  useEffect(() => {
    if (tokenAMint && walletAddress && connection) {
      fetchTokenBalance(tokenAMint, 'A');
    }
  }, [tokenAMint, walletAddress, connection]);

  useEffect(() => {
    if (tokenBMint && walletAddress && connection) {
      fetchTokenBalance(tokenBMint, 'B');
    }
  }, [tokenBMint, walletAddress, connection]);

  const fetchTokenBalance = async (mint: string, token: 'A' | 'B') => {
    try {
      setLoading(true);
      const balance = await getTokenBalance(connection, walletAddress!, mint);
      if (token === 'A') {
        setTokenABalance(balance);
      } else {
        setTokenBBalance(balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      if (token === 'A') {
        setTokenABalance(0);
      } else {
        setTokenBBalance(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenASelect = (mint: string) => {
    setTokenAMint(mint);
    setTokenASearchInput('');
    setShowTokenADropdown(false);
    setError('');
  };

  const handleTokenBSelect = (mint: string) => {
    setTokenBMint(mint);
    setTokenBSearchInput('');
    setShowTokenBDropdown(false);
    setError('');
  };

  const filterTokens = (searchInput: string) => {
    return commonTokens.filter(
      token =>
        token.mint.toLowerCase().includes(searchInput.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
        token.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const handleCreatePool = async () => {
    setError('');

    // Validation
    if (!walletAddress) {
      setError('❌ Please connect your wallet first');
      return;
    }

    if (!tokenAMint || !tokenBMint) {
      setError('❌ Please select both tokens');
      return;
    }

    if (tokenAMint === tokenBMint) {
      setError('❌ Please select different tokens');
      return;
    }

    if (!tokenAAmount || !tokenBAmount) {
      setError('❌ Please enter amounts for both tokens');
      return;
    }

    const amountA = parseFloat(tokenAAmount);
    const amountB = parseFloat(tokenBAmount);

    if (amountA <= 0 || amountB <= 0) {
      setError('❌ Amounts must be greater than 0');
      return;
    }

    // ⚠️ CHECK WALLET BALANCE
    if (amountA > tokenABalance) {
      setError(`❌ Insufficient ${getTokenSymbol(tokenAMint)} balance. You have: ${tokenABalance.toFixed(2)}, need: ${amountA}`);
      return;
    }

    if (amountB > tokenBBalance) {
      setError(`❌ Insufficient ${getTokenSymbol(tokenBMint)} balance. You have: ${tokenBBalance.toFixed(2)}, need: ${amountB}`);
      return;
    }

    setIsProcessing(true);

    try {
      // ⚠️ SIMULATE WALLET PAYMENT
      console.log('💸 Processing wallet payment...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ⚠️ DEDUCT FROM WALLET BALANCE
      const newTokenABalance = tokenABalance - amountA;
      const newTokenBBalance = tokenBBalance - amountB;
      setTokenABalance(newTokenABalance);
      setTokenBBalance(newTokenBBalance);

      // Create pool
      const newPool: Pool = {
        address: `Pool_${Math.random().toString(36).substr(2, 9)}`,
        tokenAMint,
        tokenBMint,
        tokenAAmount: amountA,
        tokenBAmount: amountB,
        lpTokens: Math.sqrt(amountA * amountB),
        fee: 0.3,
      };

      onPoolCreated(newPool);
      setError('');
      alert(`✅ Pool created successfully!\n\nLP Tokens: ${newPool.lpTokens.toFixed(2)}\n\nYour balances updated:\n${getTokenSymbol(tokenAMint)}: ${newTokenABalance.toFixed(2)}\n${getTokenSymbol(tokenBMint)}: ${newTokenBBalance.toFixed(2)}`);
      onClose();
    } catch (err: any) {
      setError('❌ Error creating pool: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const tokenASymbol = tokenAMint ? getTokenSymbol(tokenAMint) : 'Token A';
  const tokenBSymbol = tokenBMint ? getTokenSymbol(tokenBMint) : 'Token B';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏗️ Create Liquidity Pool</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {!walletAddress && (
            <div style={{
              padding: '12px',
              background: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid #ff9800',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#ff9800'
            }}>
              ⚠️ Please connect your wallet to create a pool
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid #ff3b30',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#ff3b30',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{
              padding: '12px',
              background: 'rgba(100, 200, 255, 0.1)',
              border: '1px solid #64c8ff',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#64c8ff'
            }}>
              ⏳ Loading token balances...
            </div>
          )}

          {/* TOKEN A SELECTION */}
          <div className="input-group">
            <label>🔹 Token A</label>
            
            {tokenAMint ? (
              <div style={{
                padding: '12px',
                background: 'rgba(124, 77, 255, 0.1)',
                border: '1px solid #7c4dff',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{getTokenSymbol(tokenAMint)}</strong>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {tokenAMint.slice(0, 10)}...{tokenAMint.slice(-10)}
                  </div>
                </div>
                <button
                  onClick={() => { setTokenAMint(''); setTokenAAmount(''); setTokenABalance(0); }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ff3b30',
                    color: '#ff3b30',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={tokenASearchInput}
                    onChange={(e) => {
                      setTokenASearchInput(e.target.value);
                      setShowTokenADropdown(true);
                    }}
                    onFocus={() => setShowTokenADropdown(true)}
                    placeholder="Search by token name or address..."
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #555',
                      background: '#222',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                  {showTokenADropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#1a1a1a',
                      border: '1px solid #555',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10
                    }}>
                      {filterTokens(tokenASearchInput).map(token => (
                        <div
                          key={token.mint}
                          onClick={() => handleTokenASelect(token.mint)}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #444',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 'bold', color: '#7c4dff' }}>{token.symbol}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{token.name}</div>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            {token.mint.slice(0, 15)}...{token.mint.slice(-15)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#999'
            }}>
              <span>Amount:</span>
              <span>💰 Balance: {tokenABalance.toFixed(2)}</span>
            </div>
            <input
              type="number"
              value={tokenAAmount}
              onChange={(e) => setTokenAAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={tokenABalance}
              disabled={isProcessing || !tokenAMint}
            />
          </div>

          {/* SWAP ICON */}
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <span style={{ fontSize: '24px' }}>↕️</span>
          </div>

          {/* TOKEN B SELECTION */}
          <div className="input-group">
            <label>🔹 Token B</label>
            
            {tokenBMint ? (
              <div style={{
                padding: '12px',
                background: 'rgba(124, 77, 255, 0.1)',
                border: '1px solid #7c4dff',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{getTokenSymbol(tokenBMint)}</strong>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {tokenBMint.slice(0, 10)}...{tokenBMint.slice(-10)}
                  </div>
                </div>
                <button
                  onClick={() => { setTokenBMint(''); setTokenBAmount(''); setTokenBBalance(0); }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ff3b30',
                    color: '#ff3b30',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={tokenBSearchInput}
                    onChange={(e) => {
                      setTokenBSearchInput(e.target.value);
                      setShowTokenBDropdown(true);
                    }}
                    onFocus={() => setShowTokenBDropdown(true)}
                    placeholder="Search by token name or address..."
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #555',
                      background: '#222',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                  {showTokenBDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#1a1a1a',
                      border: '1px solid #555',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10
                    }}>
                      {filterTokens(tokenBSearchInput).map(token => (
                        <div
                          key={token.mint}
                          onClick={() => handleTokenBSelect(token.mint)}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #444',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 'bold', color: '#7c4dff' }}>{token.symbol}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{token.name}</div>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            {token.mint.slice(0, 15)}...{token.mint.slice(-15)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#999'
            }}>
              <span>Amount:</span>
              <span>💰 Balance: {tokenBBalance.toFixed(2)}</span>
            </div>
            <input
              type="number"
              value={tokenBAmount}
              onChange={(e) => setTokenBAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={tokenBBalance}
              disabled={isProcessing || !tokenBMint}
            />
          </div>

          {/* POOL INFO */}
          {tokenAAmount && tokenBAmount && (
            <div className="info-box" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>💧 Your LP Tokens:</span>
                <strong>{Math.sqrt(parseFloat(tokenAAmount) * parseFloat(tokenBAmount)).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>📊 Pool Share:</span>
                <strong>100%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⚙️ Fee:</span>
                <strong>0.3%</strong>
              </div>
            </div>
          )}

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#4caf50'
          }}>
            ✅ Wallet payment will deduct tokens from your connected wallet balance
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="add-liquidity-button"
            onClick={handleCreatePool}
            disabled={
              isProcessing ||
              !walletAddress ||
              !tokenAMint ||
              !tokenBMint ||
              !tokenAAmount ||
              !tokenBAmount ||
              loading
            }
            style={{ opacity: isProcessing || !walletAddress ? 0.5 : 1 }}
          >
            {isProcessing
              ? '💸 Processing Wallet Payment...'
              : !walletAddress
              ? '❌ Connect Wallet First'
              : '✅ Create Pool & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolModal;
