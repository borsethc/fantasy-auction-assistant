import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { Trophy, DollarSign, Shield, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export function MyTeamSummary() {
  const { teamsDetailed, settings } = useAuction();
  const userTeam = teamsDetailed.find(t => t.isUser) || teamsDetailed[0];

  if (!userTeam) return null;

  // Compute required roster slots
  const slotsConfig = settings.rosterSlots;
  const userRoster = userTeam.rosterByPos;

  // Build slot slots array
  const slotItems = [];

  const addSlots = (pos, count) => {
    const drafted = userRoster[pos] || [];
    for (let i = 0; i < count; i++) {
      slotItems.push({
        slotName: count > 1 ? `${pos}${i + 1}` : pos,
        pos,
        player: drafted[i] || null
      });
    }
  };

  addSlots('QB', slotsConfig.QB ?? 1);
  addSlots('RB', slotsConfig.RB ?? 2);
  addSlots('WR', slotsConfig.WR ?? 2);
  addSlots('TE', slotsConfig.TE ?? 1);
  if (slotsConfig.FLEX > 0) {
    addSlots('FLEX', slotsConfig.FLEX);
  }
  addSlots('K', slotsConfig.K ?? 1);
  addSlots('DST', slotsConfig.DST ?? 1);

  // Bench slots (5)
  const benchDrafted = [
    ...(userRoster.QB?.slice(slotsConfig.QB ?? 1) || []),
    ...(userRoster.RB?.slice(slotsConfig.RB ?? 2) || []),
    ...(userRoster.WR?.slice(slotsConfig.WR ?? 2) || []),
    ...(userRoster.TE?.slice(slotsConfig.TE ?? 1) || []),
    ...(userRoster.K?.slice(slotsConfig.K ?? 1) || []),
    ...(userRoster.DST?.slice(slotsConfig.DST ?? 1) || []),
  ];

  for (let b = 0; b < (slotsConfig.BENCH ?? 5); b++) {
    slotItems.push({
      slotName: `BN${b + 1}`,
      pos: 'BENCH',
      player: benchDrafted[b] || null
    });
  }

  return (
    <div className="glass-card" style={{ padding: '20px', borderColor: 'var(--border-highlight)' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} color="var(--accent-primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#38bdf8' }}>
              {userTeam.name}
            </h2>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              13 Roster Slots (8 Starters: 1 QB, 2 RB, 2 WR, 1 TE, 1 K, 1 DST · 5 Bench)
            </p>
          </div>
        </div>

        {/* Budget Allocation Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cash Remaining</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
              ${userTeam.remainingBudget}
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Bid Ceiling</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              ${userTeam.maxBid}
            </div>
          </div>
        </div>
      </div>

      {/* Roster Slots Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
        {slotItems.map((slot, idx) => {
          const isFilled = Boolean(slot.player);
          return (
            <div 
              key={idx}
              style={{
                background: isFilled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 0, 0, 0.25)',
                border: isFilled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`pos-badge pos-${slot.pos === 'BENCH' ? 'K' : slot.pos}`}>
                  {slot.slotName}
                </span>

                {isFilled ? (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                      {slot.player.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {slot.player.team} · Bye {slot.player.bye}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Open Slot
                  </span>
                )}
              </div>

              {isFilled ? (
                <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                  ${slot.player.cost}
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Need
                </span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
