import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#121d33] border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Side: Copyright & Brand */}
        <div className="text-center md:text-left flex flex-col gap-1.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} SEMS Sports Committee. All Rights Reserved.
          </p>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Built for professional table tennis tournaments.
          </p>
        </div>

        {/* Right Side: Contact & Social Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-slate-500 dark:text-slate-400 font-semibold">
          {/* Support Email */}
          <a
            href="mailto:raipravee238@gmail.com"
            className="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <i className="fa-solid fa-envelope"></i>
            <span>raipravee238@gmail.com</span>
          </a>

          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/apex_mpgi?igsh=MWdjdmQxMGdzd3hhMQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-[#E1306C] transition-colors"
          >
            <i className="fa-brands fa-instagram text-base"></i>
            <span>Apex MPGI</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
