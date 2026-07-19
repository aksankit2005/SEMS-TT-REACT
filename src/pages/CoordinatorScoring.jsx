import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQBRLpFgY0Q9QyDjntvbVdRmcxtmuG_lZI86WhtMFT6QhpPhfRequlQ_I4uZm3vEnhaA/exec";

export const CoordinatorScoring = ({ match, passcode, onClose, onUpdate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Score states
  const [pointsP1, setPointsP1] = useState(parseInt(match.player1Score) || 0);
  const [pointsP2, setPointsP2] = useState(parseInt(match.player2Score) || 0);
  const [setsWonP1, setSetsWonP1] = useState(parseInt(match.setsWonP1) || 0);
  const [setsWonP2, setSetsWonP2] = useState(parseInt(match.setsWonP2) || 0);
  
  // Set logs
  const [set1Score, setSet1Score] = useState(match.set1Score || "0-0");
  const [set2Score, setSet2Score] = useState(match.set2Score || "0-0");
  const [set3Score, setSet3Score] = useState(match.set3Score || "0-0");
  const [set4Score, setSet4Score] = useState(match.set4Score || "0-0");
  const [set5Score, setSet5Score] = useState(match.set5Score || "0-0");

  // Server state: "Player 1" or "Player 2"
  const [currentServer, setCurrentServer] = useState(match.currentServer || "Player 1");

  // Auto service switch calculation (TT switches serve every 2 points)
  useEffect(() => {
    const totalPoints = pointsP1 + pointsP2;
    // Over 10-10 (Deuce), serve switches every single point
    const serveInterval = (pointsP1 >= 10 && pointsP2 >= 10) ? 1 : 2;
    
    // Toggle server based on initial serve (Player 1 starts set serving)
    const isP1Serving = Math.floor(totalPoints / serveInterval) % 2 === 0;
    setCurrentServer(isP1Serving ? "Player 1" : "Player 2");
  }, [pointsP1, pointsP2]);

  // Sync point updates to Google Sheets in real-time
  const syncPoints = async (p1, p2, serverName) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateMatch",
          passcode: passcode,
          matchId: match.matchId,
          player1Score: p1,
          player2Score: p2,
          currentServer: serverName
        })
      });
    } catch (err) {
      console.error("Score sync error: ", err);
    }
  };

  const handleAdjustPoints = (player, val) => {
    if (player === 1) {
      const nextVal = Math.max(0, pointsP1 + val);
      setPointsP1(nextVal);
      syncPoints(nextVal, pointsP2, currentServer);
    } else {
      const nextVal = Math.max(0, pointsP2 + val);
      setPointsP2(nextVal);
      syncPoints(pointsP1, nextVal, currentServer);
    }
  };

  // Lock set score
  const handleLockSet = async (setNumber) => {
    setLoading(true);
    const setScoreStr = `${pointsP1}-${pointsP2}`;
    
    // Determine winner of set
    let winner = 0;
    if (pointsP1 > pointsP2) {
      winner = 1;
    } else if (pointsP2 > pointsP1) {
      winner = 2;
    }

    if (winner === 0) {
      showToast("Cannot lock set. Scores are equal!", "warning");
      setLoading(false);
      return;
    }

    const nextSetsWonP1 = winner === 1 ? setsWonP1 + 1 : setsWonP1;
    const nextSetsWonP2 = winner === 2 ? setsWonP2 + 1 : setsWonP2;

    try {
      const updateData = {
        action: "updateMatch",
        passcode: passcode,
        matchId: match.matchId,
        setsWonP1: nextSetsWonP1,
        setsWonP2: nextSetsWonP2,
        player1Score: 0,
        player2Score: 0
      };

      if (setNumber === 1) {
        updateData.set1Score = setScoreStr;
        setSet1Score(setScoreStr);
      } else if (setNumber === 2) {
        updateData.set2Score = setScoreStr;
        setSet2Score(setScoreStr);
      } else if (setNumber === 3) {
        updateData.set3Score = setScoreStr;
        setSet3Score(setScoreStr);
      } else if (setNumber === 4) {
        updateData.set4Score = setScoreStr;
        setSet4Score(setScoreStr);
      } else if (setNumber === 5) {
        updateData.set5Score = setScoreStr;
        setSet5Score(setScoreStr);
      }

      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(updateData)
      });
      const json = await res.json();
      if (json.status === "success") {
        setPointsP1(0);
        setPointsP2(0);
        setSetsWonP1(nextSetsWonP1);
        setSetsWonP2(nextSetsWonP2);
        showToast(`Set ${setNumber} locked: ${setScoreStr}`, "success");
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      showToast("Failed to lock set: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Complete Match
  const handleCompleteMatch = async () => {
    setLoading(true);
    let finalWinner = "N/A";
    if (setsWonP1 > setsWonP2) {
      finalWinner = match.player1Name;
    } else if (setsWonP2 > setsWonP1) {
      finalWinner = match.player2Name;
    } else {
      // Fallback to point check
      finalWinner = pointsP1 > pointsP2 ? match.player1Name : match.player2Name;
    }

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateMatch",
          passcode: passcode,
          matchId: match.matchId,
          status: "Completed",
          winner: finalWinner,
          player1Score: pointsP1,
          player2Score: pointsP2
        })
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast(`Match Completed! Winner: ${finalWinner}`, "success");
        onUpdate();
        onClose();
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      showToast("Failed to end match: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Determine current active set to lock
  const currentSetNum = setsWonP1 + setsWonP2 + 1;

  return (
    <div className="fixed inset-0 bg-[#090d16] z-[1500] text-white overflow-y-auto flex flex-col justify-between">
      {/* Header bar */}
      <div className="border-b border-slate-800 p-4 bg-[#0e1626]/80 backdrop-blur flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-outfit font-bold tracking-wide text-sm text-slate-300">
            LIVE SCORE BOARD · #{match.matchId}
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-extrabold px-2 py-0.5 rounded border border-indigo-500/30">
            {match.category.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">
            {match.tableNumber}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-2 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i> Exit Controller
        </button>
      </div>

      {/* Main Scoreboard Area */}
      <div className="max-w-4xl mx-auto w-full px-6 py-8 flex-grow flex flex-col justify-around gap-6">
        {/* Set Wins display */}
        <div className="flex justify-around items-center max-w-lg mx-auto w-full border border-slate-800 bg-[#0e1626]/50 rounded-2xl p-4 gap-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sets Won</span>
            <span className="text-3xl font-extrabold font-mono text-indigo-400">{setsWonP1}</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800"></div>
          <div className="text-center">
            <span className="text-xs font-bold text-slate-300">Set {currentSetNum} in Progress</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Best of 5 Sets</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800"></div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sets Won</span>
            <span className="text-3xl font-extrabold font-mono text-indigo-400">{setsWonP2}</span>
          </div>
        </div>

        {/* Digital Point Board Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-6 sm:gap-4 my-4">
          {/* Player 1 Scoreboard */}
          <div className="col-span-2 flex flex-col items-center bg-[#0e1626] border border-slate-800 p-6 rounded-3xl relative">
            {currentServer === "Player 1" && (
              <span className="absolute -top-3 bg-yellow-500 text-slate-900 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider select-none shadow">
                🏓 Serving
              </span>
            )}
            <h3 className="font-outfit font-extrabold text-xl tracking-tight text-slate-200 line-clamp-1">{match.player1Name}</h3>
            <span className="text-xs text-slate-500 font-mono mt-1">Roll: {match.player1Roll}</span>

            {/* Score view */}
            <div className="text-8xl sm:text-9xl font-extrabold font-mono text-white my-6 select-none leading-none tracking-tighter">
              {pointsP1}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleAdjustPoints(1, -1)}
                className="flex-1 py-3 border border-slate-800 hover:bg-white/5 rounded-xl font-bold transition-all text-sm cursor-pointer select-none"
              >
                - Point
              </button>
              <button
                onClick={() => handleAdjustPoints(1, 1)}
                className="flex-[2] py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-xl transition-all text-base cursor-pointer select-none shadow"
              >
                + Point
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="col-span-1 flex flex-col items-center text-slate-500 text-sm font-bold py-2">
            <span>VS</span>
            <div className="h-16 w-[1px] bg-slate-800 my-3"></div>
            <button
              onClick={() => setCurrentServer(currentServer === "Player 1" ? "Player 2" : "Player 1")}
              className="text-[10px] text-slate-400 bg-[#0e1626] hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer select-none"
            >
              <i className="fa-solid fa-arrows-rotate"></i> Change Server
            </button>
          </div>

          {/* Player 2 Scoreboard */}
          <div className="col-span-2 flex flex-col items-center bg-[#0e1626] border border-slate-800 p-6 rounded-3xl relative">
            {currentServer === "Player 2" && (
              <span className="absolute -top-3 bg-yellow-500 text-slate-900 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider select-none shadow">
                🏓 Serving
              </span>
            )}
            <h3 className="font-outfit font-extrabold text-xl tracking-tight text-slate-200 line-clamp-1">{match.player2Name}</h3>
            <span className="text-xs text-slate-500 font-mono mt-1">Roll: {match.player2Roll}</span>

            {/* Score view */}
            <div className="text-8xl sm:text-9xl font-extrabold font-mono text-white my-6 select-none leading-none tracking-tighter">
              {pointsP2}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleAdjustPoints(2, -1)}
                className="flex-1 py-3 border border-slate-800 hover:bg-white/5 rounded-xl font-bold transition-all text-sm cursor-pointer select-none"
              >
                - Point
              </button>
              <button
                onClick={() => handleAdjustPoints(2, 1)}
                className="flex-[2] py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-xl transition-all text-base cursor-pointer select-none shadow"
              >
                + Point
              </button>
            </div>
          </div>
        </div>

        {/* Set History Logs */}
        <div className="bg-[#0e1626]/40 border border-slate-850 rounded-2xl p-5 text-left max-w-xl mx-auto w-full space-y-3">
          <h5 className="font-outfit font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">
            Set Scores Log
          </h5>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Set 1 score:</span>
            {set1Score === "0-0" ? (
              <button
                onClick={() => handleLockSet(1)}
                disabled={loading || currentSetNum !== 1}
                className="px-3 py-1 bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-400 font-bold rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
              >
                Lock Set 1 Score ({pointsP1}-{pointsP2})
              </button>
            ) : (
              <span className="font-mono font-bold text-slate-200">{set1Score}</span>
            )}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Set 2 score:</span>
            {set2Score === "0-0" ? (
              <button
                onClick={() => handleLockSet(2)}
                disabled={loading || currentSetNum !== 2}
                className="px-3 py-1 bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-400 font-bold rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
              >
                Lock Set 2 Score ({pointsP1}-{pointsP2})
              </button>
            ) : (
              <span className="font-mono font-bold text-slate-200">{set2Score}</span>
            )}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Set 3 score:</span>
            {set3Score === "0-0" ? (
              <button
                onClick={() => handleLockSet(3)}
                disabled={loading || currentSetNum !== 3}
                className="px-3 py-1 bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-400 font-bold rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
              >
                Lock Set 3 Score ({pointsP1}-{pointsP2})
              </button>
            ) : (
              <span className="font-mono font-bold text-slate-200">{set3Score}</span>
            )}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Set 4 score:</span>
            {set4Score === "0-0" ? (
              <button
                onClick={() => handleLockSet(4)}
                disabled={loading || currentSetNum !== 4}
                className="px-3 py-1 bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-400 font-bold rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
              >
                Lock Set 4 Score ({pointsP1}-{pointsP2})
              </button>
            ) : (
              <span className="font-mono font-bold text-slate-200">{set4Score}</span>
            )}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Set 5 score:</span>
            {set5Score === "0-0" ? (
              <button
                onClick={() => handleLockSet(5)}
                disabled={loading || currentSetNum !== 5}
                className="px-3 py-1 bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-400 font-bold rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
              >
                Lock Set 5 Score ({pointsP1}-{pointsP2})
              </button>
            ) : (
              <span className="font-mono font-bold text-slate-200">{set5Score}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer controls bar */}
      <div className="border-t border-slate-800 p-6 bg-[#0e1626]/40 flex justify-center items-center">
        <button
          onClick={handleCompleteMatch}
          disabled={loading}
          className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg rounded-2xl transition-all shadow-lg hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <i className="fa-solid fa-trophy"></i> End Match & Declare Winner
        </button>
      </div>
    </div>
  );
};
