import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_PLAYERS } from '../data/initialPlayers';
import { DEFAULT_LEAGUE_SETTINGS } from '../data/defaultSettings';
import { sounds } from '../utils/soundEffects';

const AuctionContext = createContext();

const STORAGE_KEY = 'auctionboss_draft_state_2026_v6';

export function AuctionProvider({ children }) {
  // 1. Settings & Teams State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.settings) return parsed.settings;
      } catch (e) {
        console.error("Failed parsing settings", e);
      }
    }
    return DEFAULT_LEAGUE_SETTINGS;
  });

  // 2. Players Database
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.players && Array.isArray(parsed.players)) return parsed.players;
      } catch (e) {
        console.error("Failed parsing players", e);
      }
    }
    return INITIAL_PLAYERS.map(p => ({
      ...p,
      status: 'AVAILABLE', // 'AVAILABLE' | 'DRAFTED' | 'NOMINATED'
      draftedBy: null,
      cost: 0,
      isTarget: false,
      notes: p.notes || ''
    }));
  });

  // 3. Draft Pick History Log
  const [draftLog, setDraftLog] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.draftLog && Array.isArray(parsed.draftLog)) return parsed.draftLog;
      } catch (e) {
        console.error("Failed parsing draftLog", e);
      }
    }
    return [];
  });

  // 4. Currently Nominated Player & Live Bidding Podium
  const [activeNomination, setActiveNomination] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeNomination) return parsed.activeNomination;
      } catch (e) {
        console.error("Failed parsing activeNomination", e);
      }
    }
    return null;
  });

  // 5. Shortlist / Watchlist Target IDs
  const [targetIds, setTargetIds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.targetIds && Array.isArray(parsed.targetIds)) return parsed.targetIds;
      } catch (e) {
        console.error("Failed parsing targetIds", e);
      }
    }
    return [];
  });

  // Auto Save to LocalStorage
  useEffect(() => {
    const stateToSave = {
      settings,
      players,
      draftLog,
      activeNomination,
      targetIds
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [settings, players, draftLog, activeNomination, targetIds]);

  // Total slots per team calculation
  const totalRosterSpotsPerTeam = useMemo(() => {
    return Object.values(settings.rosterSlots).reduce((a, b) => a + b, 0);
  }, [settings.rosterSlots]);

  // Derived Teams with remaining budget, max bid, and filled roster
  const teamsDetailed = useMemo(() => {
    return settings.teams.map(team => {
      const teamPicks = draftLog.filter(log => log.teamId === team.id);
      const totalSpent = teamPicks.reduce((sum, item) => sum + item.cost, 0);
      const remainingBudget = settings.salaryCap - totalSpent;
      const filledSpotsCount = teamPicks.length;
      const openSpotsCount = Math.max(0, totalRosterSpotsPerTeam - filledSpotsCount);

      let maxBid = 0;
      if (openSpotsCount > 0) {
        maxBid = Math.max(0, remainingBudget - (openSpotsCount - 1));
      }

      const rosterByPos = {
        QB: [], RB: [], WR: [], TE: [], FLEX: [], K: [], DST: [], BENCH: []
      };

      teamPicks.forEach(pick => {
        const p = players.find(player => player.id === pick.playerId) || pick.playerSnapshot;
        if (p) {
          rosterByPos[p.pos] = rosterByPos[p.pos] || [];
          rosterByPos[p.pos].push({ ...p, cost: pick.cost, pickNum: pick.pickNum });
        }
      });

      return {
        ...team,
        totalSpent,
        remainingBudget,
        maxBid,
        filledSpotsCount,
        openSpotsCount,
        teamPicks,
        rosterByPos,
        avgPerOpenSpot: openSpotsCount > 0 ? (remainingBudget / openSpotsCount).toFixed(1) : 0
      };
    });
  }, [settings, draftLog, players, totalRosterSpotsPerTeam]);

  // Global Financial & Inflation Calculations
  const draftStats = useMemo(() => {
    const totalLeagueMoney = settings.numTeams * settings.salaryCap;
    const totalSpentInLeague = draftLog.reduce((sum, item) => sum + item.cost, 0);
    const totalRemainingLeagueMoney = totalLeagueMoney - totalSpentInLeague;

    let draftedBaseValueTotal = 0;
    draftLog.forEach(log => {
      const p = players.find(player => player.id === log.playerId) || log.playerSnapshot;
      if (p) {
        draftedBaseValueTotal += (p.baseValue || 1);
      }
    });

    const overallInflationRate = draftedBaseValueTotal > 0
      ? ((totalSpentInLeague - draftedBaseValueTotal) / draftedBaseValueTotal)
      : 0;

    const posStats = { RB: { spent: 0, base: 0 }, WR: { spent: 0, base: 0 }, QB: { spent: 0, base: 0 }, TE: { spent: 0, base: 0 } };
    draftLog.forEach(log => {
      const p = players.find(player => player.id === log.playerId) || log.playerSnapshot;
      if (p && posStats[p.pos]) {
        posStats[p.pos].spent += log.cost;
        posStats[p.pos].base += (p.baseValue || 1);
      }
    });

    const posInflation = {
      RB: posStats.RB.base > 0 ? (posStats.RB.spent - posStats.RB.base) / posStats.RB.base : 0,
      WR: posStats.WR.base > 0 ? (posStats.WR.spent - posStats.WR.base) / posStats.WR.base : 0,
      QB: posStats.QB.base > 0 ? (posStats.QB.spent - posStats.QB.base) / posStats.QB.base : 0,
      TE: posStats.TE.base > 0 ? (posStats.TE.spent - posStats.TE.base) / posStats.TE.base : 0,
    };

    const totalDraftedCount = draftLog.length;
    const totalSpotsInLeague = settings.numTeams * totalRosterSpotsPerTeam;

    return {
      totalLeagueMoney,
      totalSpentInLeague,
      totalRemainingLeagueMoney,
      draftedBaseValueTotal,
      overallInflationRate,
      posInflation,
      totalDraftedCount,
      totalSpotsInLeague,
      pctDrafted: totalSpotsInLeague > 0 ? ((totalDraftedCount / totalSpotsInLeague) * 100).toFixed(1) : 0
    };
  }, [settings, draftLog, players, totalRosterSpotsPerTeam]);

  // Compute Dynamic Values
  const playersWithDynamic = useMemo(() => {
    const rate = draftStats.overallInflationRate;
    return players.map((p, idx) => {
      const posRate = draftStats.posInflation[p.pos] || rate;
      const dynamicValue = Math.max(1, Math.round(p.baseValue * (1 + posRate)));
      const isTarget = targetIds.includes(p.id);
      return {
        ...p,
        rank: idx + 1,
        dynamicValue,
        isTarget
      };
    });
  }, [players, draftStats, targetIds]);

  // Actions: Nomination & Bidding
  const startNomination = (player, startingBid = 1) => {
    const userTeam = teamsDetailed.find(t => t.isUser) || teamsDetailed[0];
    setActiveNomination({
      playerId: player.id,
      player,
      currentBid: Math.max(1, startingBid),
      highBidderId: userTeam.id,
      nominatedBy: userTeam.id
    });
    sounds.playBidTick();
  };

  const updateBid = (newAmount, teamId) => {
    if (!activeNomination) return;
    setActiveNomination(prev => ({
      ...prev,
      currentBid: newAmount,
      highBidderId: teamId || prev.highBidderId
    }));
    sounds.playBidTick();
  };

  // Direct 1-Click Draft Player to Chad's Team
  const draftPlayerToMyTeam = (player, cost = 1) => {
    const userTeam = teamsDetailed.find(t => t.isUser) || teamsDetailed[0];
    const price = Math.max(1, parseInt(cost, 10) || 1);
    const pickNum = draftLog.length + 1;

    const newLogEntry = {
      pickNum,
      playerId: player.id,
      playerSnapshot: { ...player },
      teamId: userTeam.id,
      cost: price,
      timestamp: new Date().toISOString()
    };

    setDraftLog(prev => [...prev, newLogEntry]);
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, status: 'DRAFTED', draftedBy: userTeam.id, cost: price } : p));
    if (activeNomination?.playerId === player.id) setActiveNomination(null);
    sounds.playMyTeamDraftedSound();
  };

  // Direct 1-Click Draft Player to Opponent
  const draftPlayerToOpponent = (player, cost = 1, opponentTeamId = 'team-opponent') => {
    const price = Math.max(0, parseInt(cost, 10) || 0);
    const pickNum = draftLog.length + 1;
    const teamId = opponentTeamId || 'team-opponent';

    const newLogEntry = {
      pickNum,
      playerId: player.id,
      playerSnapshot: { ...player },
      teamId,
      cost: price,
      timestamp: new Date().toISOString()
    };

    setDraftLog(prev => [...prev, newLogEntry]);
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, status: 'DRAFTED', draftedBy: teamId, cost: price } : p));
    if (activeNomination?.playerId === player.id) setActiveNomination(null);
    sounds.playGavelSold();
  };

  // NEW HELPER: Remove Player from Available List (Instant Taken / Cleared)
  const removePlayerFromAvailable = (player, cost = 0) => {
    draftPlayerToOpponent(player, cost, 'team-opponent');
  };

  const finalizeSale = (winningTeamId, finalCost) => {
    if (!activeNomination) return;
    const targetPlayer = players.find(p => p.id === activeNomination.playerId);
    if (!targetPlayer) return;

    const winnerId = winningTeamId || activeNomination.highBidderId;
    const price = typeof finalCost === 'number' ? finalCost : activeNomination.currentBid;
    const pickNum = draftLog.length + 1;

    const newLogEntry = {
      pickNum,
      playerId: targetPlayer.id,
      playerSnapshot: { ...targetPlayer },
      teamId: winnerId,
      cost: price,
      timestamp: new Date().toISOString()
    };

    setDraftLog(prev => [...prev, newLogEntry]);
    setPlayers(prev => prev.map(p => {
      if (p.id === targetPlayer.id) {
        return { ...p, status: 'DRAFTED', draftedBy: winnerId, cost: price };
      }
      return p;
    }));

    setActiveNomination(null);

    const winnerTeam = settings.teams.find(t => t.id === winnerId);
    if (winnerTeam && winnerTeam.isUser) {
      sounds.playMyTeamDraftedSound();
    } else {
      sounds.playGavelSold();
    }
  };

  const cancelNomination = () => {
    setActiveNomination(null);
  };

  const passPlayerUndrafted = () => {
    if (!activeNomination) return;
    const targetPlayerId = activeNomination.playerId;
    setPlayers(prev => prev.map(p => {
      if (p.id === targetPlayerId) {
        return { ...p, status: 'UNDRAFTED' };
      }
      return p;
    }));
    setActiveNomination(null);
  };

  const undoLastPick = () => {
    if (draftLog.length === 0) return;
    const lastPick = draftLog[draftLog.length - 1];
    setDraftLog(prev => prev.slice(0, prev.length - 1));
    setPlayers(prev => prev.map(p => {
      if (p.id === lastPick.playerId) {
        return { ...p, status: 'AVAILABLE', draftedBy: null, cost: 0 };
      }
      return p;
    }));
  };

  const editPick = (pickNum, newTeamId, newCost) => {
    setDraftLog(prev => prev.map(item => {
      if (item.pickNum === pickNum) {
        return { ...item, teamId: newTeamId, cost: Math.max(1, newCost) };
      }
      return item;
    }));
    const targetPick = draftLog.find(item => item.pickNum === pickNum);
    if (targetPick) {
      setPlayers(prev => prev.map(p => {
        if (p.id === targetPick.playerId) {
          return { ...p, draftedBy: newTeamId, cost: Math.max(1, newCost) };
        }
        return p;
      }));
    }
  };

  const toggleTargetPlayer = (playerId) => {
    setTargetIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const updatePlayerNote = (playerId, noteText) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, notes: noteText } : p));
  };

  const resetDraftState = () => {
    if (window.confirm("Are you sure you want to reset the entire draft? All logged picks will be cleared.")) {
      setDraftLog([]);
      setActiveNomination(null);
      setSettings(DEFAULT_LEAGUE_SETTINGS);
      setPlayers(INITIAL_PLAYERS.map(p => ({
        ...p,
        status: 'AVAILABLE',
        draftedBy: null,
        cost: 0,
        isTarget: false,
        notes: p.notes || ''
      })));
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const importTeamsCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const newTeams = [];
    lines.forEach((line, idx) => {
      const parts = line.split(',');
      const teamName = parts[0].replace(/^["']|["']$/g, '').trim();
      const isUser = parts[1] ? parts[1].trim().toLowerCase() === 'true' : teamName.toLowerCase().includes('chad');

      if (teamName) {
        newTeams.push({
          id: `team-${idx + 1}`,
          name: teamName + (isUser && !teamName.includes('(You)') ? ' (You)' : ''),
          isUser
        });
      }
    });

    if (newTeams.length > 0) {
      const updatedUserTeam = newTeams.find(t => t.isUser) || newTeams[0];
      setSettings(prev => ({
        ...prev,
        numTeams: newTeams.length,
        userTeamId: updatedUserTeam.id,
        teams: newTeams
      }));
      return true;
    }
    return false;
  };

  const importPlayerRankingsCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return false;

    const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
    
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('player'));
    const posIdx = headers.findIndex(h => h.includes('pos') || h.includes('position'));
    const teamIdx = headers.findIndex(h => h.includes('team') || h.includes('nfl'));
    const valueIdx = headers.findIndex(h => h.includes('val') || h.includes('price') || h.includes('bid') || h.includes('cost') || h.includes('salary') || h.includes('$'));
    const tierIdx = headers.findIndex(h => h.includes('tier'));
    const ptsIdx = headers.findIndex(h => h.includes('pts') || h.includes('proj'));
    const notesIdx = headers.findIndex(h => h.includes('note') || h.includes('comment'));

    if (nameIdx === -1) {
      alert("CSV must include at least a 'Player' or 'Name' column header!");
      return false;
    }

    const importedPlayers = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.replace(/^["']|["']$/g, '').trim());
      if (!row[nameIdx]) continue;

      const name = row[nameIdx];
      const pos = posIdx !== -1 && row[posIdx] ? row[posIdx].toUpperCase() : 'FLEX';
      const nflTeam = teamIdx !== -1 && row[teamIdx] ? row[teamIdx].toUpperCase() : 'FA';
      const baseValue = valueIdx !== -1 && !isNaN(parseInt(row[valueIdx], 10)) ? parseInt(row[valueIdx], 10) : 5;
      const tier = tierIdx !== -1 && !isNaN(parseInt(row[tierIdx], 10)) ? parseInt(row[tierIdx], 10) : 3;
      const projPts = ptsIdx !== -1 && !isNaN(parseFloat(row[ptsIdx])) ? parseFloat(row[ptsIdx]) : 150;
      const notes = notesIdx !== -1 && row[notesIdx] ? row[notesIdx] : '';

      importedPlayers.push({
        id: `custom-${i}-${name.replace(/\s+/g, '-').toLowerCase()}`,
        name,
        pos,
        team: nflTeam,
        bye: 9,
        tier,
        baseValue,
        projPts,
        notes,
        status: 'AVAILABLE',
        draftedBy: null,
        cost: 0,
        isTarget: false
      });
    }

    if (importedPlayers.length > 0) {
      setPlayers(importedPlayers);
      setDraftLog([]);
      setActiveNomination(null);
      return importedPlayers.length;
    }
    return false;
  };

  const loadDemoData = () => {
    const demoPicks = [
      { playerPos: 'RB', name: "Bijan Robinson", teamIdx: 1, cost: 80 },
      { playerPos: 'WR', name: "CeeDee Lamb", teamIdx: 0, cost: 41 }, // Chad Borseth (You)
      { playerPos: 'RB', name: "Christian McCaffrey", teamIdx: 2, cost: 74 },
      { playerPos: 'RB', name: "Jahmyr Gibbs", teamIdx: 3, cost: 70 },
      { playerPos: 'WR', name: "Ja'Marr Chase", teamIdx: 4, cost: 56 },
      { playerPos: 'RB', name: "Saquon Barkley", teamIdx: 5, cost: 65 },
      { playerPos: 'WR', name: "Justin Jefferson", teamIdx: 6, cost: 40 },
      { playerPos: 'QB', name: "Jayden Daniels", teamIdx: 7, cost: 15 },
      { playerPos: 'RB', name: "De'Von Achane", teamIdx: 8, cost: 63 },
      { playerPos: 'TE', name: "Trey McBride", teamIdx: 9, cost: 55 },
      { playerPos: 'WR', name: "Puka Nacua", teamIdx: 0, cost: 45 }, // Chad Borseth (You)
      { playerPos: 'RB', name: "Jonathan Taylor", teamIdx: 11, cost: 60 },
      { playerPos: 'QB', name: "Josh Allen", teamIdx: 2, cost: 21 },
      { playerPos: 'RB', name: "Ashton Jeanty", teamIdx: 1, cost: 56 },
      { playerPos: 'TE', name: "Brock Bowers", teamIdx: 3, cost: 46 },
      { playerPos: 'QB', name: "Jalen Hurts", teamIdx: 0, cost: 19 }, // Chad Borseth (You)
    ];

    let newLog = [];
    let updatedPlayers = [...players];

    demoPicks.forEach((demo, idx) => {
      const match = updatedPlayers.find(p => p.name === demo.name && p.status === 'AVAILABLE');
      if (match) {
        const teamObj = settings.teams[demo.teamIdx % settings.teams.length];
        const pickNum = idx + 1;
        newLog.push({
          pickNum,
          playerId: match.id,
          playerSnapshot: { ...match },
          teamId: teamObj.id,
          cost: demo.cost,
          timestamp: new Date(Date.now() - (demoPicks.length - idx) * 60000).toISOString()
        });
        match.status = 'DRAFTED';
        match.draftedBy = teamObj.id;
        match.cost = demo.cost;
      }
    });

    setDraftLog(newLog);
    setPlayers(updatedPlayers);
    setActiveNomination(null);
  };

  const exportDraftCSV = () => {
    let csv = "Pick #,Player,Position,NFL Team,Drafted By,Cost ($),Base Value ($),Diff ($)\n";
    draftLog.forEach(log => {
      const p = players.find(player => player.id === log.playerId) || log.playerSnapshot;
      const team = settings.teams.find(t => t.id === log.teamId);
      const diff = log.cost - (p ? p.baseValue : 0);
      csv += `${log.pickNum},"${p ? p.name : 'Unknown'}",${p ? p.pos : ''},${p ? p.team : ''},"${team ? team.name : ''}",${log.cost},${p ? p.baseValue : 0},${diff >= 0 ? '+' : ''}${diff}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.leagueName.replace(/\s+/g, '_')}_Draft_Summary.csv`;
    a.click();
  };

  const exportStateJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, players, draftLog, targetIds }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AuctionBoss_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importStateJSON = (jsonFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.settings && parsed.players) {
          setSettings(parsed.settings);
          setPlayers(parsed.players);
          setDraftLog(parsed.draftLog || []);
          setTargetIds(parsed.targetIds || []);
          setActiveNomination(null);
          alert("Draft state imported successfully!");
        } else {
          alert("Invalid backup JSON format.");
        }
      } catch (err) {
        alert("Error reading JSON file: " + err.message);
      }
    };
    reader.readAsText(jsonFile);
  };

  return (
    <AuctionContext.Provider value={{
      settings,
      setSettings,
      players: playersWithDynamic,
      draftLog,
      activeNomination,
      teamsDetailed,
      draftStats,
      targetIds,
      totalRosterSpotsPerTeam,
      startNomination,
      draftPlayerToMyTeam,
      draftPlayerToOpponent,
      removePlayerFromAvailable,
      updateBid,
      finalizeSale,
      cancelNomination,
      passPlayerUndrafted,
      undoLastPick,
      editPick,
      toggleTargetPlayer,
      updatePlayerNote,
      resetDraftState,
      loadDemoData,
      exportDraftCSV,
      exportStateJSON,
      importStateJSON,
      importTeamsCSV,
      importPlayerRankingsCSV
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  return useContext(AuctionContext);
}
