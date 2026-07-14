import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Live = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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

      {/* Empty State: Live Matches */}
      <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-lg transition-colors duration-300 flex flex-col items-center justify-center min-h-[280px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-3xl mb-4">
          <i className="fa-solid fa-table-tennis-paddle-ball text-blue-500/50"></i>
        </div>
        <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-1">
          No Live Matches
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          There are currently no live matches.
        </p>
      </div>

      {/* Empty State: Match Schedules & Draws */}
      <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg transition-colors duration-300">
        <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-6 text-left">
          Match Schedules & Draws
        </h3>
        
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-2xl mb-4">
            <i className="fa-regular fa-calendar-xmark text-blue-500/50"></i>
          </div>
          <h4 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-1">
            No Matches Scheduled Yet
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upcoming matches will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};
