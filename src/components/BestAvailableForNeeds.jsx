import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Target, UserCheck, Users, UserX, Gavel, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export function BestAvailableForNeeds() {
  const { 
    players, 
    settings, 
    teamsDetailed, 
    draftPlayerToMyTeam, 
    draftPlayerToOpponent, 
    removePlayerFromAvailable, 
    startNomination 
  } = useAuction();

  const [customBids, setCustomBids] = useState({});

  const userTeam = teamsDetailed.find(t => t.isUser) || teamsDetailed[0];
  const availablePlayers = players.filter(p => p.status === 'AVAILABLE');

  if (availablePlayers.length === 0) return null;

  // Compute roster slot open needs for user
  const filledCounts = {
    QB: userTeam.rosterByPos.QB?.length || 0,
    RB: userTeam.rosterByPos.RB?.length || 0,
    WR: userTeam.rosterByPos.WR?.length || 0,
    TE: userTeam.rosterByPos.TE?.length || 0,
    K: userTeam.rosterByPos.K?.length || 0,
    DST: userTeam.rosterByPos.DST?.length || 0,
    BENCH: userTeam.rosterByPos.BENCH?.length || 0
  };

  const neededSlots = {
    QB: Math.max(0, (settings.rosterSlots.QB || 1) - filledCounts.QB),
    RB: Math.max(0, (settings.rosterSlots.RB || 2) - filledCounts.RB),
    WR: Math.max(0, (settings.rosterSlots.WR || 2) - filledCounts.WR),
    TE: Math.max(0, (settings.rosterSlots.TE || 1) - filledCounts.TE),
    K: Math.max(0, (settings.rosterSlots.K || 1) - filledCounts.K),
    DST: Math.max(0, (settings.rosterSlots.DST || 1) - filledCounts.DST),
    BENCH: Math.max(0, (settings.rosterSlots.BENCH || 5) - filledCounts.BENCH)
  };

  const hasStarterNeeds = neededSlots.QB > 0 || neededSlots.RB > 0 || neededSlots.WR > 0 || neededSlots.TE > 0 || neededSlots.K > 0 || neededSlots.DST > 0;

  // Build target recommendations list
  const recommendations = [];

  const addTopForPos = (pos, needType, count = 1) => {
    const posAvailable = availablePlayers
      .filter(p => p.pos === pos)
      .sort((a, b) => (b.dynamicValue || b.baseValue) - (a.dynamicValue || a.baseValue) || b.projPts - a.projPts);

    posAvailable.slice(0, count).forEach(player => {
      if (!recommendations.some(r => r.player.id === player.id)) {
        recommendations.push({
          player,
          needType,
          pos
        });
      }
    });
  };

  // Add recommendations based on highest priority unfilled starter slots
  if (neededSlots.RB > 0) addTopForPos('RB', `Starter Need (RB${filledCounts.RB + 1})`, Math.min(2, neededSlots.RB));
  if (neededSlots.WR > 0) addTopForPos('WR', `Starter Need (WR${filledCounts.WR + 1})`, Math.min(2, neededSlots.WR));
  if (neededSlots.QB > 0) addTopForPos('QB', 'Starter Need (QB1)', 1);
  if (neededSlots.TE > 0) addTopForPos('TE', 'Starter Need (TE1)', 1);
  if (neededSlots.K > 0 && availablePlayers.length < 50) addTopForPos('K', 'Starter Need (K)', 1);
  if (neededSlots.DST > 0 && availablePlayers.length < 50) addTopForPos('DST', 'Starter Need (DST)', 1);

  // If all starters are filled, recommend best available RB/WR depth for Bench
  if (recommendations.length === 0) {
    addTopForPos('RB', 'Bench Depth (Best Available RB)', 2);
    addTopForPos('WR', 'Bench Depth (Best Available WR)', 2);
    addTopForPos('TE', 'Bench Depth (TE Backup)', 1);
  }

  const handleBidChange = (playerId, val) => {
    setCustomBids(prev => ({
      ...prev,
      [playerId]: val
    }));
  };

  return (
    <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '16px', border: '1px solid var(--accent-primary-glow)' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff', letterSpacing: '0.5px' }}>
            🎯 BEST AVAILABLE FOR YOUR ROSTER NEEDS
          </h3>
        </div>

        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          background: hasStarterNeeds ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
          color: hasStarterNeeds ? 'var(--accent-primary)' : '#34d399', 
          border: hasStarterNeeds ? '1px solid var(--accent-primary)' : '1px solid #10b981', 
          padding: '4px 10px', 
          borderRadius: '12px' 
        }}>
          {hasStarterNeeds ? `${userTeam.openSpotsCount} Roster Spot(s) Open` : 'Starters Filled! Bench Mode'}
        </span>
      </div>

      {/* Roster Needs Breakdown Summary Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center', marginRight: '4px' }}>
          Needs:
        </span>
        {Object.entries(neededSlots).map(([pos, count]) => {
          if (count === 0) return null;
          return (
            <span 
              key={pos}
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: pos === 'BENCH' ? 'rgba(255,255,255,0.06)' : 'rgba(239, 68, 68, 0.15)',
                color: pos === 'BENCH' ? 'var(--text-muted)' : '#f87171',
                border: pos === 'BENCH' ? '1px solid var(--border-color)' : '1px solid rgba(239, 68, 68, 0.4)'
              }}
            >
              Need {count} {pos}
            </span>
          );
        })}
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recommendations.slice(0, 4).map(({ player, needType }) => {
          const targetPrice = player.dynamicValue || player.baseValue;
          const currentBidVal = customBids[player.id] !== undefined ? customBids[player.id] : targetPrice;
          const numericBid = parseInt(currentBidVal, 10) || 1;

          return (
            <div 
              key={player.id}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Row 1: Badges & Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`pos-badge pos-${player.pos}`}>{player.pos}</span>
                  <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--accent-warning)', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {needType}
                  </span>
                </div>

                {/* Custom Bid Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>Winning Bid: $</span>
                  <input 
                    type="number"
                    min="1"
                    max="1000"
                    value={currentBidVal}
                    onChange={(e) => handleBidChange(player.id, e.target.value)}
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

              {/* Row 2: Player Details */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {player.team} · Bye Wk {player.bye} · Proj: {player.projPts} pts · Tier {player.tier}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Value</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    ${targetPrice}
                  </div>
                </div>
              </div>

              {/* Row 3: 1-Click Action Buttons */}
              <div className="action-buttons-grid">
                <button 
                  onClick={() => draftPlayerToMyTeam(player, numericBid)}
                  className="btn btn-success"
                  style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, justifyContent: 'center' }}
                  title={`Draft to your team for $${numericBid}`}
                >
                  <UserCheck size={14} /> + You (${numericBid})
                </button>

                <button 
                  onClick={() => draftPlayerToOpponent(player, numericBid)}
                  className="btn btn-outline"
                  style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, borderColor: 'var(--border-highlight)', color: '#e0e7ff', justifyContent: 'center' }}
                  title={`Mark taken by opponent for $${numericBid}`}
                >
                  <Users size={14} /> Opponent (${numericBid})
                </button>

                <button 
                  onClick={() => removePlayerFromAvailable(player, 0)}
                  className="btn btn-outline"
                  style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', justifyContent: 'center' }}
                  title="Remove from available pool (Taken)"
                >
                  <UserX size={14} /> Remove
                </button>

                <button 
                  onClick={() => startNomination(player, numericBid)}
                  className="btn btn-outline"
                  style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 800, borderColor: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', justifyContent: 'center' }}
                  title="Put on live bidding block"
                >
                  <Gavel size={14} /> Block
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
