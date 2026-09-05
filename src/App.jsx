import React, { useState } from 'react';
import { AuctionProvider } from './context/AuctionContext';
import { Header } from './components/Header';
import { AuctionPodium } from './components/AuctionPodium';
import { BestAvailableForNeeds } from './components/BestAvailableForNeeds';
import { PlayerCheatSheet } from './components/PlayerCheatSheet';
import { LeagueMatrix } from './components/LeagueMatrix';
import { MyTeamSummary } from './components/MyTeamSummary';
import { NominationAssistant } from './components/NominationAssistant';
import { DraftHistoryLog } from './components/DraftHistoryLog';
import { SettingsModal } from './components/SettingsModal';
import { StartNewAuctionModal } from './components/StartNewAuctionModal';
import { Gavel, Grid, Shield, History, Sparkles, RefreshCw } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('DRAFT'); // 'DRAFT' | 'MATRIX' | 'MY_TEAM' | 'HISTORY'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewAuctionOpen, setIsNewAuctionOpen] = useState(false);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      
      {/* Header Bar */}
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenStartNewAuction={() => setIsNewAuctionOpen(true)}
      />

      {/* Main View Navigation Tabs (Desktop & Tablet) */}
      <div className="desktop-nav-tabs" style={{ padding: '14px 18px 0 18px', maxWidth: '1700px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', overflowX: 'auto' }}>
          
          <button 
            onClick={() => setActiveTab('DRAFT')}
            className="btn"
            style={{
              background: activeTab === 'DRAFT' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              boxShadow: activeTab === 'DRAFT' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none',
              flexShrink: 0
            }}
          >
            <Gavel size={16} /> Live Draft Room
          </button>

          <button 
            onClick={() => setActiveTab('MATRIX')}
            className="btn"
            style={{
              background: activeTab === 'MATRIX' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              boxShadow: activeTab === 'MATRIX' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none',
              flexShrink: 0
            }}
          >
            <Grid size={16} /> League Matrix & Budgets
          </button>

          <button 
            onClick={() => setActiveTab('MY_TEAM')}
            className="btn"
            style={{
              background: activeTab === 'MY_TEAM' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              boxShadow: activeTab === 'MY_TEAM' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none',
              flexShrink: 0
            }}
          >
            <Shield size={16} /> My Team War-Room
          </button>

          <button 
            onClick={() => setActiveTab('HISTORY')}
            className="btn"
            style={{
              background: activeTab === 'HISTORY' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              boxShadow: activeTab === 'HISTORY' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none',
              flexShrink: 0
            }}
          >
            <History size={16} /> Audit & Draft Log
          </button>

        </div>
      </div>

      {/* View Content Area */}
      <main style={{ flex: 1, padding: '16px 18px', maxWidth: '1700px', margin: '0 auto', width: '100%' }}>
        
        {/* VIEW 1: LIVE DRAFT ROOM */}
        {activeTab === 'DRAFT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Live Draft Room Title & Estimate Auction Price Bar */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              gap: '10px', 
              background: 'rgba(6, 182, 212, 0.08)', 
              border: '1px solid rgba(6, 182, 212, 0.3)', 
              borderRadius: '10px', 
              padding: '10px 16px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gavel size={18} color="var(--accent-primary)" /> Live Draft Room
                </span>
                <span style={{ 
                  background: 'rgba(6, 182, 212, 0.18)', 
                  color: 'var(--accent-primary)', 
                  border: '1px solid rgba(6, 182, 212, 0.4)', 
                  padding: '3px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.775rem', 
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  💰 Est. Auction Price: Dynamic Inflation-Adjusted Market Values
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target values adjust dynamically based on league spending rates
              </div>
            </div>

            <div className="main-layout" style={{ padding: 0 }}>
              {/* Left Column: Podium, Roster Needs Best Available & Tactical Assistant */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AuctionPodium />
                <BestAvailableForNeeds />
                <NominationAssistant />
                <MyTeamSummary />
              </div>

              {/* Right Column: Player Cheat Sheet */}
              <div style={{ minHeight: '650px' }}>
                <PlayerCheatSheet />
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: LEAGUE MATRIX */}
        {activeTab === 'MATRIX' && (
          <div>
            <LeagueMatrix />
          </div>
        )}

        {/* VIEW 3: MY TEAM WAR-ROOM */}
        {activeTab === 'MY_TEAM' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MyTeamSummary />
            <div style={{ height: '520px' }}>
              <PlayerCheatSheet />
            </div>
          </div>
        )}

        {/* VIEW 4: DRAFT AUDIT LOG */}
        {activeTab === 'HISTORY' && (
          <div style={{ height: '700px' }}>
            <DraftHistoryLog />
          </div>
        )}

      </main>

      {/* iPhone 17 Pro Sticky Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button 
          onClick={() => setActiveTab('DRAFT')}
          className={`mobile-nav-item ${activeTab === 'DRAFT' ? 'active' : ''}`}
        >
          <Gavel size={20} />
          <span>Draft</span>
        </button>

        <button 
          onClick={() => setActiveTab('MATRIX')}
          className={`mobile-nav-item ${activeTab === 'MATRIX' ? 'active' : ''}`}
        >
          <Grid size={20} />
          <span>Matrix</span>
        </button>

        <button 
          onClick={() => setActiveTab('MY_TEAM')}
          className={`mobile-nav-item ${activeTab === 'MY_TEAM' ? 'active' : ''}`}
        >
          <Shield size={20} />
          <span>My Team</span>
        </button>

        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`mobile-nav-item ${activeTab === 'HISTORY' ? 'active' : ''}`}
        >
          <History size={20} />
          <span>Audit Log</span>
        </button>
      </nav>

      {/* Settings Modal Component */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onOpenStartNewAuction={() => setIsNewAuctionOpen(true)}
      />

      {/* Start New Auction PIN Modal Component */}
      <StartNewAuctionModal 
        isOpen={isNewAuctionOpen} 
        onClose={() => setIsNewAuctionOpen(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <AuctionProvider>
      <DashboardContent />
    </AuctionProvider>
  );
}
