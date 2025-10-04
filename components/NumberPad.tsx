import React from 'react';

export default function NumberPad({ onNumberClick, isNotesMode, isDarkMode }) {
  const containerBgClass = isNotesMode ? (isDarkMode ? 'bg-slate-600' : 'bg-slate-700') : (isDarkMode ? 'bg-slate-700' : 'bg-slate-800');
  const buttonHoverFocusClass = isDarkMode ? 'hover:bg-slate-600/80 focus:bg-slate-600' : 'hover:bg-slate-700/80 focus:bg-slate-700';
  
  return (
    <div className={`rounded-full p-1 flex justify-around items-center w-full transition-all duration-300 shadow-lg ${containerBgClass}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <button 
          key={i + 1} 
          onClick={() => onNumberClick(i + 1)} 
          className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center font-semibold text-3xl sm:text-4xl rounded-full focus:outline-none transition-all duration-200 transform active:scale-90 text-slate-200 ${buttonHoverFocusClass}`} 
          aria-label={`Enter number ${i + 1}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
