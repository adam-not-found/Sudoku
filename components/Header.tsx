/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SettingsIcon, NewGameIcon } from './icons';

interface HeaderProps {
  isDarkMode: boolean;
  onOpenSettings: () => void;
  onNewGame: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onOpenSettings, onNewGame }) => {
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
      <div className="relative w-full flex items-center justify-center h-12">
        <h1 className={`text-3xl font-bold tracking-tight ${textColor}`}>
          Sudoku
        </h1>
        <div className="absolute right-0 flex items-center gap-1">
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
    </header>
  );
};

export default Header;