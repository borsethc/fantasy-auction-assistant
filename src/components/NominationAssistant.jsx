import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { Lightbulb, Flame, Target, DollarSign, Zap } from 'lucide-react';

export function NominationAssistant() {
  const { players, teamsDetailed, startNomination } = useAuction();

  // Find available players
  const available = players.filter(p => p.status === 'AVAILABLE');
  if (available.length === 0) return null;

  const userTeam = teamsDetailed.find(t => t.isUser) || teamsDetailed[0];

  // 1. Top Tier Player to Bleed Money
  const topTierToBleed = available
    .filter(p => p.tier === 1 || p.tier === 2)
    .sort((a, b) => (b.dynamicValue || b.baseValue) - (a.dynamicValue || a.baseValue))[0];

  // 2. High Value Target Star
  const valueTarget = available
    .filter(p => p.isTarget || p.tier <= 3)
    .sort((a, b) => (b.projPts / (b.dynamicValue || b.baseValue)) - (a.projPts / (a.dynamicValue || a.baseValue)))[0];

  // 3. $1 Dollar Sleeper
  const dollarSleeper = available
    .filter(p => (p.dynamicValue || p.baseValue) <= 5 && (p.tier === 4 || p.tier === 5))
    .sort((a, b) => b.projPts - a.projPts)[0];

  return (
    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Lightbulb size={18} color="var(--accent-warning)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-warning)' }}>
          Tactical Nomination Assistant
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        
        {/* Strategy 1: Bleed Rivals */}
        {topTierToBleed && (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-danger)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={12} /> Bleed Rival Cash
              </span>
              <span className={`pos-badge pos-${topTierToBleed.pos}`}>{topTierToBleed.pos}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
              {topTierToBleed.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Force opponents with cash to fight for top {topTierToBleed.pos}
            </div>
            <button 
              onClick={() => startNomination(topTierToBleed, 1)}
              className="btn btn-outline" 
              style={{ width: '100%', fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Nominate ${topTierToBleed.dynamicValue || topTierToBleed.baseValue} Player
            </button>
          </div>
        )}

        {/* Strategy 2: Value Snag */}
        {valueTarget && (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={12} /> Value Snag Target
              </span>
              <span className={`pos-badge pos-${valueTarget.pos}`}>{valueTarget.pos}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
              {valueTarget.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              High points-per-dollar efficiency pick
            </div>
            <button 
              onClick={() => startNomination(valueTarget, 1)}
              className="btn btn-outline" 
              style={{ width: '100%', fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Nominate ${valueTarget.dynamicValue || valueTarget.baseValue} Target
            </button>
          </div>
        )}

        {/* Strategy 3: Cheap Sleeper */}
        {dollarSleeper && (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} /> $1 Dollar Sleeper
              </span>
              <span className={`pos-badge pos-${dollarSleeper.pos}`}>{dollarSleeper.pos}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
              {dollarSleeper.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Sneak a low-cost bench player while rivals sleep
            </div>
            <button 
              onClick={() => startNomination(dollarSleeper, 1)}
              className="btn btn-outline" 
              style={{ width: '100%', fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Nominate $1 Sleeper
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
