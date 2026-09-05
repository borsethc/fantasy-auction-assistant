import React, { useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { 
  Trophy, Settings, Download, Upload, RefreshCw, Volume2, VolumeX, 
  PlayCircle, FileSpreadsheet, TrendingUp, DollarSign, Users, Award 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function Header({ onOpenSettings, onOpenStartNewAuction }) {
  const { 
    settings, 
    draftStats, 
    loadDemoData, 
    exportDraftCSV, 
    exportStateJSON, 
    importStateJSON, 
    resetDraftState,
    currentAuctionName 
  } = useAuction();

  const fileInputRef = useRef(null);
  const [isMuted, setIsMuted] = React.useState(sounds.muted);

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      importStateJSON(file);
    }
  };

  const inflationColor = draftStats.overallInflationRate > 0.05 
    ? 'var(--accent-danger)' 
    : draftStats.overallInflationRate < -0.05 
      ? 'var(--accent-success)' 
      : 'var(--accent-primary)';

  const inflationSign = draftStats.overallInflationRate > 0 ? '+' : '';

  return (
    <header className="glass-card" style={{ padding: '14px 18px', margin: '14px 14px 0 14px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        
        {/* Title & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
          }}>
            <Trophy size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                OLD GUYS <span style={{ color: 'var(--accent-primary)' }}>2026 FFL DRAFT</span>
              </h1>
              <span style={{ 
                background: 'rgba(6, 182, 212, 0.15)', 
                color: 'var(--accent-primary)', 
                padding: '2px 6px', 
                borderRadius: '10px', 
                fontSize: '0.65rem',
                fontWeight: 700
              }}>
                AUCTION BOARD
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              12 Teams · ${settings.salaryCap} Budget
            </p>
          </div>
        </div>

        {/* Live Financial Summary Stats Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '6px 12px', 
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem'
        }}>
          {/* Draft Progress */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Progress
            </div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Users size={12} color="var(--accent-primary)" />
              {draftStats.totalDraftedCount}/{draftStats.totalSpotsInLeague}
            </div>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />

          {/* Money Spent */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Spent
            </div>
            <div style={{ fontWeight: 700, color: '#34d399' }}>
              ${draftStats.totalSpentInLeague}
            </div>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />

          {/* Inflation */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Inflation
            </div>
            <div style={{ fontWeight: 700, color: inflationColor }}>
              {inflationSign}{(draftStats.overallInflationRate * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Header Actions Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          
          <button 
            onClick={handleToggleMute} 
            className="btn btn-outline btn-icon"
            title={isMuted ? "Unmute Audio" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} color="var(--accent-danger)" /> : <Volume2 size={16} color="var(--accent-success)" />}
          </button>

          <button 
            onClick={loadDemoData} 
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.75rem', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
            title="Load demo draft data"
          >
            <PlayCircle size={14} /> Demo
          </button>

          <button onClick={exportDraftCSV} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.75rem' }} title="CSV Export">
            <FileSpreadsheet size={14} color="var(--accent-emerald)" /> CSV
          </button>

          <button onClick={exportStateJSON} className="btn btn-outline btn-icon" title="JSON Backup">
            <Download size={15} />
          </button>

          <button 
            onClick={onOpenStartNewAuction} 
            className="btn btn-primary" 
            style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }} 
            title="Start New Auction (PIN-Protected)"
          >
            <RefreshCw size={14} /> New Auction
          </button>

          <button onClick={onOpenSettings} className="btn btn-outline btn-icon" title="League Settings">
            <Settings size={15} />
          </button>

        </div>

      </div>
    </header>
  );
}
