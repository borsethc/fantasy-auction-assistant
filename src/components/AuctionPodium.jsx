import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { 
  Gavel, DollarSign, Plus, Minus, UserCheck, AlertTriangle, 
  CheckCircle2, XCircle, Search, Flame, Zap, ShieldAlert, Users, Sparkles, UserX, History, Trash2 
} from 'lucide-react';

export function AuctionPodium() {
  const { 
    activeNomination, 
    players, 
    teamsDetailed, 
    draftLog,
    startNomination, 
    draftPlayerToMyTeam,
    draftPlayerToOpponent,
    assignPlayerToTeam,
    removePlayerFromAvailable,
    removePlayerFromRoster,
    updateBid, 
    finalizeSale, 
    cancelNomination, 
    passPlayerUndrafted 
  } = useAuction();

  const [searchQuery, setSearchQuery] = useState('');
  const [customBidInput, setCustomBidInput] = useState('');
  const [searchBids, setSearchBids] = useState({});
  const searchInputRef = useRef(null);

  const activePlayer = activeNomination ? activeNomination.player : null;
  const highBidderTeam = activeNomination 
    ? teamsDetailed.find(t => t.id === activeNomination.highBidderId) 
    : null;

  const userTeam = teamsDetailed.find(t => t.isUser) || teamsDetailed[0];

  useEffect(() => {
    if (activeNomination) {
      setCustomBidInput(activeNomination.currentBid.toString());
    }
  }, [activeNomination?.currentBid]);

  const matchingPlayers = players.filter(p => {
    if (p.status !== 'AVAILABLE' && p.status !== 'NOMINATED') return false;
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    
    const nameParts = p.name.toLowerCase().split(' ');
    const lastName = nameParts[nameParts.length - 1] || '';
    const firstName = nameParts[0] || '';

    return p.name.toLowerCase().includes(q) || 
           lastName.startsWith(q) || 
           firstName.startsWith(q) ||
           p.pos.toLowerCase().startsWith(q) ||
           p.team.toLowerCase().startsWith(q);
  }).slice(0, 5);

  const lastTwoAuctioned = draftLog.slice(-2).reverse();

  const handleSelectPlayerForNomination = (player, bidVal) => {
    const startBid = Math.max(1, parseInt(bidVal, 10) || 1);
    startNomination(player, startBid);
    setSearchQuery('');
  };

  const handleSearchBidChange = (playerId, val) => {
    setSearchBids(prev => ({
      ...prev,
      [playerId]: val
    }));
  };

  const handleIncrement = (amount) => {
    if (!activeNomination) return;
    const nextBid = activeNomination.currentBid + amount;
    updateBid(nextBid, activeNomination.highBidderId);
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customBidInput, 10);
    if (!isNaN(val) && val > 0) {
      updateBid(val, activeNomination.highBidderId);
    }
  };

  // Keyboard shortcut: Spacebar to Sold to High Bidder / My Team
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space' && activeNomination) {
        e.preventDefault();
        finalizeSale();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNomination, finalizeSale]);

  let valueStatus = 'fair';
  if (activePlayer && activeNomination) {
    const currentPrice = activeNomination.currentBid;
    const dynamicVal = activePlayer.dynamicValue || activePlayer.baseValue;
    if (currentPrice <= Math.floor(dynamicVal * 0.85)) {
      valueStatus = 'bargain';
    } else if (currentPrice >= Math.ceil(dynamicVal * 1.25)) {
      valueStatus = 'overpriced';
    }
  }

  const isHighBidderUser = highBidderTeam?.isUser;
  const isUserOverMaxBid = isHighBidderUser && activeNomination && activeNomination.currentBid > userTeam.maxBid;

  return (
    <div className={`glass-card ${activeNomination ? 'active-podium-glow' : ''}`} style={{ padding: '20px', position: 'relative' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gavel size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Bidding Podium
          </h2>
        </div>

        {activeNomination && (
          <span style={{ 
            background: 'rgba(239, 68, 68, 0.25)', 
            color: '#f87171', 
            border: '1px solid rgba(239, 68, 68, 0.5)',
            padding: '4px 12px', 
            borderRadius: '16px',
            fontSize: '0.775rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
            ON THE BLOCK
          </span>
        )}
      </div>

      {/* STATE A: NO ACTIVE PLAYER ON BLOCK -> GIANT HIGH-VISIBILITY SEARCH FIELD */}
      {!activeNomination ? (
        <div>
          
          <div style={{ 
            background: 'rgba(6, 182, 212, 0.06)', 
            padding: '18px', 
            borderRadius: '12px', 
            border: '2px solid var(--accent-primary)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
            marginBottom: '16px' 
          }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔍 SEARCH PLAYER LAST NAME:
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', border: '2px solid var(--accent-primary)', borderRadius: '10px', padding: '8px 16px', boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)' }}>
              <Search size={24} color="var(--accent-primary)" style={{ marginRight: '10px' }} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Type last name (e.g. Barkley, Allen, Jefferson, Chase)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  width: '100%',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Real-time Player Search Results List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
            {matchingPlayers.length > 0 ? (
              matchingPlayers.map(p => {
                const targetPrice = p.dynamicValue || p.baseValue;
                const currentBidVal = searchBids[p.id] !== undefined ? searchBids[p.id] : targetPrice;
                const numericBid = parseInt(currentBidVal, 10) || 1;

                return (
                  <div 
                    key={p.id}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      borderBottom: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`pos-badge pos-${p.pos}`}>{p.pos}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.team} · Est. Auction Price: <strong style={{ color: 'var(--accent-primary)' }}>${targetPrice}</strong> (Base: ${p.baseValue})
                          </div>
                        </div>
                      </div>

                      {/* Custom Winning Bid Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>Winning Bid: $</span>
                        <input 
                          type="number"
                          min="1"
                          max="1000"
                          value={currentBidVal}
                          onChange={(e) => handleSearchBidChange(p.id, e.target.value)}
                          style={{
                            width: '55px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#ffffff',
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons: + You ($bid) | Opponent ($bid) | Remove | Block */}
                    {/* Action Buttons & Team Assignment Dropdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="action-buttons-grid">
                        {/* 1-Click Draft to MY TEAM */}
                        <button 
                          onClick={() => draftPlayerToMyTeam(p, numericBid)}
                          className="btn btn-success"
                          style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, justifyContent: 'center' }}
                          title={`Draft to your team for $${numericBid}`}
                        >
                          <UserCheck size={14} /> + You (${numericBid})
                        </button>

                        {/* 1-Click Draft to UNKNOWN TEAM */}
                        <button 
                          onClick={() => assignPlayerToTeam(p.id, 'team-opponent', numericBid)}
                          className="btn btn-outline"
                          style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, borderColor: 'rgba(245, 158, 11, 0.5)', color: '#fbbf24', justifyContent: 'center' }}
                          title={`Draft to Unknown Team for $${numericBid}`}
                        >
                          ❓ Unknown (${numericBid})
                        </button>

                        {/* Remove / Mark Taken */}
                        <button 
                          onClick={() => removePlayerFromAvailable(p, 0)}
                          className="btn btn-outline"
                          style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', justifyContent: 'center' }}
                          title="Remove player from available list (Taken)"
                        >
                          <UserX size={14} /> Remove
                        </button>

                        {/* Put on Block */}
                        <button 
                          onClick={() => handleSelectPlayerForNomination(p, numericBid)}
                          className="btn btn-outline"
                          style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, borderColor: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', justifyContent: 'center' }}
                          title="Put on live bidding block"
                        >
                          <Gavel size={14} /> Block
                        </button>
                      </div>

                      {/* Dropdown to assign to any specific team */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            assignPlayerToTeam(p.id, e.target.value, numericBid);
                          }
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#38bdf8',
                          border: '1px solid var(--accent-primary)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                        title="Assign to a specific team or Unknown Team"
                      >
                        <option value="">🎯 Or Assign Directly to Team...</option>
                        <option value={userTeam.id}>Chad Borseth (You)</option>
                        <optgroup label="League Managers">
                          {teamsDetailed.filter(t => !t.isUser && t.id !== 'team-opponent').map(t => (
                            <option key={t.id} value={t.id}>{t.name} (Max Bid: ${t.maxBid})</option>
                          ))}
                        </optgroup>
                        <option value="team-opponent">❓ Unknown Team (Unassigned)</option>
                      </select>
                    </div>
                  </div>
                );
              })
            ) : searchQuery.trim() ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No available players match "{searchQuery}".
              </div>
            ) : null}
          </div>

        </div>
      ) : (

        /* STATE B: ACTIVE PLAYER ON BIDDING BLOCK -> ULTRA-CLEAR WINNING BID & OWNER ASSIGNMENT */
        <div>
          
          {/* Active Player Banner */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(168, 85, 247, 0.12))', 
            padding: '16px', 
            borderRadius: '10px',
            border: '1px solid var(--border-highlight)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className={`pos-badge pos-${activePlayer.pos}`}>{activePlayer.pos}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {activePlayer.team} · Rank #{activePlayer.rank} · Tier {activePlayer.tier}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
                  {activePlayer.name}
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Est. Auction Price</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  ${activePlayer.dynamicValue || activePlayer.baseValue}
                </div>
              </div>
            </div>

            {activePlayer.notes && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                "{activePlayer.notes}"
              </div>
            )}
          </div>

          {/* WINNING BID DISPLAY */}
          <div style={{ textAlign: 'center', marginBottom: '18px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              💰 WINNING BID AMOUNT
            </div>
            
            <div style={{ 
              fontSize: '3.6rem', 
              fontWeight: 800, 
              fontFamily: 'var(--font-display)', 
              color: isUserOverMaxBid ? 'var(--accent-danger)' : '#ffffff',
              lineHeight: 1,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '2rem', color: 'var(--accent-primary)', marginRight: '2px' }}>$</span>
              {activeNomination.currentBid}
            </div>

            <div style={{ marginBottom: '14px' }}>
              {valueStatus === 'bargain' && (
                <span className="value-tag value-bargain">
                  <Zap size={12} /> BARGAIN PRICE
                </span>
              )}
              {valueStatus === 'fair' && (
                <span className="value-tag value-fair">
                  FAIR VALUE
                </span>
              )}
              {valueStatus === 'overpriced' && (
                <span className="value-tag value-overpriced">
                  <AlertTriangle size={12} /> OVERPRICED BID
                </span>
              )}
            </div>

            {/* Specific Winning Owner Picker */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Assign Winning Team:</span>
              <select 
                value={activeNomination.highBidderId} 
                onChange={(e) => updateBid(activeNomination.currentBid, e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: highBidderTeam?.isUser ? '#34d399' : (activeNomination.highBidderId === 'team-opponent' ? '#fbbf24' : '#60a5fa'),
                  border: highBidderTeam?.isUser ? '2px solid #10b981' : (activeNomination.highBidderId === 'team-opponent' ? '2px solid #f59e0b' : '1px solid var(--border-color)'),
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={userTeam.id}>★ {userTeam.name} (Max Bid: ${userTeam.maxBid})</option>
                <optgroup label="League Managers">
                  {teamsDetailed.filter(t => !t.isUser && t.id !== 'team-opponent').map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Max Bid: ${t.maxBid})
                    </option>
                  ))}
                </optgroup>
                <option value="team-opponent">❓ Unknown Team (Undetermined)</option>
              </select>
            </div>

            {isUserOverMaxBid && (
              <div style={{ 
                marginTop: '10px', 
                background: 'rgba(239, 68, 68, 0.15)', 
                color: '#f87171', 
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ShieldAlert size={14} />
                Warning: Bid exceeds your team's Max Affordable Bid (${userTeam.maxBid})!
              </div>
            )}
          </div>

          {/* Quick Bid Increments Pad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => handleIncrement(1)} className="btn btn-outline" style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              +$1
            </button>
            <button onClick={() => handleIncrement(5)} className="btn btn-outline" style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              +$5
            </button>
            <button onClick={() => handleIncrement(10)} className="btn btn-outline" style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              +$10
            </button>

            <form onSubmit={handleCustomBidSubmit} style={{ display: 'flex' }}>
              <input 
                type="number" 
                value={customBidInput}
                onChange={(e) => setCustomBidInput(e.target.value)}
                placeholder="Custom $"
                min="1"
                max="1000"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </form>
          </div>

          {/* PROMINENT ASSIGNMENT ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              
              {/* 1-Click SOLD TO MY TEAM */}
              <button 
                onClick={() => finalizeSale(userTeam.id, activeNomination.currentBid)}
                className="btn btn-success" 
                style={{ padding: '12px 10px', fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)' }}
                title="Draft player to your team"
              >
                <UserCheck size={18} />
                SOLD TO MY TEAM (${activeNomination.currentBid})
              </button>

              {/* 1-Click SOLD TO SELECTED OWNER */}
              <button 
                onClick={() => finalizeSale(activeNomination.highBidderId, activeNomination.currentBid)}
                className="btn btn-outline" 
                style={{ 
                  padding: '12px 10px', 
                  fontSize: '0.88rem', 
                  fontWeight: 800, 
                  borderColor: activeNomination.highBidderId === 'team-opponent' ? '#f59e0b' : 'var(--accent-primary)', 
                  color: activeNomination.highBidderId === 'team-opponent' ? '#fbbf24' : '#ffffff',
                  background: activeNomination.highBidderId === 'team-opponent' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.15)' 
                }}
                title={`Sell to ${highBidderTeam?.name || 'Selected Team'}`}
              >
                <Users size={18} />
                SOLD TO {activeNomination.highBidderId === 'team-opponent' ? 'UNKNOWN' : (highBidderTeam?.name?.toUpperCase() || 'SELECTED')} (${activeNomination.currentBid})
              </button>

            </div>

            {/* 1-Click SOLD TO UNKNOWN TEAM (if user didn't catch who won it) */}
            <button 
              onClick={() => finalizeSale('team-opponent', activeNomination.currentBid)}
              className="btn btn-outline" 
              style={{ 
                padding: '10px', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                borderColor: 'rgba(245, 158, 11, 0.4)', 
                color: '#fbbf24', 
                background: 'rgba(245, 158, 11, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Assign to Unknown Team if you cannot tell who won the player"
            >
              ❓ SOLD TO UNKNOWN TEAM (${activeNomination.currentBid})
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={passPlayerUndrafted} 
                className="btn btn-outline" 
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
              >
                <XCircle size={14} />
                Pass / Undrafted
              </button>
              
              <button 
                onClick={cancelNomination} 
                className="btn btn-outline" 
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
              >
                Cancel Block
              </button>
            </div>

          </div>

        </div>
      )}

      {/* LAST 2 PREVIOUS PLAYERS AUCTIONED BANNER */}
      <div style={{ marginTop: '18px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 16px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={14} color="var(--accent-primary)" />
          Last 2 Previous Players Auctioned:
        </div>

        {lastTwoAuctioned.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: lastTwoAuctioned.length === 1 ? '1fr' : '1fr 1fr', gap: '10px' }}>
            {lastTwoAuctioned.map(item => {
              const p = players.find(player => player.id === item.playerId) || item.playerSnapshot;
              const ownerTeam = teamsDetailed.find(t => t.id === item.teamId);
              const isUserTeam = ownerTeam?.isUser;

              return (
                <div 
                  key={item.pickNum} 
                  style={{ 
                    background: isUserTeam ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)', 
                    border: isUserTeam ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        Pick #{item.pickNum}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                        {p ? p.name : 'Unknown Player'} <span className={`pos-badge pos-${p?.pos}`} style={{ fontSize: '0.65rem', padding: '1px 4px' }}>{p?.pos}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Winning Bid</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isUserTeam ? '#34d399' : 'var(--accent-primary)' }}>
                        ${item.cost}
                      </div>
                    </div>
                  </div>

                  {/* Re-assign owner dropdown and delete button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Team:</span>
                      <select
                        value={item.teamId || 'team-opponent'}
                        onChange={(e) => assignPlayerToTeam(item.playerId, e.target.value, item.cost)}
                        style={{
                          background: item.teamId === 'team-opponent' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.5)',
                          color: isUserTeam ? '#34d399' : (item.teamId === 'team-opponent' ? '#fbbf24' : '#93c5fd'),
                          border: item.teamId === 'team-opponent' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '3px 6px',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          outline: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          maxWidth: '150px'
                        }}
                        title="Reassign team or change to Unknown Team"
                      >
                        <option value={userTeam.id}>Chad Borseth (You)</option>
                        <optgroup label="League Managers">
                          {teamsDetailed.filter(t => !t.isUser && t.id !== 'team-opponent').map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </optgroup>
                        <option value="team-opponent">❓ Unknown Team</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${p?.name || 'player'} from roster and return to available pool?`)) {
                          removePlayerFromRoster(item.playerId, item.pickNum);
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        borderRadius: '4px',
                        color: '#f87171',
                        padding: '3px 6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '0.7rem'
                      }}
                      title="Undo pick & return to available pool"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '6px 0' }}>
            No players auctioned yet in this draft.
          </div>
        )}
      </div>

    </div>
  );
}
