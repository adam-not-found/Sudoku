/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SettingsIcon, NewGameIcon, StatsIcon } from './icons';

interface HeaderProps {
  isDarkMode: boolean;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onNewGame: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onOpenSettings, onOpenStats, onNewGame }) => {
  const [isRotating, setIsRotating] = useState(false);

  const textColor = isDarkMode ? 'text-slate-100' : 'text-gray-800';
  const buttonColor = isDarkMode 
    ? 'text-slate-300 hover:bg-slate-700/80' 
    : 'text-slate-600 hover:bg-slate-200/80';
  
  const baseButtonClasses = `
    flex items-center justify-center rounded-full transition-colors duration-300 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
  `;

  const handleNewGameClick = () => {
    if (isRotating) return;
    onNewGame();
    setIsRotating(true);
  };

  return (
    <header className="absolute top-0 left-0 right-0 w-full p-4 z-20">
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
            <h1 className={`text-3xl font-bold tracking-tight ${textColor}`}>
                Sudoku
            </h1>
        </div>
        
        <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-1">
                <button
                    onClick={handleNewGameClick}
                    className={`w-10 h-10 ${baseButtonClasses} ${buttonColor}`}
                    aria-label="Start new game"
                >
                    <div 
                    className={isRotating ? 'animate-rotate' : ''}
                    onAnimationEnd={() => setIsRotating(false)}
                    >
                    <NewGameIcon />
                    </div>
                </button>
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