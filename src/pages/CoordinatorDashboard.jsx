import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { CoordinatorScoring } from './CoordinatorScoring';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQBRLpFgY0Q9QyDjntvbVdRmcxtmuG_lZI86WhtMFT6QhpPhfRequlQ_I4uZm3vEnhaA/exec";

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const str = String(timeStr).trim();
  if (str.includes("T")) {
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return str;
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return str;
    }
  }
  return str;
};

export const CoordinatorDashboard = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Auth validation
  const isAuthenticated = sessionStorage.getItem('coordinatorAuth') === 'true';
  const passcode = sessionStorage.getItem('coordinatorPasscode') || '';

  // Local state
  const [registrations, setRegistrations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScoringActive, setIsScoringActive] = useState(false);

  // Form states for manual match creation
  const [manualMatch, setManualMatch] = useState({
    category: 'singles',
    player1Name: '',
    player1Roll: '',
    player2Name: '',
    player2Roll: '',
    tableNumber: 'Table 1',
    matchDate: '',
    matchTime: ''
  });

  // Edit match state
  const [editingMatch, setEditingMatch] = useState(null);

  // Fetch all registrations & schedules
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Registrations
      // Note: We use a special proxy or try to read the registrations list.
      // Since registrations requires ADMIN passcode 'SEMS2026', and coordinator has 'COORD2026',
      // wait! If coordinator cannot read registrations using COORD2026, let's look at doGet in Code.gs.
      // Ah! In doGet, read registrations checks 'SEMS2026'.
      // If we want coordinator to be able to read registrations so they can generate fixtures,
      // let's check: does doGet permit COORD2026 for read?
      // Wait, let's view Code.gs in walkthrough.md.
      // Line 49:
      // `if (passcode !== "SEMS2026") { throw new Error("Invalid passcode!"); }`
      // Ah! In doGet, registrations reading only allows "SEMS2026".
      // But coordinators MUST be able to view registered participants!
      // The prompt says: "Coordinator permissions: View all registered participants."
      // "Restrictions: Coordinator cannot access admin settings, Coordinator cannot edit registrations, Coordinator cannot delete participants."
      // So doGet *should* allow BOTH "SEMS2026" (Admin) and "COORD2026" (Coordinator) for action "read"!
      // Let's modify our doGet function in Code.gs inside walkthrough.md to allow both!
      // In doGet:
      // `if (passcode !== "SEMS2026" && passcode !== "COORD2026") { throw new Error("Invalid passcode!"); }`
      // Yes! That's exactly right and highly logical!
      const regUrl = `${GOOGLE_SCRIPT_URL}?action=read&passcode=${passcode}`;
      const regRes = await fetch(regUrl);
      const regJson = await regRes.json();
      if (regJson.status === "success") {
        setRegistrations(regJson.data);
      } else {
        showToast("Error loading participants: " + regJson.message, "error");
      }

      // 2. Fetch Schedules
      const schedUrl = `${GOOGLE_SCRIPT_URL}?action=getSchedules`;
      const schedRes = await fetch(schedUrl);
      const schedJson = await schedRes.json();
      if (schedJson.status === "success") {
        setSchedules(schedJson.data || []);
        // Set live match if any
        const live = (schedJson.data || []).find(m => String(m.status).toLowerCase() === 'live');
        setLiveMatch(live || null);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to sync tournament data from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, []);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 text-xl flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-ban"></i>
          </div>
          <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You must log in as a coordinator to view this page.
          </p>
          <button
            onClick={() => navigate('/coordinator/login')}
            className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Save full schedules list on the server
  const saveSchedulesOnServer = async (updatedSchedules) => {
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "saveSchedules",
          passcode: passcode,
          schedules: updatedSchedules
        })
      });
      const json = await res.json();
      if (json.status === "success") {
        setSchedules(updatedSchedules);
        const live = updatedSchedules.find(m => String(m.status).toLowerCase() === 'live');
        setLiveMatch(live || null);
        showToast("Schedules saved successfully!", "success");
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving schedules: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Generate Fixtures
  const handleGenerateFixtures = (category) => {
    const list = registrations.filter(r => String(r.gameCategory).toLowerCase() === category.toLowerCase());
    if (list.length < 2) {
      showToast(`Need at least 2 ${category} registrations to generate fixtures!`, "error");
      return;
    }

    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const newMatches = [];

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const p1 = shuffled[i];
      const p2 = shuffled[i + 1];
      newMatches.push({
        matchId: "M" + Math.floor(100000 + Math.random() * 900000),
        category: category,
        player1Name: p1.fullName,
        player1Roll: p1.rollNumber,
        player2Name: p2.fullName,
        player2Roll: p2.rollNumber,
        tableNumber: "TBD",
        matchDate: new Date().toISOString().split('T')[0],
        matchTime: "12:00",
        status: "Upcoming",
        player1Score: 0,
        player2Score: 0,
        winner: "N/A"
      });
    }

    saveSchedulesOnServer([...schedules, ...newMatches]);
  };

  // Create manual match
  const handleCreateManualMatch = (e) => {
    e.preventDefault();
    if (!manualMatch.player1Name || !manualMatch.player2Name) {
      showToast("Player/Team names are required!", "error");
      return;
    }

    const newMatch = {
      matchId: "M" + Math.floor(100000 + Math.random() * 900000),
      category: manualMatch.category,
      player1Name: manualMatch.player1Name,
      player1Roll: manualMatch.player1Roll || "N/A",
      player2Name: manualMatch.player2Name,
      player2Roll: manualMatch.player2Roll || "N/A",
      tableNumber: manualMatch.tableNumber || "TBD",
      matchDate: manualMatch.matchDate || new Date().toISOString().split('T')[0],
      matchTime: manualMatch.matchTime || "12:00",
      status: "Upcoming",
      player1Score: 0,
      player2Score: 0,
      winner: "N/A"
    };

    saveSchedulesOnServer([...schedules, newMatch]);
    setManualMatch({
      category: 'singles',
      player1Name: '',
      player1Roll: '',
      player2Name: '',
      player2Roll: '',
      tableNumber: 'Table 1',
      matchDate: '',
      matchTime: ''
    });
  };

  // Update a single match status, scores, winner, etc.
  const handleUpdateMatchOnServer = async (matchId, fieldsToUpdate) => {
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateMatch",
          passcode: passcode,
          matchId,
          ...fieldsToUpdate
        })
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast("Match updated successfully!", "success");
        fetchData(); // reload complete schedules
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update match: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete all schedules (clean slate)
  const handleClearSchedules = () => {
    if (window.confirm("Are you sure you want to delete ALL schedules? This cannot be undone.")) {
      saveSchedulesOnServer([]);
    }
  };

  // Filtered registrations
  const filteredRegs = registrations.filter(row => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (row.fullName && row.fullName.toLowerCase().includes(query)) ||
      (row.rollNumber && row.rollNumber.toLowerCase().includes(query)) ||
      (row.collegeName && row.collegeName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4 text-center sm:text-left transition-colors duration-300">
        <div>
          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider select-none w-fit mx-auto sm:mx-0">
            Coordinator Portal
          </span>
          <h2 className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Tournament Management Console
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate schedules, verify scores, and control live matches in real time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-2 font-semibold text-sm"
          >
            <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`}></i> Sync Data
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('coordinatorAuth');
              sessionStorage.removeItem('coordinatorPasscode');
              navigate('/coordinator/login');
            }}
            className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-2 font-semibold text-sm"
          >
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 pb-px scrollbar-thin">
        {[
          { id: 'schedule', label: 'Match Schedule', icon: 'fa-regular fa-calendar-days' },
          { id: 'live', label: 'Live Match Control', icon: 'fa-solid fa-table-tennis-paddle-ball' },
          { id: 'results', label: 'Results Management', icon: 'fa-solid fa-square-poll-vertical' },
          { id: 'participants', label: 'Participants List', icon: 'fa-solid fa-users' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 border-b-2 font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <i className={tab.icon}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* TAB 1: Match Schedule */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Fixtures Generator & Manual Entry */}
            <div className="lg:col-span-1 space-y-6">
              {/* Fixture Generator Card */}
              <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
                <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-lg mb-2 text-left">
                  Generate Fixtures
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 text-left">
                  Automatically pair up registered participants into match slots at random.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleGenerateFixtures('singles')}
                    disabled={loading}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-user-plus"></i> Generate Singles (1v1)
                  </button>
                  <button
                    onClick={() => handleGenerateFixtures('doubles')}
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-users-rectangle"></i> Generate Doubles (2v2)
                  </button>
                  <button
                    onClick={handleClearSchedules}
                    className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-regular fa-trash-can"></i> Clear All Schedules
                  </button>
                </div>
              </div>

              {/* Manual Fixture Entry Card */}
              <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md text-left">
                <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-lg mb-4">
                  Add Match Slot Manually
                </h4>
                <form onSubmit={handleCreateManualMatch} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Format</label>
                    <select
                      value={manualMatch.category}
                      onChange={(e) => setManualMatch({ ...manualMatch, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#1a2744] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="singles">Singles</option>
                      <option value="doubles">Doubles</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Player 1 / Team 1 Name</label>
                    <input
                      type="text"
                      value={manualMatch.player1Name}
                      onChange={(e) => setManualMatch({ ...manualMatch, player1Name: e.target.value })}
                      placeholder="e.g. Aman Sharma"
                      className="w-full bg-slate-50 dark:bg-[#1a2744] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Player 2 / Team 2 Name</label>
                    <input
                      type="text"
                      value={manualMatch.player2Name}
                      onChange={(e) => setManualMatch({ ...manualMatch, player2Name: e.target.value })}
                      placeholder="e.g. Vikas Gupta"
                      className="w-full bg-slate-50 dark:bg-[#1a2744] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500">Table No.</label>
                      <select
                        value={manualMatch.tableNumber}
                        onChange={(e) => setManualMatch({ ...manualMatch, tableNumber: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#1a2744] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                      >
                        <option value="Table 1">Table 1</option>
                        <option value="Table 2">Table 2</option>
                        <option value="Table 3">Table 3</option>
                        <option value="Table 4">Table 4</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500">Time</label>
                      <input
                        type="time"
                        value={manualMatch.matchTime}
                        onChange={(e) => setManualMatch({ ...manualMatch, matchTime: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#1a2744] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus"></i> Add Match Fixture
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Matches Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
                <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-lg mb-6 text-left">
                  Scheduled Match List ({schedules.length})
                </h4>

                {schedules.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <i className="fa-regular fa-calendar-xmark text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
                    <h5 className="font-bold text-slate-900 dark:text-white">No schedules generated yet</h5>
                    <p className="text-xs text-slate-500 mt-1">Use the panel on the left to add or generate slots.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedules.map((match) => (
                      <div
                        key={match.matchId}
                        className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">#{match.matchId}</span>
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                              {match.category}
                            </span>
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                              String(match.status).toLowerCase() === 'live'
                                ? 'bg-red-500/10 text-red-500 animate-pulse'
                                : String(match.status).toLowerCase() === 'completed'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}>
                              {match.status}
                            </span>
                          </div>

                          <div className="font-outfit font-bold text-slate-900 dark:text-white text-base mt-2 flex items-center gap-3">
                            <span>{match.player1Name}</span>
                            <span className="text-xs text-slate-400 font-normal">vs</span>
                            <span>{match.player2Name}</span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            <span><i className="fa-solid fa-table-tennis-paddle-ball"></i> {match.tableNumber}</span>
                            <span><i className="fa-solid fa-clock"></i> {formatTime(match.matchTime)}</span>
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {editingMatch === match.matchId ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Table"
                                defaultValue={match.tableNumber}
                                id={`edit-tbl-${match.matchId}`}
                                className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded p-1 text-xs text-slate-900 dark:text-white"
                              />
                              <input
                                type="time"
                                defaultValue={match.matchTime}
                                id={`edit-time-${match.matchId}`}
                                className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded p-1 text-xs text-slate-900 dark:text-white"
                              />
                              <button
                                onClick={() => {
                                  const table = document.getElementById(`edit-tbl-${match.matchId}`).value;
                                  const time = document.getElementById(`edit-time-${match.matchId}`).value;
                                  handleUpdateMatchOnServer(match.matchId, { tableNumber: table, matchTime: time });
                                  setEditingMatch(null);
                                }}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMatch(null)}
                                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingMatch(match.matchId)}
                                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                <i className="fa-solid fa-pen"></i> Edit Schedule
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this match schedule?")) {
                                    const updated = schedules.filter(s => s.matchId !== match.matchId);
                                    saveSchedulesOnServer(updated);
                                  }
                                }}
                                className="p-2 border border-red-500/20 hover:border-red-500/40 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-lg text-xs cursor-pointer flex items-center justify-center"
                                title="Delete Schedule"
                              >
                                <i className="fa-regular fa-trash-can"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Live Match Control */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Live Controller Dashboard */}
            {liveMatch ? (
              <div className="bg-gradient-to-br from-indigo-900 via-[#121d33] to-[#0d1629] border border-indigo-500/20 rounded-3xl p-8 text-center text-white relative shadow-xl">
                <span className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-wider animate-pulse select-none">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live Match Active
                </span>

                <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
                  Live Match Center
                </span>

                <h4 className="font-outfit font-extrabold text-2xl tracking-tight text-white mb-2 mt-6">
                  {liveMatch.player1Name} <span className="text-xs text-indigo-300 font-normal">vs</span> {liveMatch.player2Name}
                </h4>
                <p className="text-xs text-indigo-300 font-mono">
                  #{liveMatch.matchId} · {liveMatch.category} · {liveMatch.tableNumber}
                </p>

                <div className="my-8 flex justify-center gap-4">
                  <button
                    onClick={() => setIsScoringActive(true)}
                    className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer select-none text-sm"
                  >
                    <i className="fa-solid fa-gamepad"></i> Open Match Score Controller
                  </button>
                </div>
                
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleUpdateMatchOnServer(liveMatch.matchId, { status: 'Completed', winner: parseInt(liveMatch.player1Score) > parseInt(liveMatch.player2Score) ? liveMatch.player1Name : liveMatch.player2Name })}
                    className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-circle-check"></i> Complete & Declare Winner
                  </button>
                  <button
                    onClick={() => handleUpdateMatchOnServer(liveMatch.matchId, { status: 'Upcoming' })}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Demote to Upcoming
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-sm">
                <i className="fa-solid fa-circle-play text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
                <h4 className="font-bold text-slate-900 dark:text-white">No active live match</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Select a match from the schedule below and click "Go Live" to stream score updates.</p>
              </div>
            )}

            {/* List to promote to live */}
            <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md text-left">
              <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-lg mb-6">
                Promote Match to Live
              </h4>
              
              <div className="space-y-3">
                {schedules.filter(m => String(m.status).toLowerCase() !== 'completed' && String(m.status).toLowerCase() !== 'live').map((match) => (
                  <div key={match.matchId} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                        {match.category}
                      </span>
                      <h5 className="font-outfit font-bold text-slate-900 dark:text-white text-sm mt-1">
                        {match.player1Name} vs {match.player2Name}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{match.tableNumber} | Slot: {match.matchTime}</span>
                    </div>
                    <button
                      onClick={() => handleUpdateMatchOnServer(match.matchId, { status: 'Live' })}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold tracking-wide uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-tower-broadcast"></i> Go Live
                    </button>
                  </div>
                ))}

                {schedules.filter(m => String(m.status).toLowerCase() !== 'completed' && String(m.status).toLowerCase() !== 'live').length === 0 && (
                  <p className="text-xs text-slate-400 italic">No upcoming matches available to go live.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Results Management */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md text-left">
            <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-lg mb-6">
              Declare Results & Set Winner
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <th className="pb-3 text-left">Match Details</th>
                    <th className="pb-3 text-left">Table / Time</th>
                    <th className="pb-3 text-left">Scores</th>
                    <th className="pb-3 text-left">Winner Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {schedules.map((match) => (
                    <tr key={match.matchId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-400">#{match.matchId}</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                            {match.category}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{match.player1Name} vs {match.player2Name}</span>
                      </td>
                      
                      <td className="py-4 text-xs text-slate-500">
                        {match.tableNumber} | {match.matchTime}
                      </td>

                      <td className="py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {match.player1Score} - {match.player2Score}
                      </td>

                      <td className="py-4">
                        {String(match.status).toLowerCase() === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-xs font-semibold">
                            <i className="fa-solid fa-trophy"></i> Winner: {match.winner}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-xs font-semibold">
                            Pending ({match.status})
                          </span>
                        )}
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const p1 = window.prompt(`Enter ${match.player1Name} Score:`, match.player1Score);
                              const p2 = window.prompt(`Enter ${match.player2Name} Score:`, match.player2Score);
                              if (p1 !== null && p2 !== null) {
                                const p1Int = parseInt(p1) || 0;
                                const p2Int = parseInt(p2) || 0;
                                const winnerName = p1Int > p2Int ? match.player1Name : p2Int > p1Int ? match.player2Name : "Draw";
                                handleUpdateMatchOnServer(match.matchId, {
                                  player1Score: p1Int,
                                  player2Score: p2Int,
                                  status: 'Completed',
                                  winner: winnerName
                                });
                              }
                            }}
                            className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Set Winner
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {schedules.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 italic">No matches scheduled yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Participants List */}
        {activeTab === 'participants' && (
          <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-lg">
                Participant Database (Read Only)
              </h4>
              <div className="relative max-w-xs w-full flex items-center">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search name, roll..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1a2744] border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-900 dark:text-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 text-left">Full Name</th>
                    <th className="pb-3 text-left">Roll Number</th>
                    <th className="pb-3 text-left">College & Course</th>
                    <th className="pb-3 text-left">Format</th>
                    <th className="pb-3 text-left">Contact Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredRegs.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{row.fullName}</td>
                      <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">{row.rollNumber}</td>
                      <td className="py-3 text-slate-500">{row.collegeName} | {row.course}</td>
                      <td className="py-3">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                          {row.gameCategory}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{row.mobileNumber} | {row.emailAddress}</td>
                    </tr>
                  ))}

                  {filteredRegs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 italic">No participants match filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {isScoringActive && liveMatch && (
        <CoordinatorScoring
          match={liveMatch}
          passcode={passcode}
          onClose={() => setIsScoringActive(false)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );

  // Helper score increment/decrement
  async function updateScoreOnServer(matchId, p1Score, p2Score) {
    // Optimistic UI updates
    setSchedules(prev => prev.map(m => m.matchId === matchId ? { ...m, player1Score: p1Score, player2Score: p2Score } : m));
    if (liveMatch && liveMatch.matchId === matchId) {
      setLiveMatch(prev => ({ ...prev, player1Score: p1Score, player2Score: p2Score }));
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateMatch",
          passcode: passcode,
          matchId,
          player1Score: p1Score,
          player2Score: p2Score
        })
      });
    } catch (err) {
      console.error(err);
    }
  }
};
