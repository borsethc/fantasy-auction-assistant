import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { RefreshCw, Lock, KeyRound, AlertTriangle, ShieldCheck, CheckCircle, X, Archive, Sparkles } from 'lucide-react';

export function StartNewAuctionModal({ isOpen, onClose }) {
  const { startNewAuction, ownerPin, updateOwnerPin, currentAuctionName, draftLog } = useAuction();

  const [enteredPin, setEnteredPin] = useState('');
  const [newAuctionName, setNewAuctionName] = useState(() => `${currentAuctionName} (Fresh)`);
  const [archiveCurrent, setArchiveCurrent] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [customPinInput, setCustomPinInput] = useState('');

  if (!isOpen) return null;

  const handleStartNewAuction = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const res = startNewAuction(newAuctionName.trim() || 'Old Guys 2026 FFL Draft', enteredPin.trim(), {
      archiveCurrent,
      newPin: isChangingPin && customPinInput.trim().length >= 4 ? customPinInput.trim() : undefined
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to start new auction. Check PIN.');
      return;
    }

    setSuccessMessage('New auction draft initialized! All rosters & player pools reset.');
    setTimeout(() => {
      onClose();
      setSuccessMessage('');
      setEnteredPin('');
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        border: '2px solid rgba(6, 182, 212, 0.4)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={22} color="var(--accent-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                Start New Auction Draft
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                PIN-Protected Fresh Auction Session
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleStartNewAuction}>
          
          {/* New Auction Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              New Auction Draft Name
            </label>
            <input 
              type="text"
              value={newAuctionName}
              onChange={(e) => setNewAuctionName(e.target.value)}
              placeholder="e.g. Old Guys 2026 Live Draft #2"
              required
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '10px 12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          {/* Security PIN Entry */}
          <div style={{ 
            background: 'rgba(6, 182, 212, 0.06)', 
            border: '1px solid rgba(6, 182, 212, 0.3)', 
            borderRadius: '10px', 
            padding: '14px', 
            marginBottom: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                <KeyRound size={16} /> Owner Security PIN (Default: 1234)
              </label>
              <button
                type="button"
                onClick={() => setIsChangingPin(prev => !prev)}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.725rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isChangingPin ? 'Keep PIN' : 'Change PIN'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="password"
                maxLength="8"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter PIN (1234)"
                autoFocus
                required
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '10px 14px',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            {isChangingPin && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(6, 182, 212, 0.3)' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Set New 4-Digit Owner PIN:
                </label>
                <input 
                  type="text"
                  maxLength="8"
                  value={customPinInput}
                  onChange={(e) => setCustomPinInput(e.target.value)}
                  placeholder="New 4-digit PIN"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '8px',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    fontWeight: 700
                  }}
                />
              </div>
            )}
          </div>

          {/* Reset Scope Checklist */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.775rem' }}>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--accent-success)" />
              Fresh Auction Guarantee:
            </div>
            <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li>Clears all rosters & returns all players to available pool ($0 cost)</li>
              <li>Resets all 12 teams back to full $200 auction budgets</li>
              <li>Sets roster to 12 total spots: 8 starters + <strong>4 bench spots</strong></li>
              <li>Clears active podium and draft history log</li>
            </ul>
          </div>

          {/* Archive Option */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '16px', cursor: 'pointer' }}>
            <input 
              type="checkbox"
              checked={archiveCurrent}
              onChange={(e) => setArchiveCurrent(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <span>Archive current draft log ({draftLog.length} picks) for safety</span>
          </label>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', padding: '8px 12px', color: '#f87171', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '6px', padding: '8px 12px', color: '#34d399', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> {successMessage}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-danger"
              style={{ padding: '10px 18px', fontWeight: 800 }}
            >
              <RefreshCw size={16} /> Reset & Start Auction
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
