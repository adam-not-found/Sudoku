import React from 'react';

export default function NumberPad({ onNumberClick, isNotesMode, highlightedNumber }) {
  const containerBgClass = isNotesMode ? 'bg-[var(--color-numpad-notes-bg)]' : 'bg-[var(--color-numpad-bg)]';
  
  return (
    <div className={`rounded-full p-1 flex justify-around items-center w-full transition-all duration-300 shadow-lg ${containerBgClass}`}>
      {Array.from({ length: 9 }).map((_, i) => {
        const num = i + 1;
        const isHighlighted = highlightedNumber === num;
        
        const baseButtonClass = 'w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center font-semibold text-3xl sm:text-4xl rounded-full focus:outline-none transition-all duration-200 transform active:scale-90';
        
        const highlightClass = isHighlighted ? 'text-[var(--color-accent)]' : 'text-[var(--color-numpad-text)]';
        const interactionClass = isHighlighted ? '' : 'hover:bg-[var(--color-numpad-hover-bg)] focus:bg-[var(--color-numpad-hover-bg)]';

        const buttonClasses = `${baseButtonClass} ${highlightClass} ${interactionClass}`;

        return (
          <button 
            key={num} 
            onClick={() => onNumberClick(num)} 
            className={buttonClasses}
            aria-label={`Enter number ${num}`}
            aria-pressed={isHighlighted}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}