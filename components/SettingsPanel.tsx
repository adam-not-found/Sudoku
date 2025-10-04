import React, { useState, useEffect } from 'react';

function Toggle({ id, checked, onChange, label, description, isDarkMode }) {
    return (
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="font-medium pr-4">
          {label}
          <p className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        </label>
        <button 
          id={id} 
          onClick={onChange} 
          role="switch" 
          aria-checked={checked} 
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-slate-800' : ''} ${checked ? 'bg-sky-500' : (isDarkMode ? 'bg-slate-600' : 'bg-gray-200')}`}
        >
          <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    );
}

export default function SettingsPanel({ isOpen, onClose, currentDifficulty, isDarkMode, onToggleDarkMode, onFillBoard, isAutoNotesEnabled, onSetAutoNotes, isHighlightNotesEnabled, onSetHighlightNotes, isTimerVisible, onSetIsTimerVisible }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(currentDifficulty);
  useEffect(() => { if (isOpen) setSelectedDifficulty(currentDifficulty); }, [isOpen, currentDifficulty]);
  
  if (!isOpen) return null;

  const baseBtn = 'w-full text-center font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';
  const selectedBtn = isDarkMode ? 'bg-sky-500 text-white shadow-md' : 'bg-sky-600 text-white shadow-md';
  const unselectedBtn = isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" aria-modal="true" role="dialog">
      <div className={`w-full max-w-md m-4 p-6 rounded-2xl shadow-2xl border flex flex-col gap-6 transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${isDarkMode ? 'bg-slate-800/90 border-slate-600 backdrop-blur-sm text-slate-100' : 'bg-white/90 border-slate-200 backdrop-blur-sm text-slate-800'}`}>
        <h2 className="text-2xl font-bold text-center">Settings</h2>
        <div>
          <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{id:'easy',l:'Easy'},{id:'medium',l:'Medium'},{id:'hard',l:'Hard'},{id:'professional',l:'Pro'}].map(({ id, l }) => 
              <button key={id} onClick={() => setSelectedDifficulty(id)} className={`${baseBtn} ${selectedDifficulty === id ? selectedBtn : unselectedBtn}`} aria-pressed={selectedDifficulty === id}>{l}</button>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Gameplay</h3>
          <div className={`p-4 rounded-lg flex flex-col gap-4 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
            <Toggle id="auto-notes" checked={isAutoNotesEnabled} onChange={() => onSetAutoNotes(!isAutoNotesEnabled)} label="Auto Notes" description="Show all possible notes for empty cells." isDarkMode={isDarkMode} />
            <Toggle id="highlight-notes" checked={isHighlightNotesEnabled} onChange={() => onSetHighlightNotes(!isHighlightNotesEnabled)} label="Highlight Notes" description="Highlight notes matching a selected number." isDarkMode={isDarkMode} />
            <Toggle id="timer-toggle" checked={isTimerVisible} onChange={() => onSetIsTimerVisible(!isTimerVisible)} label="Show Timer" description="Display the game timer above the grid." isDarkMode={isDarkMode} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Light', 'Dark'].map(t => 
              <button key={t} onClick={() => onToggleDarkMode(t === 'Dark')} className={`${baseBtn} ${(t === 'Dark') === isDarkMode ? selectedBtn : unselectedBtn}`} aria-pressed={(t === 'Dark') === isDarkMode}>{t}</button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <button onClick={onFillBoard} className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>I give up</button>
          <button onClick={() => onClose(selectedDifficulty)} className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors ${isDarkMode ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}>Done</button>
        </div>
      </div>
    </div>
  );
}
