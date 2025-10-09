import React, { useState, useEffect, useRef } from 'react';

function usePrevious(value) {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function Cell({ data, isSelected, isPeer, isHighlighted, isCorrect, onClick, isNotesMode, isAutoNotesEnabled, highlightedNumber, isHintPrimary, isHintSecondary, hintEffect, rowIndex, colIndex, className = '' }) {
  const { value, isInitial, isWrong, userNotes, autoNotes, eliminatedNotes } = data;
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPopAnimating, setIsPopAnimating] = useState(false);
  const prevValue = usePrevious(value);

  useEffect(() => {
    if (isWrong && value !== 0 && value !== prevValue) setIsAnimating(true);
    if (isCorrect && !isInitial && value !== 0 && value !== prevValue) setIsPopAnimating(true);
  }, [value, isWrong, isCorrect, isInitial, prevValue]);
  
  const handleAnimationEnd = () => { setIsAnimating(false); setIsPopAnimating(false); };

  const getCellClasses = () => {
    let backgroundVar, textVar, fontClass = '', hoverClass;
    if (isInitial) {
        fontClass = 'font-semibold';
        textVar = '--color-text-initial';
    } else if (isWrong) textVar = '--color-text-wrong';
    else {
      if (isCorrect) fontClass = 'font-semibold';
      textVar = '--color-text-user';
    }
    
    if (isSelected) {
      backgroundVar = '--color-cell-selected-bg';
    } else {
      hoverClass = 'hover:bg-[var(--color-cell-hover-bg)]';
      if (isHintPrimary) backgroundVar = '--color-hint-primary-bg';
      else if (isHintSecondary) backgroundVar = '--color-hint-secondary-bg';
      else if (isHighlighted && value !== 0) backgroundVar = '--color-cell-highlighted-bg';
      else if (isPeer) backgroundVar = '--color-cell-peer-bg';
      else backgroundVar = '--color-cell-bg';
    }

    const textClass = `text-[var(${textVar})]`;
    const backgroundClass = `bg-[var(${backgroundVar})]`;
    
    return ['aspect-square flex items-center justify-center text-2xl sm:text-3xl font-sans transition-all duration-200 cursor-pointer', backgroundClass, textClass, fontClass, hoverClass].filter(Boolean).join(' ');
  };

  const isHintGlowTarget = hintEffect?.type === 'cell-glow' && hintEffect.cell.row === rowIndex && hintEffect.cell.col === colIndex;
  const cellClasses = `${getCellClasses()} ${isAnimating ? 'animate-shake' : ''} ${isHintGlowTarget ? 'animate-hint-cell' : ''} ${className} ${isSelected ? 'z-10' : ''}`;
  const shouldShowNotesGrid = value === 0 && (userNotes.size > 0 || autoNotes.size > 0 || eliminatedNotes.size > 0);
  
  return (
    <div className={cellClasses} onClick={onClick} onAnimationEnd={handleAnimationEnd}>
      {value !== 0 ? (
        <span className={`${isPopAnimating ? 'animate-pop inline-block' : ''} transition-opacity duration-300 ${isNotesMode && !isInitial && !isCorrect ? 'opacity-70' : ''}`}>{value}</span>
      ) : shouldShowNotesGrid ? (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-px text-[10px] sm:text-xs leading-none">
          {Array.from({ length: 9 }).map((_, i) => {
            const num = i + 1;
            const isUserNote = userNotes.has(num), isAutoNote = autoNotes.has(num), isEliminationNote = eliminatedNotes.has(num);
            if (!isUserNote && !isAutoNote && !isEliminationNote) return <div key={i} />;
            
            const isNewlyEliminated = hintEffect?.type === 'note-pop' && hintEffect.eliminations.some(e => e.row === rowIndex && e.col === colIndex && e.num === num);
            let noteClass = '', fontWeightClass = '';

            if (isEliminationNote) {
              noteClass = 'text-[var(--color-text-wrong)]';
              fontWeightClass = 'font-semibold';
            } else if (isHighlighted && highlightedNumber === num) {
              noteClass = 'bg-[var(--color-note-highlighted-bg)] text-[var(--color-note-highlighted-text)] rounded-sm';
              fontWeightClass = 'font-bold';
            } else {
              if (isAutoNotesEnabled) noteClass = isUserNote ? 'text-[var(--color-text-user-note)]' : 'text-[var(--color-text-note)]';
              else noteClass = 'text-[var(--color-text-note)]';

              if (isNotesMode) fontWeightClass = 'font-bold';
              else if (isUserNote || !isAutoNotesEnabled) fontWeightClass = 'font-medium';
            }
            
            return <div key={i} className={`flex items-center justify-center transition-all duration-200 ${noteClass} ${fontWeightClass} ${isNewlyEliminated ? 'animate-pop':''}`}>{num}</div>;
          })}
        </div>
      ) : null}
    </div>
  );
}