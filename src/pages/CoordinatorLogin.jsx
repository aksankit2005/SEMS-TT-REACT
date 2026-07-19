import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const COORD_PASSCODE = "COORD2026";

export const CoordinatorLogin = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === COORD_PASSCODE) {
      sessionStorage.setItem('coordinatorAuth', 'true');
      sessionStorage.setItem('coordinatorPasscode', passcode);
      showToast("Access Granted. Welcome to Coordinator Portal!", "success");
      navigate('/coordinator/dashboard');
    } else {
      setError('Invalid Coordinator Passcode. Please try again.');
      showToast('Authentication failed!', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg transition-colors duration-300">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-500 dark:text-indigo-400 text-xl flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-user-shield"></i>
        </div>

        <h2 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
          Coordinator Access
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-8">
          Enter passcode to access event schedules, fixtures, and Live Match Center
        </p>

        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Coordinator Passcode
            </label>
            <div className="relative flex items-center">
              <i className="fa-solid fa-key absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter passcode"
                className="w-full bg-slate-50 dark:bg-[#1a2744] border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-[#121d33] text-slate-900 dark:text-white"
                required
              />
            </div>
            {error && <span className="text-red-500 text-xs font-semibold">{error}</span>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-400 dark:to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/10 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-unlock-keyhole"></i> Unlock Coordinator Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
