import React, { useState } from 'react';
import { Pool } from '../store';
import '../styles/Modal.css';

interface AddLiquidityModalProps {
  pool: Pool;
  onClose: () => void;
  onLiquidityAdded: (pool: Pool) => void;
  walletAddress?: string;
}

const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({ pool, onClose, onLiquidityAdded, walletAddress }) => {
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddLiquidity = async () => {
    if (!tokenAAmount || !walletAddress) { alert('Please fill in all fields'); return; }
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const amount = parseFloat(tokenAAmount);
      const ratio = pool.tokenBAmount / pool.tokenAAmount;
      const updatedPool: Pool = {
        ...pool,
        tokenAAmount: pool.tokenAAmount + amount,
        tokenBAmount: pool.tokenBAmount + (amount * ratio),
        lpTokens: pool.lpTokens + amount,
      };
      onLiquidityAdded(updatedPool);
      onClose();
    } catch (error: unknown) {
      alert('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Liquidity</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Token A Amount</label>
            <input type="number" placeholder="0.00" value={tokenAAmount} onChange={(e) => setTokenAAmount(e.target.value)} disabled={isProcessing} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isProcessing}>Cancel</button>
          <button className="create-btn" onClick={handleAddLiquidity} disabled={isProcessing || !tokenAAmount}>Add Liquidity</button>
        </div>
      </div>
    </div>
  );
};

export default AddLiquidityModal;
