import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#121d33] border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto text-center flex flex-col gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} SEMS Sports Committee. All Rights Reserved.
        </p>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Built for professional table tennis tournaments.
        </p>
      </div>
    </footer>
  );
};
