/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Difficulty } from '../services/sudokuGenerator';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: (newDifficulty: Difficulty) => void;
  currentDifficulty: Difficulty;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'professional', label: 'Professional' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, currentDifficulty, isDarkMode, onToggleDarkMode }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);

  useEffect(() => {
    // Reset selection to current game difficulty when panel is opened
    if (isOpen) {
      setSelectedDifficulty(currentDifficulty);
    }
  }, [isOpen, currentDifficulty]);

  if (!isOpen) {
    return null;
  }

  const handleDone = () => {
    onClose(selectedDifficulty);
  };

  const modalBgClass = isDarkMode ? 'bg-slate-800/90 border-slate-600 backdrop-blur-sm' : 'bg-white/90 border-slate-200 backdrop-blur-sm';
  const modalTextClass = isDarkMode ? 'text-slate-100' : 'text-slate-800';
  const doneButtonClass = isDarkMode ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" aria-modal="true" role="dialog">
      <div className={`
        w-full max-w-md m-4 p-6 rounded-2xl shadow-2xl border
        flex flex-col gap-8
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${modalBgClass} ${modalTextClass}
      `}>
        <h2 className="text-2xl font-bold text-center">Settings</h2>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
          <div className="grid grid-cols-2 gap-3">
            {difficulties.map(({ id, label }) => {
              const isSelected = selectedDifficulty === id;
              const baseButtonClasses = 'w-full text-center font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';
              const selectedClasses = isDarkMode 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'bg-sky-600 text-white shadow-md';
              const unselectedClasses = isDarkMode 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-slate-200 hover:bg-slate-300';
              
              return (
                <button
                  key={id}
                  onClick={() => setSelectedDifficulty(id)}
                  className={`${baseButtonClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
                  aria-pressed={isSelected}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Light', 'Dark'].map((theme) => {
              const isSelected = (theme === 'Light' && !isDarkMode) || (theme === 'Dark' && isDarkMode);
              const baseButtonClasses = 'w-full text-center font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';
              const selectedClasses = isDarkMode 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'bg-sky-600 text-white shadow-md';
              const unselectedClasses = isDarkMode 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-slate-200 hover:bg-slate-300';

              return (
                <button
                  key={theme}
                  onClick={() => {
                    if ((theme === 'Light' && isDarkMode) || (theme === 'Dark' && !isDarkMode)) {
                      onToggleDarkMode();
                    }
                  }}
                  className={`${baseButtonClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
                  aria-pressed={isSelected}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-end mt-2">
          <button
            onClick={handleDone}
            className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors ${doneButtonClass}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;