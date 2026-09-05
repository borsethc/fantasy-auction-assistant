import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { History, RotateCcw, Edit2, Check, X, TrendingUp, TrendingDown } from 'lucide-react';

export function DraftHistoryLog() {
  const { draftLog, players, teamsDetailed, undoLastPick, editPick, draftStats } = useAuction();
  
  const [editingPickNum, setEditingPickNum] = useState(null);
  const [editTeamId, setEditTeamId] = useState('');
  const [editCost, setEditCost] = useState(0);

  const handleStartEdit = (item) => {
    setEditingPickNum(item.pickNum);
    setEditTeamId(item.teamId);
    setEditCost(item.cost);
  };

  const handleSaveEdit = (pickNum) => {
    editPick(pickNum, editTeamId, parseInt(editCost, 10));
    setEditingPickNum(null);
  };

  return (
    <div className="glass-card" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Draft History & Audit Log
          </h2>
        </div>

        {draftLog.length > 0 && (
          <button 
            onClick={undoLastPick} 
            className="btn btn-outline"
            style={{ fontSize: '0.775rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '4px 10px' }}
            title="Undo the most recent draft pick"
          >
            <RotateCcw size={14} />
            Undo Last Pick
          </button>
        )}
      </div>

      {/* Positional Inflation Summary Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        {['RB', 'WR', 'QB', 'TE'].map(pos => {
          const rate = draftStats.posInflation[pos] || 0;
          const isUp = rate > 0;
          return (
            <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.725rem', fontWeight: 700 }}>
              <span className={`pos-badge pos-${pos}`}>{pos}</span>
              <span style={{ color: isUp ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                {isUp ? '+' : ''}{(rate * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log List */}
      <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        {draftLog.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...draftLog].reverse().map(item => {
              const player = players.find(p => p.id === item.playerId) || item.playerSnapshot;
              const team = teamsDetailed.find(t => t.id === item.teamId);
              const diff = item.cost - (player ? player.baseValue : 0);
              const isEditing = editingPickNum === item.pickNum;

              return (
                <div 
                  key={item.pickNum}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'transparent',
                    fontSize: '0.825rem'
                  }}
                >
                  {/* Pick # & Player details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontWeight: 800, 
                      color: 'var(--text-muted)', 
                      fontSize: '0.75rem',
                      width: '24px'
                    }}>
                      #{item.pickNum}
                    </span>

                    {player && <span className={`pos-badge pos-${player.pos}`}>{player.pos}</span>}

                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {player ? player.name : 'Unknown Player'}
                      </div>
                      
                      {!isEditing ? (
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          Drafted by <strong style={{ color: team?.isUser ? '#38bdf8' : 'var(--text-main)' }}>{team ? team.name : 'Unknown Team'}</strong>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <select 
                            value={editTeamId} 
                            onChange={(e) => setEditTeamId(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem' }}
                          >
                            {teamsDetailed.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            value={editCost} 
                            onChange={(e) => setEditCost(e.target.value)} 
                            style={{ width: '50px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', textAlign: 'center' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                        ${item.cost}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: diff >= 0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                        {diff >= 0 ? `+$${diff}` : `-$${Math.abs(diff)}`} vs base
                      </div>
                    </div>

                    {!isEditing ? (
                      <button 
                        onClick={() => handleStartEdit(item)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Edit pick"
                      >
                        <Edit2 size={14} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleSaveEdit(item.pickNum)} style={{ background: 'var(--accent-success)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 6px', cursor: 'pointer' }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditingPickNum(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 6px', cursor: 'pointer' }}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No draft picks logged yet. Start nominating and bidding on players!
          </div>
        )}
      </div>

    </div>
  );
}
