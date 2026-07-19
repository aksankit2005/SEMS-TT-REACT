import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export const Live = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll schedules & live match every 5 seconds for real-time scores
  const fetchLiveHub = async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getSchedules`);
      const json = await response.json();
      if (json.status === "success") {
        const list = json.data || [];
        setSchedules(list);
        const live = list.find(m => String(m.status).toLowerCase() === 'live');
        setLiveMatch(live || null);
      }
    } catch (err) {
      console.error("Failed to poll live scores: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHub();
    const timer = setInterval(fetchLiveHub, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter schedules
  const upcomingMatches = schedules.filter(m => String(m.status).toLowerCase() === 'upcoming');
  const completedMatches = schedules.filter(m => String(m.status).toLowerCase() === 'completed');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Live Header */}
      <div className="text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row items-center gap-4 justify-between transition-colors duration-300">
        <div>
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase select-none w-fit mx-auto sm:mx-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Match Center
          </div>
          <h2 className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            SEMS Tournament Live Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time score updates, live streaming feeds, and active schedules
          </p>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-blue-500/10 cursor-pointer"
        >
          <i className="fa-solid fa-user-plus"></i> Register for Event
        </button>
      </div>

      {/* Live Match Scoreboard Card */}
      {liveMatch ? (
        <div className="bg-gradient-to-br from-indigo-900 via-[#121d33] to-[#0d1629] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-center text-white relative shadow-xl">
          <span className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse select-none">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live Score
          </span>

          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400">
            {liveMatch.category} tournament
          </span>

          {/* Teams / Players Grid */}
          <div className="grid grid-cols-5 items-center max-w-2xl mx-auto my-6 gap-4 select-none">
            {/* Player 1 Details */}
            <div className="col-span-2 flex flex-col items-center">
              <h4 className="font-outfit font-extrabold text-lg sm:text-2xl tracking-tight line-clamp-1 flex items-center gap-1.5">
                {liveMatch.player1Name}
                {liveMatch.currentServer === "Player 1" && <span className="text-sm" title="Serving">🏓</span>}
              </h4>
              <span className="text-xs text-indigo-300 font-mono mt-1">Roll: {liveMatch.player1Roll}</span>
              <div className="text-6xl sm:text-8xl font-extrabold font-mono text-white mt-4 drop-shadow-lg leading-none">
                {liveMatch.player1Score}
              </div>
              <span className="text-xs font-bold text-slate-400 mt-3">Sets Won: <span className="text-indigo-400 text-sm font-mono font-extrabold">{liveMatch.setsWonP1 || 0}</span></span>
            </div>

            {/* VS Division */}
            <div className="col-span-1 flex flex-col items-center text-indigo-400">
              <span className="text-sm font-bold tracking-widest text-slate-400/80">VS</span>
              <span className="text-[10px] mt-4 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 whitespace-nowrap">
                {liveMatch.tableNumber}
              </span>
            </div>

            {/* Player 2 Details */}
            <div className="col-span-2 flex flex-col items-center">
              <h4 className="font-outfit font-extrabold text-lg sm:text-2xl tracking-tight line-clamp-1 flex items-center gap-1.5">
                {liveMatch.player2Name}
                {liveMatch.currentServer === "Player 2" && <span className="text-sm" title="Serving">🏓</span>}
              </h4>
              <span className="text-xs text-indigo-300 font-mono mt-1">Roll: {liveMatch.player2Roll}</span>
              <div className="text-6xl sm:text-8xl font-extrabold font-mono text-white mt-4 drop-shadow-lg leading-none">
                {liveMatch.player2Score}
              </div>
              <span className="text-xs font-bold text-slate-400 mt-3">Sets Won: <span className="text-indigo-400 text-sm font-mono font-extrabold">{liveMatch.setsWonP2 || 0}</span></span>
            </div>
          </div>

          {/* Set Scores tracker log */}
          {((liveMatch.set1Score && liveMatch.set1Score !== "0-0") || 
            (liveMatch.set2Score && liveMatch.set2Score !== "0-0") || 
            (liveMatch.set3Score && liveMatch.set3Score !== "0-0") ||
            (liveMatch.set4Score && liveMatch.set4Score !== "0-0") ||
            (liveMatch.set5Score && liveMatch.set5Score !== "0-0")) && (
            <div className="bg-[#0e1626]/40 border border-slate-800 rounded-xl p-3 max-w-md mx-auto mb-4 flex flex-wrap justify-center gap-4 text-xs font-mono font-semibold text-slate-300">
              {liveMatch.set1Score && liveMatch.set1Score !== "0-0" && <span>Set 1: {liveMatch.set1Score}</span>}
              {liveMatch.set2Score && liveMatch.set2Score !== "0-0" && <span>Set 2: {liveMatch.set2Score}</span>}
              {liveMatch.set3Score && liveMatch.set3Score !== "0-0" && <span>Set 3: {liveMatch.set3Score}</span>}
              {liveMatch.set4Score && liveMatch.set4Score !== "0-0" && <span>Set 4: {liveMatch.set4Score}</span>}
              {liveMatch.set5Score && liveMatch.set5Score !== "0-0" && <span>Set 5: {liveMatch.set5Score}</span>}
            </div>
          )}

          <div className="text-xs text-indigo-300 tracking-wider font-semibold">
            <i className="fa-solid fa-clock"></i> Match started at {formatTime(liveMatch.matchTime)}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-lg transition-colors duration-300 flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-3xl mb-4">
            <i className="fa-solid fa-table-tennis-paddle-ball text-blue-500/50"></i>
          </div>
          <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-1">
            No Live Matches Right Now
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Updates will flash here in real time as soon as coordinator goes live with a match!
          </p>
        </div>
      )}

      {/* Match Schedules & Draws */}
      <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg transition-colors duration-300 text-left">
        <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-6">
          Match Schedules & Draws
        </h3>
        
        {schedules.length === 0 && !loading ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-2xl mb-4">
              <i className="fa-regular fa-calendar-xmark text-blue-500/50"></i>
            </div>
            <h4 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-1">
              No Matches Scheduled Yet
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upcoming match timetables and draws will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Upcoming Matches */}
            <div>
              <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Upcoming Draws ({upcomingMatches.length})
              </h4>
              
              <div className="space-y-3">
                {upcomingMatches.map((m) => (
                  <div key={m.matchId} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                        {m.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">#{m.matchId}</span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {m.player1Name} vs {m.player2Name}
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400 mt-2">
                      <span><i className="fa-solid fa-table-tennis-paddle-ball text-[10px]"></i> {m.tableNumber}</span>
                      <span><i className="fa-solid fa-clock text-[10px]"></i> {formatTime(m.matchTime)}</span>
                    </div>
                  </div>
                ))}

                {upcomingMatches.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No upcoming matches scheduled.</p>
                )}
              </div>
            </div>

            {/* Column 2: Completed Matches */}
            <div>
              <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Completed Fixtures ({completedMatches.length})
              </h4>
              
              <div className="space-y-3">
                {completedMatches.map((m) => (
                  <div key={m.matchId} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl relative overflow-hidden bg-slate-50/30 dark:bg-[#121d33]/20">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded">
                        {m.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">#{m.matchId}</span>
                    </div>
                    <div className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center justify-between">
                      <span>{m.player1Name} vs {m.player2Name}</span>
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {m.player1Score} - {m.player2Score}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2.5 flex items-center gap-1">
                      <i className="fa-solid fa-trophy"></i> Winner: {m.winner}
                    </div>
                  </div>
                ))}

                {completedMatches.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No completed fixtures yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
