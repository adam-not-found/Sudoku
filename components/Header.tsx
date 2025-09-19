/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SettingsIcon } from './icons';

interface HeaderProps {
  isDarkMode: boolean;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onOpenSettings }) => {
  const textColor = isDarkMode ? 'text-slate-100' : 'text-gray-800';
  const buttonColor = isDarkMode 
    ? 'text-slate-300 hover:bg-slate-700/80' 
    : 'text-slate-600 hover:bg-slate-200/80';

  return (
    <header className="absolute top-0 left-0 right-0 w-full p-4 z-20">
      <div className="relative w-full flex items-center justify-center h-12">
        <h1 className={`text-3xl font-bold tracking-tight ${textColor}`}>
          Sudoku
        </h1>
        <div className="absolute right-0 flex items-center">
          <button
            onClick={onOpenSettings}
            className={`
              w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
              ${buttonColor}
            `}
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