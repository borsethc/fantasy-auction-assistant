import React, { useState, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { 
  Settings, X, Save, Shield, DollarSign, Upload, 
  FileSpreadsheet, Download, CheckCircle, HelpCircle 
} from 'lucide-react';

export function SettingsModal({ isOpen, onClose }) {
  const { settings, setSettings, importTeamsCSV, importPlayerRankingsCSV } = useAuction();

  const [activeSubTab, setActiveSubTab] = useState('MANUAL'); // 'MANUAL' | 'IMPORT_TEAMS' | 'IMPORT_RANKINGS'
  const [form, setForm] = useState(() => settings);

  // Import State Text Area
  const [teamsText, setTeamsText] = useState('');
  const [teamImportSuccess, setTeamImportSuccess] = useState('');

  const rankFileInputRef = useRef(null);
  const [rankImportSuccess, setRankImportSuccess] = useState('');

  if (!isOpen) return null;

  const handleChangeField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamNameChange = (id, newName) => {
    setForm(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === id ? { ...t, name: newName } : t)
    }));
  };

  const handleRosterSlotChange = (pos, count) => {
    setForm(prev => ({
      ...prev,
      rosterSlots: {
        ...prev.rosterSlots,
        [pos]: Math.max(0, parseInt(count, 10) || 0)
      }
    }));
  };

  const handleSaveManual = (e) => {
    e.preventDefault();
    setSettings(form);
    onClose();
  };

  // Quick Teams Text / CSV Import Handler
  const handleImportTeamsText = () => {
    if (!teamsText.trim()) return;
    const ok = importTeamsCSV(teamsText);
    if (ok) {
      setTeamImportSuccess("Successfully updated league teams!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      alert("Failed to parse teams. Please provide one team name per line.");
    }
  };

  // Custom Player CSV File Handler
  const handleRankingsCSVFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const count = importPlayerRankingsCSV(text);
      if (count) {
        setRankImportSuccess(`Successfully imported ${count} custom players & auction values!`);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    };
    reader.readAsText(file);
  };

  // Download Sample Teams CSV Template
  const downloadSampleTeamsCSV = () => {
    const csv = "Team Name,Is User\nMy Championship Squad (You),true\nBlitzkrieg Express,false\nTouchdown Tycoons,false\nEndzone Enforcers,false\nGridiron Gurus,false\nSack Attack,false\nRed Zone Mavericks,false\nHail Mary Hustlers,false\nPigskin Patriots,false\nDynamic Dynamos,false\nTurf Titans,false\nFantasy Legends,false\n";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Sample_League_Teams.csv";
    a.click();
  };

  // Download Sample Player Values CSV Template
  const downloadSampleRankingsCSV = () => {
    const csv = "Player,Position,NFL Team,Tier,Base Value,Proj Pts,Notes\nJa'Marr Chase,WR,CIN,1,58,315,Consensus top pick target\nBreece Hall,RB,NYJ,1,56,298,High target floor\nJosh Allen,QB,BUF,1,28,385,Elite rushing TD upside\nSam LaPorta,TE,DET,1,27,220,Premier TE option\n";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Sample_Player_Auction_Values.csv";
    a.click();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        border: '1px solid var(--accent-primary-glow)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                League & Data Customization Wizard
              </h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Configure league settings or upload custom team lists & player projections CSV
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveSubTab('MANUAL')}
            style={{
              flex: 1,
              background: activeSubTab === 'MANUAL' ? 'var(--accent-primary)' : 'transparent',
              color: activeSubTab === 'MANUAL' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            League & Salary Setup
          </button>

          <button 
            onClick={() => setActiveSubTab('IMPORT_TEAMS')}
            style={{
              flex: 1,
              background: activeSubTab === 'IMPORT_TEAMS' ? 'var(--accent-primary)' : 'transparent',
              color: activeSubTab === 'IMPORT_TEAMS' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Upload Team List
          </button>

          <button 
            onClick={() => setActiveSubTab('IMPORT_RANKINGS')}
            style={{
              flex: 1,
              background: activeSubTab === 'IMPORT_RANKINGS' ? 'var(--accent-primary)' : 'transparent',
              color: activeSubTab === 'IMPORT_RANKINGS' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Upload Custom Player CSV
          </button>
        </div>

        {/* TAB 1: MANUAL SETTINGS FORM */}
        {activeSubTab === 'MANUAL' && (
          <form onSubmit={handleSaveManual}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                  League Name
                </label>
                <input 
                  type="text" 
                  value={form.leagueName}
                  onChange={(e) => handleChangeField('leagueName', e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                  Team Salary Cap ($)
                </label>
                <input 
                  type="number" 
                  value={form.salaryCap}
                  onChange={(e) => handleChangeField('salaryCap', parseInt(e.target.value, 10))}
                  min="50"
                  max="1000"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Roster Slots */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-primary)' }}>
                Roster Position Requirements
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {Object.entries(form.rosterSlots).map(([pos, count]) => (
                  <div key={pos} style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <span className={`pos-badge pos-${pos === 'BENCH' ? 'K' : pos}`}>{pos}</span>
                    <input 
                      type="number" 
                      value={count} 
                      onChange={(e) => handleRosterSlotChange(pos, e.target.value)}
                      min="0"
                      max="10"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700, marginTop: '6px', padding: '4px' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Team Names */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-primary)' }}>
                League Managers / Teams ({form.teams.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {form.teams.map((t) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                    <Shield size={14} color={t.isUser ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                    <input 
                      type="text"
                      value={t.name}
                      onChange={(e) => handleTeamNameChange(t.id, e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: 'none', color: t.isUser ? '#38bdf8' : 'var(--text-main)', fontWeight: t.isUser ? 700 : 400, fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary"><Save size={16} /> Save League Settings</button>
            </div>
          </form>
        )}

        {/* TAB 2: UPLOAD TEAM LIST */}
        {activeSubTab === 'IMPORT_TEAMS' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Paste your team names below (one per line) or paste CSV data. The first team (or team marked with <code>(You)</code>) will be set as your team.
            </p>

            <textarea 
              rows={8}
              placeholder={`My Championship Squad (You)\nBlitzkrieg Express\nTouchdown Tycoons\nEndzone Enforcers\nGridiron Gurus\nSack Attack`}
              value={teamsText}
              onChange={(e) => setTeamsText(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                marginBottom: '14px'
              }}
            />

            {teamImportSuccess && (
              <div style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> {teamImportSuccess}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={downloadSampleTeamsCSV} className="btn btn-outline" style={{ fontSize: '0.775rem' }}>
                <Download size={14} /> Download Sample Teams CSV
              </button>

              <button onClick={handleImportTeamsText} className="btn btn-primary">
                <Upload size={16} /> Update League Teams
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD CUSTOM PLAYER RANKINGS / VALUES CSV */}
        {activeSubTab === 'IMPORT_RANKINGS' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Upload your custom auction values spreadsheet (from FantasyPros, ESPN, Yahoo, Sleeper, or Excel).
            </p>

            <div 
              onClick={() => rankFileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--accent-primary-glow)',
                borderRadius: '12px',
                padding: '36px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(6, 182, 212, 0.04)',
                marginBottom: '16px',
                transition: 'background 0.2s'
              }}
            >
              <FileSpreadsheet size={40} color="var(--accent-primary)" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                Click to Choose CSV File
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Supported columns: <code>Player, Position, NFL Team, Tier, Base Value, Proj Pts, Notes</code>
              </div>
            </div>

            <input 
              type="file" 
              ref={rankFileInputRef} 
              onChange={handleRankingsCSVFile} 
              accept=".csv" 
              style={{ display: 'none' }} 
            />

            {rankImportSuccess && (
              <div style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> {rankImportSuccess}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={downloadSampleRankingsCSV} className="btn btn-outline" style={{ fontSize: '0.775rem' }}>
                <Download size={14} /> Download Sample Player Values CSV
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Overwrites player cheat sheet with your custom data
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
