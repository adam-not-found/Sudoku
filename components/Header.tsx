import React from 'react';
import { SettingsIcon, StatsIcon } from './icons';

export default function Header({ isDarkMode, onOpenSettings, onOpenStats, onTitleClick, isNewGameConfirmOpen }) {
  return (
    <header className="absolute left-0 right-0 w-full px-4 z-20" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}>
      <div className="relative w-full flex items-center justify-between h-12">
        <div className="flex-1 flex justify-start">
          <button onClick={onOpenSettings} className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/80' : 'text-slate-600 hover:bg-slate-200/80'}`} aria-label="Settings">
            <SettingsIcon />
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <h1 onClick={onTitleClick} className={`text-3xl font-bold tracking-tight cursor-pointer select-none transition-colors ${isNewGameConfirmOpen ? (isDarkMode ? 'text-sky-400' : 'text-sky-500') : 'hover:text-sky-400'} ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`} aria-haspopup="true" aria-expanded={isNewGameConfirmOpen}>
              Sudoku
            </h1>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <button onClick={onOpenStats} className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/80' : 'text-slate-600 hover:bg-slate-200/80'}`} aria-label="Stats">
            <StatsIcon />
          </button>
        </div>
      </div>
    </header>
  );
}