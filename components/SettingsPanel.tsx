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
  onFillBoard: () => void;
  isAutoNotesEnabled: boolean;
  onSetAutoNotes: (enabled: boolean) => void;
  isHighlightNotesEnabled: boolean;
  onSetHighlightNotes: (enabled: boolean) => void;
}

const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'professional', label: 'Pro' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  currentDifficulty, 
  isDarkMode, 
  onToggleDarkMode, 
  onFillBoard,
  isAutoNotesEnabled,
  onSetAutoNotes,
  isHighlightNotesEnabled,
  onSetHighlightNotes,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);

  useEffect(() => {
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
  const sectionBgClass = isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100';
  
  const baseButtonClasses = 'w-full text-center font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';
  const selectedClasses = isDarkMode 
    ? 'bg-sky-500 text-white shadow-md' 
    : 'bg-sky-600 text-white shadow-md';
  const unselectedClasses = isDarkMode 
    ? 'bg-slate-700 hover:bg-slate-600' 
    : 'bg-slate-200 hover:bg-slate-300';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" aria-modal="true" role="dialog">
      <div className={`
        w-full max-w-md m-4 p-6 rounded-2xl shadow-2xl border
        flex flex-col gap-6
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
          <h3 className="text-lg font-semibold mb-2">Gameplay</h3>
          <div className={`p-4 rounded-lg ${sectionBgClass} flex flex-col gap-4`}>
            <div className="flex justify-between items-center">
              <label htmlFor="auto-notes-toggle" className="font-medium pr-4">
                Auto Notes
                <p className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Show all possible notes for empty cells.
                </p>
              </label>
              <button
                id="auto-notes-toggle"
                onClick={() => onSetAutoNotes(!isAutoNotesEnabled)}
                role="switch"
                aria-checked={isAutoNotesEnabled}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'} ${isAutoNotesEnabled ? 'bg-sky-500' : (isDarkMode ? 'bg-slate-600' : 'bg-gray-200')}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutoNotesEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <label htmlFor="highlight-notes-toggle" className="font-medium pr-4">
                Highlight Notes
                <p className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Also highlight notes matching the selected number.
                </p>
              </label>
              <button
                id="highlight-notes-toggle"
                onClick={() => onSetHighlightNotes(!isHighlightNotesEnabled)}
                role="switch"
                aria-checked={isHighlightNotesEnabled}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'} ${isHighlightNotesEnabled ? 'bg-sky-500' : (isDarkMode ? 'bg-slate-600' : 'bg-gray-200')}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isHighlightNotesEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Light', 'Dark'].map((theme) => {
              const isSelected = (theme === 'Light' && !isDarkMode) || (theme === 'Dark' && isDarkMode);
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
        
        <div className="flex justify-between items-center mt-2">
           <button 
            onClick={onFillBoard}
            className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            aria-label="Fill board with solution"
          >
            I give up
          </button>
          
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