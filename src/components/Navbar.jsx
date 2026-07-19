import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export const Navbar = () => {
  const [theme, toggleTheme] = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0e1626]/85 glassmorphism border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group hover:scale-[1.02] transition-transform">
              <div className="bg-white p-1.5 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                <img src="/logo.png" alt="SEMS Logo" className="h-14 sm:h-16 w-auto object-contain" />
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-medium text-sm px-3.5 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/live"
              className={({ isActive }) =>
                `font-medium text-sm px-3.5 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400'
                }`
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Live Match Hub
              </span>
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `font-medium text-sm px-3.5 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400'
                }`
              }
            >
              Register
            </NavLink>
          </nav>

          {/* Actions (Theme toggle & Mobile menu button) */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-transform hover:scale-105 active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <i className="fa-solid fa-sun text-yellow-500 text-lg"></i>
              ) : (
                <i className="fa-solid fa-moon text-indigo-500 text-lg"></i>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Toggle Menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-[#0e1626] border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 flex flex-col gap-2">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block font-medium text-sm px-4 py-2.5 rounded-md transition-colors ${
                isActive
                  ? 'text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/live"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block font-medium text-sm px-4 py-2.5 rounded-md transition-colors ${
                isActive
                  ? 'text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400'
              }`
            }
          >
            Live Match Hub
          </NavLink>
          <NavLink
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block font-medium text-sm px-4 py-2.5 rounded-md transition-colors ${
                isActive
                  ? 'text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400'
              }`
            }
          >
            Register
          </NavLink>
        </nav>
      )}
    </header>
  );
};
