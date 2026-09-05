import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Shield, DollarSign, Users, Award, ChevronDown, ChevronUp, Zap, ListFilter, LayoutGrid, Eye, Trash2 } from 'lucide-react';

export function LeagueMatrix() {
  const { teamsDetailed, settings, totalRosterSpotsPerTeam, removePlayerFromRoster } = useAuction();
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'FULL_ROSTERS'
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState('ALL');
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [expandAll, setExpandAll] = useState(false);

  const toggleExpand = (id) => {
    setExpandedTeamId(prev => prev === id ? null : id);
  };

  const filteredTeams = teamsDetailed.filter(t => {
    if (selectedOwnerFilter === 'ALL') return true;
    if (selectedOwnerFilter === 'USER') return t.isUser;
    return t.id === selectedOwnerFilter;
  });

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            League Rosters & Budget Matrix
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Track player rosters, remaining cash, max bid ceilings, and open slot needs across all 12 teams
          </p>
        </div>

        {/* View Mode & Owner Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          
          {/* Owner Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <ListFilter size={14} color="var(--text-muted)" />
            <select
              value={selectedOwnerFilter}
              onChange={(e) => setSelectedOwnerFilter(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none',
                outline: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Owners ({settings.numTeams})</option>
              <option value="USER">Chad Borseth (You)</option>
              <option value="OPPONENTS">Opponents Only</option>
              {settings.teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Cards vs Full Rosters */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('GRID')}
              style={{
                background: viewMode === 'GRID' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'GRID' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LayoutGrid size={14} /> Cards View
            </button>

            <button
              onClick={() => setViewMode('FULL_ROSTERS')}
              style={{
                background: viewMode === 'FULL_ROSTERS' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'FULL_ROSTERS' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Eye size={14} /> Full Rosters Board
            </button>
          </div>

          {/* Expand/Collapse All Button */}
          {viewMode === 'GRID' && (
            <button
              onClick={() => setExpandAll(prev => !prev)}
              className="btn btn-outline"
              style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700 }}
            >
              {expandAll ? 'Collapse Rosters' : 'Expand All Rosters'}
            </button>
          )}

        </div>
      </div>

      {/* MODE A: SUMMARY CARDS VIEW */}
      {viewMode === 'GRID' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '14px' }}>
          {filteredTeams.map(team => {
            const isUser = team.isUser;
            const pctBudgetSpent = ((team.totalSpent / settings.salaryCap) * 100).toFixed(0);
            const isExpanded = expandAll || expandedTeamId === team.id;

            // Strategy Behavior Tag
            let strategyTag = { label: 'Balanced', color: '#60a5fa' };
            if (team.totalSpent > settings.salaryCap * 0.6 && team.filledSpotsCount <= 3) {
              strategyTag = { label: 'Stars & Dudes', color: '#c084fc' };
            } else if (team.remainingBudget < 15 && team.openSpotsCount > 3) {
              strategyTag = { label: 'Out of Cash', color: '#f87171' };
            } else if (team.remainingBudget > settings.salaryCap * 0.5 && team.filledSpotsCount > 5) {
              strategyTag = { label: 'Bargain Hoarder', color: '#34d399' };
            }

            return (
              <div 
                key={team.id}
                style={{
                  background: isUser ? 'rgba(6, 182, 212, 0.08)' : 'rgba(0, 0, 0, 0.25)',
                  border: isUser ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px',
                  boxShadow: isUser ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none',
                  position: 'relative'
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} color={isUser ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isUser ? '#38bdf8' : '#ffffff' }}>
                      {team.name}
                    </span>
                  </div>
                  {isUser && (
                    <span style={{ background: 'var(--accent-primary)', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      YOU
                    </span>
                  )}
                </div>

                {/* Budget Progress Bar */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget Spent</span>
                    <span style={{ fontWeight: 700 }}>
                      ${team.remainingBudget} Left <span style={{ color: 'var(--text-muted)' }}>(${team.totalSpent} spent)</span>
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${pctBudgetSpent}%`, 
                        background: pctBudgetSpent > 85 ? 'var(--accent-danger)' : 'var(--accent-primary)',
                        borderRadius: '3px',
                        transition: 'width 0.3s'
                      }} 
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Bid</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      ${team.maxBid}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Open Spots</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      {team.openSpotsCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>$/Open Spot</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                      ${team.avgPerOpenSpot}
                    </div>
                  </div>
                </div>

                {/* Strategy Tag & Roster Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ 
                    background: `${strategyTag.color}20`, 
                    color: strategyTag.color, 
                    border: `1px solid ${strategyTag.color}40`,
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    padding: '2px 6px', 
                    borderRadius: '4px' 
                  }}>
                    {strategyTag.label}
                  </span>

                  <button 
                    onClick={() => toggleExpand(team.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isUser ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Roster ({team.filledSpotsCount}/{totalRosterSpotsPerTeam}) {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Expanded Roster Breakdown */}
                {isExpanded && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.775rem' }}>
                    {team.teamPicks.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                        {team.teamPicks.map(p => (
                          <div key={p.pickNum} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '5px 8px', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className={`pos-badge pos-${p.playerSnapshot?.pos}`}>{p.playerSnapshot?.pos}</span>
                              <span style={{ fontWeight: 700, color: '#ffffff' }}>{p.playerSnapshot?.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>${p.cost}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete ${p.playerSnapshot?.name} from ${team.name} and return to available pool?`)) {
                                    removePlayerFromRoster(p.playerId, p.pickNum);
                                  }
                                }}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  borderRadius: '4px',
                                  color: '#f87171',
                                  padding: '2px 4px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                                title="Delete from roster (return to available pool)"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic', padding: '6px' }}>
                        No players drafted yet
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* MODE B: FULL LEAGUE ROSTERS BOARD (ALL OWNERS SIDE-BY-SIDE) */}
      {viewMode === 'FULL_ROSTERS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredTeams.map(team => {
            const isUser = team.isUser;
            return (
              <div 
                key={team.id}
                style={{
                  background: isUser ? 'rgba(6, 182, 212, 0.06)' : 'rgba(0, 0, 0, 0.3)',
                  border: isUser ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: isUser ? '#38bdf8' : '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={16} color={isUser ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                      {team.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Spent: <strong>${team.totalSpent}</strong> · Remaining: <strong style={{ color: '#34d399' }}>${team.remainingBudget}</strong> · Max Bid: <strong>${team.maxBid}</strong>
                    </div>
                  </div>

                  {isUser && (
                    <span style={{ background: 'var(--accent-primary)', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      YOUR TEAM
                    </span>
                  )}
                </div>

                {/* Roster Drafted List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {team.teamPicks.length > 0 ? (
                    team.teamPicks.map((pick, idx) => (
                      <div 
                        key={pick.pickNum}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.825rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', width: '20px' }}>#{idx + 1}</span>
                          <span className={`pos-badge pos-${pick.playerSnapshot?.pos}`}>{pick.playerSnapshot?.pos}</span>
                          <span style={{ fontWeight: 700, color: '#ffffff' }}>{pick.playerSnapshot?.name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                            ${pick.cost}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${pick.playerSnapshot?.name} from ${team.name} and return to available pool?`)) {
                                removePlayerFromRoster(pick.playerId, pick.pickNum);
                              }
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              borderRadius: '4px',
                              color: '#f87171',
                              padding: '2px 5px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            title="Delete from roster (return to available pool)"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      Roster is empty (0 players drafted)
                    </div>
                  )}

                  {/* Open Roster Slots Placeholder Tags */}
                  {team.openSpotsCount > 0 && (
                    <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Open Slots ({team.openSpotsCount}):</span>
                      {Array.from({ length: Math.min(6, team.openSpotsCount) }).map((_, i) => (
                        <span key={i} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                          Empty Slot #{i + 1}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
