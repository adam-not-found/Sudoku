/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { SettingsIcon, StatsIcon } from './icons';

interface HeaderProps {
  isDarkMode: boolean;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onNewGame: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onOpenSettings, onOpenStats, onNewGame }) => {
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const textColor = isDarkMode ? 'text-slate-100' : 'text-gray-800';
  const buttonColor = isDarkMode 
    ? 'text-slate-300 hover:bg-slate-700/80' 
    : 'text-slate-600 hover:bg-slate-200/80';
  
  const baseButtonClasses = `
    flex items-center justify-center rounded-full transition-colors duration-300 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
  `;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowNewGameConfirm(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewGameClick = () => {
    onNewGame();
    setShowNewGameConfirm(false);
  };

  return (
    <header className="absolute top-2 left-0 right-0 w-full p-4 z-20">
      <div className="relative w-full flex items-center justify-between h-12">
        <div className="flex-1 flex justify-start">
           <button
            onClick={onOpenStats}
            className={`w-12 h-12 ${baseButtonClasses} ${buttonColor}`}
            aria-label="Open statistics"
          >
            <StatsIcon />
          </button>
        </div>
        
        <div className="flex-1 flex justify-center">
            <div className="relative" ref={menuRef}>
                <h1 
                    onClick={() => setShowNewGameConfirm(prev => !prev)}
                    className={`text-3xl font-bold tracking-tight ${textColor} cursor-pointer select-none transition-colors hover:text-sky-400`}
                    aria-haspopup="true"
                    aria-expanded={showNewGameConfirm}
                >
                    Sudoku
                </h1>
                
                <div className={`
                    absolute top-full left-1/2 -translate-x-1/2 mt-3
                    transform transition-all duration-200 ease-out
                    origin-top
                    ${showNewGameConfirm ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                `}>
                    <button
                        onClick={handleNewGameClick}
                        className={`
                            whitespace-nowrap font-semibold py-2 px-5 rounded-full shadow-lg
                            ${isDarkMode ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' : 'bg-white text-slate-700 hover:bg-slate-100'}
                            transition-all active:scale-95
                        `}
                    >
                        New Game
                    </button>
                </div>
            </div>
        </div>
        
        <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-1">
                <button
                    onClick={onOpenSettings}
                    className={`w-12 h-12 ${baseButtonClasses} ${buttonColor}`}
                    aria-label="Open settings"
                >
                    <SettingsIcon />
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;