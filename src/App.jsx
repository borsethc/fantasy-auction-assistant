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
import { Gavel, Grid, Shield, History, Sparkles } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('DRAFT'); // 'DRAFT' | 'MATRIX' | 'MY_TEAM' | 'HISTORY'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Bar */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main View Navigation Tabs */}
      <div style={{ padding: '16px 20px 0 20px', maxWidth: '1700px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          
          <button 
            onClick={() => setActiveTab('DRAFT')}
            className="btn"
            style={{
              background: activeTab === 'DRAFT' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              boxShadow: activeTab === 'DRAFT' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
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
              boxShadow: activeTab === 'MATRIX' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
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
              boxShadow: activeTab === 'MY_TEAM' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
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
              boxShadow: activeTab === 'HISTORY' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
            }}
          >
            <History size={16} /> Audit & Draft Log
          </button>

        </div>
      </div>

      {/* View Content Area */}
      <main style={{ flex: 1, padding: '20px', maxWidth: '1700px', margin: '0 auto', width: '100%' }}>
        
        {/* VIEW 1: LIVE DRAFT ROOM */}
        {activeTab === 'DRAFT' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
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
            <div style={{ height: '500px' }}>
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

      {/* Settings Modal Component */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

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
