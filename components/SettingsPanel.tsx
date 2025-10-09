import React, { useState, useEffect, useRef } from 'react';
import { themes } from './themes';
import { ThemeIcon } from './icons';

function Toggle({ id, checked, onChange, label, description }) {
    return (
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="font-medium pr-4">
          {label}
          <p className={`text-xs font-normal text-[var(--color-text-secondary)]`}>{description}</p>
        </label>
        <button 
          id={id} 
          onClick={onChange} 
          role="switch" 
          aria-checked={checked} 
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-ui-bg)] ${checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-toggle-bg)]'}`}
        >
          <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    );
}

export default function SettingsPanel({ isOpen, onClose, currentDifficulty, theme, setTheme, colorMode, setColorMode, onFillBoard, isAutoNotesEnabled, onSetAutoNotes, isHighlightNotesEnabled, onSetHighlightNotes, isTimerVisible, onSetIsTimerVisible }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(currentDifficulty);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const themePickerRef = useRef(null);

  useEffect(() => {
    if (isOpen) setSelectedDifficulty(currentDifficulty);
  }, [isOpen, currentDifficulty]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (themePickerRef.current && !themePickerRef.current.contains(event.target)) {
            setIsThemeSelectorOpen(false);
        }
    };
    if (isThemeSelectorOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isThemeSelectorOpen]);
  
  if (!isOpen) return null;

  const baseBtn = 'w-full text-center font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 ring-offset-[var(--color-ui-bg)]';
  const selectedBtn = 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-md';
  const unselectedBtn = 'bg-[var(--color-btn-secondary-bg)] hover:bg-[var(--color-btn-secondary-bg-hover)]';

  const baseModeBtn = 'w-full text-center font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 ring-offset-[var(--color-ui-bg)]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" aria-modal="true" role="dialog">
      <div className={`w-full max-w-md m-4 p-6 rounded-2xl shadow-2xl border flex flex-col gap-6 transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} bg-[var(--color-ui-bg-translucent)] border-[var(--color-ui-border)] backdrop-blur-sm text-[var(--color-text-primary)]`}>
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
          <h3 className="text-lg font-semibold mb-2">Theme</h3>
          <div className="relative" ref={themePickerRef}>
            <button
              onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-ui-bg-secondary)] hover:bg-[var(--color-ui-bg-hover)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 ring-offset-[var(--color-ui-bg)] transition-colors"
              aria-haspopup="true"
              aria-expanded={isThemeSelectorOpen}
            >
              <span>{themes[theme].name}</span>
              <div className="w-6 h-6 rounded-full border border-black/10 overflow-hidden">
                <ThemeIcon colors={themes[theme].gradientColors} patternId={theme} />
              </div>
            </button>
            <div className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-lg bg-[var(--color-ui-bg)] shadow-lg z-10 border border-[var(--color-ui-border)] transition-all duration-200 ease-out origin-top ${isThemeSelectorOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-[var(--color-text-secondary)]">Palette</label>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(themes).map(([id, { name, gradientColors }]) => (
                        <button
                          key={id}
                          onClick={() => setTheme(id)}
                          className="flex flex-col items-center gap-1 group focus:outline-none"
                          aria-label={`Select ${name} theme`}
                          aria-pressed={theme === id}
                        >
                          <div
                            className={`w-10 h-10 rounded-full transition-transform group-hover:scale-110 focus:scale-110 border border-black/10 overflow-hidden ${theme === id ? 'ring-2 ring-offset-2 ring-[var(--color-accent)] ring-offset-[var(--color-ui-bg)]' : ''}`}
                          >
                            <ThemeIcon colors={gradientColors} patternId={id} />
                          </div>
                          <span className="text-xs text-[var(--color-text-secondary)]">{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-[var(--color-text-secondary)]">Appearance</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Light', 'Dark', 'System'].map(t => 
                        <button key={t} onClick={() => setColorMode(t.toLowerCase())} className={`${baseModeBtn} ${t.toLowerCase() === colorMode ? selectedBtn : unselectedBtn}`} aria-pressed={t.toLowerCase() === colorMode}>{t}</button>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Gameplay</h3>
          <div className={`p-4 rounded-lg flex flex-col gap-4 bg-[var(--color-ui-bg-secondary)]`}>
            <Toggle id="auto-notes" checked={isAutoNotesEnabled} onChange={() => onSetAutoNotes(!isAutoNotesEnabled)} label="Auto Notes" description="Show all possible notes for empty cells." />
            <Toggle id="highlight-notes" checked={isHighlightNotesEnabled} onChange={() => onSetHighlightNotes(!isHighlightNotesEnabled)} label="Highlight Notes" description="Highlight notes matching a selected number." />
            <Toggle id="timer-toggle" checked={isTimerVisible} onChange={() => onSetIsTimerVisible(!isTimerVisible)} label="Show Timer" description="Display the game timer above the grid." />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <button onClick={onFillBoard} className={`text-sm font-medium transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]`}>I give up</button>
          <button onClick={() => onClose(selectedDifficulty)} className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)]`}>Done</button>
        </div>
      </div>
    </div>
  );
}