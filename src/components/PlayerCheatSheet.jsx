import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext';
import { 
  Search, Star, Filter, ArrowUpDown, Flame, PlusCircle, 
  Check, MessageSquare, Info, ShieldAlert, UserCheck, Users, UserX 
} from 'lucide-react';

export function PlayerCheatSheet() {
  const { 
    players, 
    startNomination, 
    draftPlayerToMyTeam,
    draftPlayerToOpponent,
    removePlayerFromAvailable,
    toggleTargetPlayer, 
    updatePlayerNote,
    teamsDetailed 
  } = useAuction();

  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('AVAILABLE');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('dynamicValue');
  const [sortDir, setSortDir] = useState('desc');

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      if (activeTab === 'TARGETS' && !p.isTarget) return false;
      if (['QB', 'RB', 'WR', 'TE', 'K', 'DST'].includes(activeTab) && p.pos !== activeTab) return false;

      if (ownerFilter !== 'ALL') {
        if (ownerFilter === 'MY_TEAM') {
          const userTeam = teamsDetailed.find(t => t.isUser);
          if (p.draftedBy !== userTeam?.id) return false;
        } else {
          if (p.draftedBy !== ownerFilter) return false;
        }
      } else {
        if (statusFilter === 'AVAILABLE' && p.status === 'DRAFTED') return false;
        if (statusFilter === 'DRAFTED' && p.status !== 'DRAFTED') return false;
      }

      if (tierFilter !== 'ALL' && p.tier !== parseInt(tierFilter, 10)) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesTeam = p.team.toLowerCase().includes(q);
        const matchesNote = p.notes && p.notes.toLowerCase().includes(q);
        if (!matchesName && !matchesTeam && !matchesNote) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'tier') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      return sortDir === 'desc' ? valB - valA : valA - valB;
    });
  }, [players, activeTab, statusFilter, ownerFilter, tierFilter, search, sortBy, sortDir, teamsDetailed]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Player Rankings & Quick Draft
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Log picks to your team or opponents with 1-click
          </p>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 10px', width: '100%', maxWidth: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ marginRight: '6px' }} />
          <input 
            type="text"
            placeholder="Filter player, team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Position Tabs Bar (Horizontal Touch Scroll on iPhone) */}
      <div className="mobile-tabs-scroll" style={{ display: 'flex', gap: '6px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        {['ALL', 'TARGETS', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'].map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {tab === 'TARGETS' && <Star size={12} fill={isActive ? '#ffffff' : 'var(--accent-warning)'} color={isActive ? '#ffffff' : 'var(--accent-warning)'} />}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px', fontSize: '0.775rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {['AVAILABLE', 'DRAFTED', 'ALL'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: statusFilter === st ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} color="var(--text-muted)" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 6px',
                fontSize: '0.725rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Tiers</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
              <option value="4">Tier 4</option>
              <option value="5">Tier 5</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                if (e.target.value !== 'ALL') setStatusFilter('DRAFTED');
              }}
              style={{
                background: 'rgba(0,0,0,0.3)',
                color: ownerFilter !== 'ALL' ? 'var(--accent-primary)' : 'var(--text-main)',
                border: ownerFilter !== 'ALL' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 6px',
                fontSize: '0.725rem',
                outline: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Owners</option>
              <option value="MY_TEAM">Chad Borseth (You)</option>
              {teamsDetailed.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
          <strong>{filteredPlayers.length}</strong> players
        </div>
      </div>

      {/* Players Table */}
      <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
          <thead style={{ background: 'rgba(0,0,0,0.4)', position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th style={{ padding: '8px 8px', width: '28px' }}>⭐</th>
              <th style={{ padding: '8px 8px' }}>Player</th>
              <th style={{ padding: '8px 8px', cursor: 'pointer' }} onClick={() => handleSort('tier')}>
                T <ArrowUpDown size={10} />
              </th>
              <th className="mobile-hide" style={{ padding: '8px 8px', cursor: 'pointer' }} onClick={() => handleSort('baseValue')}>
                Base $
              </th>
              <th style={{ padding: '8px 8px', cursor: 'pointer' }} onClick={() => handleSort('dynamicValue')}>
                <span style={{ color: 'var(--accent-primary)' }}>$ <ArrowUpDown size={10} /></span>
              </th>
              <th style={{ padding: '8px 8px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map(p => {
                const isDrafted = p.status === 'DRAFTED';
                const draftedTeam = isDrafted ? teamsDetailed.find(t => t.id === p.draftedBy) : null;
                const price = p.dynamicValue || p.baseValue;

                return (
                  <tr 
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      opacity: isDrafted ? 0.45 : 1,
                      background: p.isTarget ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                    }}
                  >
                    {/* Star */}
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleTargetPlayer(p.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star 
                          size={15} 
                          fill={p.isTarget ? '#f59e0b' : 'none'} 
                          color={p.isTarget ? '#f59e0b' : 'var(--text-muted)'} 
                        />
                      </button>
                    </td>

                    {/* Name */}
                    <td style={{ padding: '8px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`pos-badge pos-${p.pos}`}>{p.pos}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: isDrafted ? 'var(--text-muted)' : '#ffffff', fontSize: '0.85rem' }}>
                            {p.name}
                            {isDrafted && (
                              <span style={{ fontSize: '0.675rem', color: draftedTeam?.isUser ? '#34d399' : 'var(--text-muted)', marginLeft: '4px', fontWeight: 700 }}>
                                (${p.cost} {draftedTeam?.isUser ? 'YOU' : ''})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {p.team} · #{p.rank}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td style={{ padding: '8px 6px', fontWeight: 600 }}>
                      T{p.tier}
                    </td>

                    {/* Base $ */}
                    <td className="mobile-hide" style={{ padding: '8px 6px', fontWeight: 600 }}>
                      ${p.baseValue}
                    </td>

                    {/* Dynamic $ */}
                    <td style={{ padding: '8px 6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                        ${price}
                      </span>
                    </td>

                    {/* Touch Action Buttons */}
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                      {!isDrafted ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            onClick={() => draftPlayerToMyTeam(p, price)}
                            className="btn btn-success"
                            style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 800, minHeight: '36px' }}
                            title="Draft to My Team"
                          >
                            + You
                          </button>

                          <button
                            onClick={() => draftPlayerToOpponent(p, price)}
                            className="btn btn-outline"
                            style={{ padding: '6px 8px', fontSize: '0.7rem', color: 'var(--text-muted)', minHeight: '36px' }}
                            title="Mark Opponent Drafted"
                          >
                            Opponent
                          </button>

                          <button
                            onClick={() => removePlayerFromAvailable(p, 0)}
                            className="btn btn-outline"
                            style={{ padding: '6px 8px', fontSize: '0.7rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.4)', minHeight: '36px' }}
                            title="Remove from available pool (Taken)"
                          >
                            <UserX size={12} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Taken</span>
                      )}
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching players found.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}
